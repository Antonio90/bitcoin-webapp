const webSocket = require('ws');

const fileConfig = require(require('path').join(__dirname, '..', 'config' , 'configurations'));
const config = fileConfig.config;

var wss = new webSocket.Server({
    port: config.webSocket.port
});

wss.on('connection', function (ws) {
    let id = Math.random();
    console.log('New client with id: ' + id);

    ws.on('message', function(message){
        console.log('Received from ' + id + ' message: ' + message);
    });

    ws.on('close', function () {
        console.log('Exit client ' + id);
    });

});

wss.sendBrodcast = function(message){
  wss.clients.forEach( function (client) {
     client.send(message);
  });
};

module.exports = {
    wss: wss
};