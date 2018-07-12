let config = {};

if (process.env.NODE_ENV === 'development') { // Sviluppo
    config = {
        appName: 'Bitcoin FrontEnd',
        locate:'it',
        pathLog4js: './log',
        log4js: {
            appenders: {
                out: {
                    type: 'console'
                },
                access: {
                    type: 'dateFile',
                    filename: 'log/access',
                    pattern: '_yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                    compress: true,
                    layout: {
                        type: 'messagePassThrough'
                    },
                    category: 'http'
                },
                app: {
                    type: 'file',
                    filename: 'log/app.log',
                    maxLogSize: 52428800, // 50MB
                    backups: 5
                },
                errors: {
                    type: 'file',
                    filename: 'log/errors.log',
                    maxLogSize: 52428800, // 50MB
                    backups: 5
                },
                error: {
                    type: 'logLevelFilter',
                    level: 'ERROR',
                    appender: 'errors'
                },
                'no-http-app': {
                    type: 'categoryFilter',
                    exclude: 'http',
                    appender: 'app'
                },
                'no-http-out': {
                    type: 'categoryFilter',
                    exclude: 'http',
                    appender: 'out'
                }
            },
            categories: {
                default: {
                    appenders: ['no-http-out', 'access', 'no-http-app', 'error'], level: 'info'
                }
            }
        },
        kafka: {
            host: '127.0.0.1',
            port: '2181',
            topic: 'transaction-topic'
        },
        webSocket: {
            port: 9087
        }
    };
}


if (process.env.NODE_ENV === 'production') { // Produzione
    config = {
        appName: 'Bitcoin FrontEnd',
        locate: 'it',
        pathLog4js: './log',
        log4js: {
            appenders: {
                out: {
                    type: 'console'
                },
                access: {
                    type: 'dateFile',
                    filename: 'log/access',
                    pattern: '_yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                    compress: true,
                    layout: {
                        type: 'messagePassThrough'
                    },
                    category: 'http'
                },
                app: {
                    type: 'file',
                    filename: 'log/app.log',
                    maxLogSize: 52428800, // 50MB
                    backups: 5
                },
                errors: {
                    type: 'file',
                    filename: 'log/errors.log',
                    maxLogSize: 52428800, // 50MB
                    backups: 5
                },
                error: {
                    type: 'logLevelFilter',
                    level: 'ERROR',
                    appender: 'errors'
                },
                'no-http-app': {
                    type: 'categoryFilter',
                    exclude: 'http',
                    appender: 'app'
                },
                'no-http-out': {
                    type: 'categoryFilter',
                    exclude: 'http',
                    appender: 'out'
                }
            }
        },
        kafka: {
            host: '127.0.0.1',
            port: '2181',
            topic: 'transaction-topic'
        },
        webSocket: {
            port: 9087
        }
    };
}

module.exports.config = config;
