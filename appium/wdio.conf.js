exports.config = {
    runner: 'local',
    port: 4723,
    specs: [
        './tests/**/*.js'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        // By default we test the mobile web version using Chrome.
        // If testing an APK, replace browserName with:
        // 'appium:app': 'path/to/your/app.apk'
        browserName: 'chrome',
        'appium:newCommandTimeout': 240,
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://10.0.2.2:5000', // Android emulator localhost alias
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    appium: {
        command: 'appium',
        args: {
            relaxedSecurity: true,
            logLevel: 'info'
        }
    },
    framework: 'mocha',
    reporters: ['spec', ['json', {
        outputDir: './reports'
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    
    // Custom Hooks for reporting
    onComplete: function(exitCode, config, capabilities, results) {
        console.log('Tests completed. You can now run the Excel report generator.');
    }
}
