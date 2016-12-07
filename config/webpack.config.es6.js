const _ = require('lodash');
const glob = require('glob');
const webpack = require('webpack');

function getPath(e) {
  return `${__dirname}/../lib/${e.inDir}/${e.name}.js`
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
  {inDir: '.', name: 'main', getPath},
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
    path: `./static/bundle`,
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
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      minChunks: function(module) {
        return isExternal(module);
      }
    }),
  ],
};
