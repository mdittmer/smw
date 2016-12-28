const base = require('./karma.coverage.conf.js');

const singleRun = false;
const autoWatch = true;

module.exports = function(config) {
  base(config);
  config.set({singleRun, autoWatch});
};
