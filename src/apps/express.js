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


app.use(function(err, req, res, next){
    res.status(404).render('errorPage' , {
            title: 'Page not found 404',
            error: err
    })
})


var findLastGraph = function(req, res,next){

    neo4jSession

        .run('MATCH (n:hash_pub)-[r:send]->(b:hash_pub) return n,r,b' ,
            '')

        .then(function (result) {

            var allGraph = result;

            neo4jSession.run(
                'MATCH (n:has_rank),(b:hash_pub)\n' +
                'WHERE id(b) = n.referenceId\n' +
                'return b{.*, rank: n.rank} order by n.rank desc','') .then(function(result){

                var data = [];
                for(k in allGraph.records){
                    var record = allGraph.records[k];
                    d = {
                        source: record._fields[0],
                        relation: record._fields[1],
                        destination: record._fields[2]
                    };
                    data.push(d);
                }


                var rankNodes = addPageRankNode(result);


                res.render('lastGraph', {
                    title: 'Last graph',
                    transaction: data,
                    pageRankNodes: rankNodes
                });
                neo4jSession.close();

            })

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


var addPageRankNode = function(data) {
    var rankNodes = [];
    var nodes = [];
    for(k in data.records) {
        if (!rankNodes[data.records[k]._fields[0].hash])
            nodes.push({ hash: data.records[k]._fields[0].hash, pageRank: data.records[k]._fields[0].rank });
    }
    return nodes;
}


module.exports = {
    app: app
}