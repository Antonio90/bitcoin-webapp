const neo4j = require('neo4j-driver').v1;
const fileConfig = require(require('path').join(__dirname, '..', 'config' , 'configurations'));
const config = fileConfig.config;

const uri = "bolt://" + config.neo4j.host + ":" + config.neo4j.port;
const driver = neo4j.driver(uri); //, neo4j.auth.basic(user, password));

/*const personName = 'Alice';
const resultPromise = session.run(
    'CREATE (a:Person {name: $name}) RETURN a',
    {name: personName}
);*/

driver.onCompleted = function () {
    console.info('Connected to Neo4j at ' + uri);
};

driver.onError = function (error) {
  console.error('Connection to neo4j refused!', error);
  process.exit(1);
};

process.on('SIGINT', function () {
    console.info('Closing connection with neo4j');
    driver.close();
});


var app = {
    driver: driver
}

module.exports = {
    app: app
}