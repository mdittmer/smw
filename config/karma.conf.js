// Karma configuration
// Generated on Wed Dec 28 2016 11:28:43 GMT-0500 (EST)

const execSync = require('child_process').execSync;

const FOAM_DIR = `${__dirname}/../node_modules/foam2-experimental`;

// Outputs ../node_modules/foam2-experimental/foam-bin.js
execSync(`node ${FOAM_DIR}/tools/build.js web`);

const basePath = `${__dirname}/../test`;
const files = [
  '../node_modules/foam2-experimental/foam-bin.js',
];
const reporters = ['progress'];

const configurator = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files,

    // list of files to exclude
    exclude: [],
    // exclude: [...] in sub-config


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters,

    // configure coverage reporter
    coverageReporter: {
      // TODO(markdittmer): Can't seem to get other coverage configurations to
      // work with istanbul-instrumenter webpack pre-loader.
      type: 'text',
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // start these browsers
    // available browser launchers:
    // https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // enable / disable watching file and executing tests whenever any file
    // changes
    autoWatch: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};

configurator.basePath = basePath;
configurator.files = files;
configurator.reporters = reporters;
configurator.srcGlobs = [
  '../lib/**/*.js',
];
configurator.helperGlobs = [
  'any/**/*-helper*.js',
  'browser/**/*-helper*.js',
];
configurator.unitGlobs = [
  'any/**/*-test*.js',
  'browser/**/*-test*.js',
];
configurator.integrationGlobs = [
  'any/**/*-integration*.js',
  'browser/**/*-integration*.js',
];
configurator.webpackConfig = {
  module: {
    loaders: [
      {
        test: /\.es6\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime'],
        },
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
};

module.exports = configurator;
