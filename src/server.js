const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(require('./apps/express').app);

require('./apps/kafka').consumer;


app.listen(port, function () {
    console.log('express-handlebars example server listening on: ' + port);
});

module.exports = app;