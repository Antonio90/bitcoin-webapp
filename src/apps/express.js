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
    partialsDir: 'src/views/partials/',
    helpers: {
        json : function(content) {
            return JSON.stringify(content);
        }
    }
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

app.get('/infotransaction', function (req, res, next ) {

    var transactionID = req.query.id || '';

    if(transactionID != ''){

        findTransaction(res, req, next, transactionID);

    } else {

        return next('No transaction id');

    }

});

app.get('/lastgraph', function (req, res, next) {
    findLastGraph(req,res,next);
});

app.get('/rankgraph', function (req, res, next) {
    findRankGraph(req,res,next);
});


app.use(function(err, req, res, next){
    res.status(404).render('errorPage' , {
            title: 'Page not found 404',
            error: err
    })
})

var findLastGraph = function(req, res,next){

    neo4jSession

        .run('MATCH (c:hash_pub)-[r:send]->(b:hash_pub) return c,r,b' ,
            '')

        .then(function (result) {

            var data = [];
            for(k in result.records){
                var record = result.records[k];
                d = {
                    source: record._fields[0],
                    relation: record._fields[1],
                    destination: record._fields[2]
                };
                data.push(d);
            }

            res.render('lastGraph', {
                title: 'Last graph',
                transaction: data
            });
            neo4jSession.close();

        })
        .catch(function (error) {
            console.log(error);
            neo4jSession.close();
            return next('Database Exception');
        });
}

var findRankGraph = function(req, res,next){

    neo4jSession

        .run('Match (a:has_rank)\n' +
            'Match (b:hash_pub)-[r:send]->(c)\n' +
            'where id(b) = toInt(a.referenceId)\n' +
            'SET b.pageRankValue = a.rank\n' +
            'return b,r,c',
            '')

        .then(function (result) {

            var data = [];
            for(k in result.records){
                var record = result.records[k];
                d = {
                    source: record._fields[0],
                    relation: record._fields[1],
                    destination: record._fields[2]
                };
                data.push(d);
            }

            res.render('rankGraph', {
                title: 'PageRank graph',
                transaction: data,
                pageRankNodes: getPageRankNodes(data)
            });
            neo4jSession.close();

        })
        .catch(function (error) {
            console.log(error);
            neo4jSession.close();
            return next('Database Exception');
        });
}


var findTransaction = function (res, req, next, transactionID){

    neo4jSession

        .run('MATCH (c)-[r{transactionHash: {transactionID} }]->(b) return c,r,b' ,
            {transactionID: transactionID})

        .then(function (result) {

            console.log(result);
            var data = [];
            var totalBTC = 0.0;
            for(k in result.records){
                var record = result.records[k];
                totalBTC += Number(record._fields[1].properties.value);
                d = {
                    source: record._fields[0],
                    relation: record._fields[1],
                    destination: record._fields[2]
                };
                data.push(d);
            }

            res.render('transactionInfo', {
                title: 'Info transaction ' + transactionID,
                hashTransaction: transactionID,
                transaction: data,
                totalBTC: totalBTC
            });
            neo4jSession.close();

        })
        .catch(function (error) {
            console.log(error);
            neo4jSession.close();
            return next('Database Exception');
        });
}

var getPageRankNodes = function(json) {


    var nodes = {};

    for(i in json){
        var transaction = json[i];
        nodes[transaction.source.properties.hash] || (nodes[transaction.source.properties.hash] = {hash: transaction.source.properties.hash, pageRankValue: transaction.source.properties.pageRankValue  });
        nodes[transaction.destination.properties.hash] || (nodes[transaction.destination.properties.hash] = {hash: transaction.destination.properties.hash, pageRankValue: transaction.destination.properties.pageRankValue  });
    }

    return nodes;
}


module.exports = {
    app: app
}