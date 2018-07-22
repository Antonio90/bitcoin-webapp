var express = require('express'),
    exphbs  = require('express-handlebars');
var neo4j = require(require('path').join(__dirname, 'neo4jDriver')).app;

const fileConfig = require(require('path').join(__dirname, '..', 'config' , 'configurations'));
const config = fileConfig.config;

var app = express();

var neo4jDriver = neo4j.driver;
var neo4jSession = neo4jDriver.session();

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

    var transactionID = req.query.id || '';

    if(transactionID != ''){

        findTransaction(res, transactionID);

    } else {

        res.render('errorPage' ,{
            title: 'Page not found 404'
        })

    }

});

app.get('/lastgraph', function (req, res) {
    res.render('lastGraph', {
        title: 'Last blochchain graph'
    });
});


var findTransaction = function (res, transactionID){

    neo4jSession

        .run('MATCH (c)-[r{transactionHash: {transactionID} }]->(b) return c,r,b' ,
            {transactionID: transactionID})

        .then(function (result) {

            console.log(result);
            var data = result.records.map(function(record){
                    return  {
                        source: record._fields[0],
                        relation: record._fields[1],
                        destination: record._fields[2]
                    }
                });

            res.render('transactionInfo', {
                title: 'Live blockchain data',
                hashTransaction: transactionID,
                transaction: data
            });
            neo4jSession.close();

        })
        .catch(function (error) {
            console.log(error);
            res.render('noTransaction', {
                title: 'No transaction found'
            });
            neo4jSession.close();
        });
}

module.exports = {
    app: app
}