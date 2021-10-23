var http = require('http');
var RestClient = require('node-rest-client').Client; 
const { pool, sql } = require('./db');
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

    	try{
		    pool.then(conn => {
					var myTransaction = new sql.Transaction(conn);
					myTransaction.begin(function (error) {
						try{
							var rollBack = false;
							myTransaction.on('rollback',function (aborted) {rollBack = true;});
							var dbInst = new sql.Request(myTransaction);
							if(countries instanceof Array){
								var qryStr = "";
								for(var i =0 ; i < countries.length ; i++){
									if(typeof(countries[i]) != 'undefined'){										
										var country  = countries[i];										
										qryStr += "INSERT INTO dbo.COUNTRY_STATE(id,country,name,abbr,area,largest_city,capital) VALUES ("+country.id+",'"+country.country+"','"+country.name+"','"+country.abbr+"','"+country.area+"','"+country.largest_city+"','"+country.capital+"');";
										console.log('ID: ' + countries[i].id);
									}									
								}
								console.log("QRYSTRING:"+ qryStr);
								dbInst.query(qryStr,function(err, result) {
										if (err) {console.log("Erroring:"+ err);
										   if (!rollBack) {myTransaction.rollback(function (err) {console.log(err);})}
										} 
										else {
											myTransaction.commit().then(function (result) {console.log('Data is inserted successfully!');}).catch(function (err) {console.dir('Error in transaction commit ' + err);});
										}
										});
							}
						}catch(error){
							console.log('ERRORING:'+ error);
						}
					});
				});
    	}
    	catch(err){
    		console.log('ERROR:'+ err);
    	}
    });
});

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("Example app listening at http://%s:%s", host, port);
});
