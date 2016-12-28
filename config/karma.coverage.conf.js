const path = require('path');

const base = require('./karma.conf.js');

const webpack = base.webpackConfig;
webpack.module.preLoaders = [
  {
    test: /\.js$/,
    include: path.resolve('lib/'),
    loader: 'istanbul-instrumenter',
  },
];
const reporters = base.reporters.concat(['coverage']);

const coverageReporter = {
  type: 'html',
  dir: '../.coverage',
};

const files = base.files.concat(base.helperGlobs).concat(base.unitGlobs).concat(
  base.integrationGlobs
);
const wp = ['webpack'];
const preprocessors = files.concat(base.srcGlobs).reduce((acc, key) => {
  acc[key] = wp;
  return acc;
}, {});

module.exports = function(config) {
  base(config);
  config.set({files, preprocessors, reporters, coverageReporter, webpack});
};
