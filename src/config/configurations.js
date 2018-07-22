let config = {};

if (process.env.NODE_ENV === 'development') { // Sviluppo
    config = {
        appName: 'Bitcoin Webapp',
        locate:'it',
        kafka: {
            host: '127.0.0.1',
            port: '2181',
            topic: 'transaction-topic'
        },
        webSocket: {
            port: 9087
        },
        neo4j: {
            host: '127.0.0.1',
            port: '7687'
        }
    };
}


if (process.env.NODE_ENV === 'production') { // Produzione
    config = {
        appName: 'Bitcoin Webapp',
        locate: 'it',
        kafka: {
            host: '127.0.0.1',
            port: '2181',
            topic: 'transaction-topic'
        },
        webSocket: {
            port: 9087
        },
        neo4j: {
            host: '127.0.0.1',
            port: '7687'
        }
    };
}

module.exports.config = config;
