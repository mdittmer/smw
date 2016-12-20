const CopyWebpackPlugin = require('copy-webpack-plugin');
const _ = require('lodash');
const glob = require('glob');
const webpack = require('webpack');

const OUTPUT_DIR = `${__dirname}/../static/bundle`;
const EXTENSION_OUTPUT_DIR = `${__dirname}/../extension/bundle`;
const FOAM_DIR = `${__dirname}/../node_modules/foam2-experimental`;

function getPath(e) {
  return `${__dirname}/../main/${e.inDir}/${e.name}.js`
}

// Tests as per jasmine_*.json.
function testGlob(dir, suffix) {
  return glob.sync(`${__dirname}/../test/${dir}/**/*-${suffix}*.js`);
}
const anyHelper =
        testGlob('any', 'helper').concat([
          `${__dirname}/../node_modules/foam2-experimental/test/helpers/testcontext.js`
        ]);
const anyUnit = testGlob('any', 'test');
const anyIntegration =
        testGlob('any', 'integration');
const tests = {
  unit: {
    node: testGlob('node', 'test').concat(anyUnit),
    browser: testGlob('browser', 'test').concat(anyUnit),
  },
  integration: {
    node: testGlob('node', 'integration').concat(anyIntegration),
    browser: testGlob('browser', 'integration').concat(anyIntegration),
  },
  helpers: {
    node: testGlob('node', 'helper').concat(anyHelper),
    browser: testGlob('browser', 'helper').concat(anyHelper),
  }
};

const entries = [
  {inDir: '.', name: 'SMW.es6', getPath},
  {inDir: '.', name: 'extension_background.es6', getPath},
  {inDir: '.', name: 'extension_content_script.es6', getPath},
  {inDir: '.', name: 'devtools_page.es6', getPath},
  // {name: 'node_unit', getPath: () => tests.unit.node},
  {name: 'browser_unit', getPath: () => tests.unit.browser},
  // {name: 'node_integration', getPath: () => tests.integration.node},
  {name: 'browser_integration', getPath: () => tests.integration.browser},
  // {name: 'node_helpers', getPath: () => tests.helpers.node},
  {name: 'browser_helpers', getPath: () => tests.helpers.browser},
];

const isExternal = (module) => {
  const userRequest = module.userRequest;

  if (typeof userRequest !== 'string') {
    return false;
  }

  return userRequest.indexOf('bower_components') >= 0 ||
    userRequest.indexOf('node_modules') >= 0 ||
    userRequest.indexOf('libraries') >= 0;
};

module.exports = {
  context: __dirname,
  entry: _.zipObject(
    entries.map(e => e.name),
    entries.map(e => e.getPath(e))
  ),
  output: {
    path: OUTPUT_DIR,
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.es6\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        },
      },
    ],
  },
  plugins: [
    // Keep vendors code in a separate bundle.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      minChunks: function(module) {
        return isExternal(module);
      },
    }),
    // Copy extension-related bundles into extension output dir.
    {
      apply: compiler => compiler.plugin('done', () => {
        const config = [
          {from: `${FOAM_DIR}/foam-bin.js`, to: EXTENSION_OUTPUT_DIR},
          {from: `${OUTPUT_DIR}/vendors.bundle.js`, to: EXTENSION_OUTPUT_DIR},
          {
            from: `${OUTPUT_DIR}/extension_content_script.es6.bundle.js`,
            to: EXTENSION_OUTPUT_DIR,
          },
          {
            from: `${OUTPUT_DIR}/extension_background.es6.bundle.js`,
            to: EXTENSION_OUTPUT_DIR,
          },
          {
            from: `${OUTPUT_DIR}/devtools_page.es6.bundle.js`,
            to: EXTENSION_OUTPUT_DIR,
          },
        ];

        const execSync = require('child_process').execSync;

        execSync(`node ${FOAM_DIR}/tools/build.js web`);

        const fs = require('fs');

        for (const entry of config) {
          const from = entry.from;
          const rawTo = `${entry.to}/${entry.from.split('/').pop()}`;
          const to = entry.from.match(/bundle[.]js/) ?
                  rawTo : rawTo.replace('.js', '.bundle.js');
          const r = fs.createReadStream(from);
          const w = fs.createWriteStream(to);
          r.on('error', error => console.error(`Error reading from ${from}:`, error));
          w.on('error', error => console.error(`Error writing to ${to}`, error));
          r.on('end', () => console.log(`End read-for-copy: ${from}`));
          w.on('end', () => console.log(`End write-for-copy: ${to}`));
          r.pipe(w);
        }
      }),
    },
  ],
};
