var kafka = require('kafka-node');
const wss = require(require('path').join(__dirname, 'websocket')).wss;

const fileConfig = require(require('path').join(__dirname, '..', 'config' , 'configurations'));
const config = fileConfig.config;

const kafkaBroker = config.kafka.host + ":" + config.kafka.port;
console.info("Kafka broker connectiong..." + kafkaBroker);

const client = new kafka.Client(kafkaBroker);
const topics = [
    {
        topic: config.kafka.topic
    }
];
const options = {
    autoCommit: true,
    encoding: 'utf8',
    groupId: 'bitcoin-webapp' //Math.random().toString()
};

const consumer = new kafka.HighLevelConsumer(client, topics, options);

consumer.on('message', function(message){
    console.log('Incoming message: ' + message.value.toString());
    wss.sendBrodcast(message.value.toString());
});

consumer.on('error', function(err){
    console.log(err);
});

process.on('SIGINT', function () {
   consumer.close(true,function () {
       process.exit();
   });
});


module.exports = {
    consumer: consumer
}
