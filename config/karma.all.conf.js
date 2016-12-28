const base = require('./karma.conf.js');
const webpack = base.webpackConfig;
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
  config.set({files, preprocessors, webpack});
};
