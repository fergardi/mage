module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-spec-reporter'),
      require('karma-coverage'),
      // require('karma-scss-preprocessor'),
      require('karma-sonarqube-unit-reporter'),
      // require('karma-firefox-launcher'),
    ],
    client: {
      clearContext: false,
      jasmine: {
        random: false,
      },
    },
    files: [
      // { pattern: 'src/styles/styles.scss' },
    ],
    preprocessors: {
      'src/app/**/*.ts': ['coverage'],
      // 'src/styles/styles.scss': ['scss'],
    },
    scssPreprocessor: {
      options: {
        // importer: require('node-sass-tilde-importer'),
      },
    },
    sonarQubeUnitReporter: {
      sonarQubeVersion: 'LATEST',
      outputFile: 'coverage/sonar.xml',
      overrideTestDescription: true,
      testPath: './src',
      testPaths: ['./src'],
      testFilePattern: '.spec.ts',
      useBrowserName: false
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcov', subdir: 'lcov' },
        { type: 'cobertura', subdir: '.', file: 'cobertura.xml' },
        { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
        { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
        { type: 'text', subdir: '.', file: 'text.txt' },
        { type: 'text-summary', subdir: '.', file: 'text-summary.txt' },
        { type: 'text-summary', subdir: '.' }, // to show in console
      ]
    },
    reporters: ['spec', 'sonarqubeUnit', 'coverage'], // kjhtml, progress, coverage, spec, dots, sonarqubeUnit
    specReporter: {
      suppressSkipped: true, // do not print information about skipped tests
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true,
    restartOnFileChange: true,
    browsers: ['ChromeHeadless'], // TODO firefox
    captureTimeout: 120000,
    browserDisconnectTimeout : 120000,
    browserDisconnectTolerance : 1,
    browserNoActivityTimeout : 120000,
    customLaunchers: {
      FirefoxHeadless: {
        base: 'FirefoxNightly',
        flags: [
            '-headless',
        ]
      },
      ChromeDebugger: {
        base: 'Chrome',
        flags: [
          '--remote-debugging-address=127.0.0.1',
          '--remote-debugging-port=9333',
          "--disable-session-crashed-bubble",
          "--disable-infobars",
        ],
        debug: true
      },
      ChromeTester: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--enable-logging',
          '--no-default-browser-check',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-popup-blocking',
          '--disable-translate',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-device-discovery-notifications',
          '--remote-debugging-address=127.0.0.1',
          '--remote-debugging-port=9222',
          '--disable-web-security',
        ]
      }
    }
  });
};
