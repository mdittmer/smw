let config = require('./webpack.dev.config.es6.js');
config.module = config.module || {};
// Do not use other loaders (such as Babel, which would rewrite our source!).
config.module.loaders = [{
  test: /\.js$/,
  loader: 'eslint',
  exclude: /(node_modules|bower_components|library)/,
}];
module.exports = config;
