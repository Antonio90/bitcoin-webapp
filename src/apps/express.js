var express = require('express'),
    exphbs  = require('express-handlebars');

const fileConfig = require(require('path').join(__dirname, '..', 'config' , 'configurations'));
const config = fileConfig.config;

var app = express();

// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: 'src/views/layouts/',
    partialsDir: 'src/views/partials/'

});

app.set('views', require('path').join(__dirname, '..', 'views' ));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(express.static(require('path').join(__dirname, '..', 'public')));

app.get('/', function (req, res) {
    res.render('home', {
        title: 'Home page'
    });
});

app.get('/livedata', function (req, res) {
    res.render('liveData', {
        title: 'Live blockchain data'
    });
});

app.get('/infotransaction', function (req, res) {
    res.render('liveData', {
        title: 'Live blockchain data',
        hashTransaction: req.
    });
});

app.get('/lastgraph', function (req, res) {
    res.render('lastGraph', {
        title: 'Last blochchain graph'
    });
});

module.exports = {
    app: app
}