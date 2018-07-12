var kafka = require('kafka-node');
const wss = require(require('path').join(__dirname, 'websocket')).wss;

const fileConfig = require(require('path').join(__dirname, '..', 'config' , 'configurations'));
const config = fileConfig.config;

const client = new kafka.Client(config.kafka.host + ":" + config.kafka.port);
const topics = [
    {
        topic: config.kafka.topic
    }
];
const options = {
    autoCommit: true,
    encoding: 'utf8',
    groupId: Math.random().toString()
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