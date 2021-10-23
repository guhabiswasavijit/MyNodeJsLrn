var http = require('http');
var RestClient = require('node-rest-client').Client; 
var sql = require("mssql");
var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
  // Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;
var setUp = {
    server: 'localhost',
    database: 'LRN_SQL_SERVER',
    user: 'sa',
    password: 'Lotus2ibm',
    port: 1433
};
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okay');
	var client = new RestClient({
        proxy:{
            host:"web-proxy.corp.hpecorp.net",
            port: 8080,
            tunnel:false // use direct request to proxy
	}});
	client.registerMethod("jsonMethod", "http://services.groupkt.com/state/get/IND/all", "GET");
    client.methods.jsonMethod(function (data, response) {
    var countries = data.RestResponse.result;
    console.log('BODY: ' + JSON.stringify(countries));
    sql.close();       
    sql.connect(setUp).then(function(){
        console.log("got database connection:");
        if(countries instanceof Array){
           for(var i =0 ; i < countries.length ; i++){
              if(typeof(countries[i]) != 'undefined'){            
                var country  = countries[i];
                console.log("CNTY:"+ JSON.stringify(country));
                const request = new sql.Request();             
                request.input('id', sql.Int, country.id);
                request.input('country', sql.VarChar(50), country.country);
                request.input('name', sql.VarChar(50), country.name);
                request.input('abbr', sql.VarChar(50), country.abbr);
                request.input('area', sql.VarChar(50), country.area);
                request.input('largest_city', sql.VarChar(50), country.largest_city);
                request.input('capital', sql.VarChar(50), country.capital);
                request.execute('dbo.INSERT_COUNTRY_DATA', (err, result) => {
                  console.log(result.output) // key/value collection of output values                  
                });
              }
            }
        }
    });
});
});

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("Example app listening at http://%s:%s", host, port);
});
