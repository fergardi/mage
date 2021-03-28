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
      require('karma-scss-preprocessor'),
      require('karma-sonarqube-unit-reporter'),
    ],
    client: {
      clearContext: false
    },
    files: [
      { pattern: 'src/styles/styles.scss' },
    ],
    preprocessors: {
      'src/app/**/*.ts': ['coverage'],
      'src/styles/styles.scss': ['scss'],
    },
    scssPreprocessor: {
      options: {
        importer: require('node-sass-tilde-importer'),
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
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
