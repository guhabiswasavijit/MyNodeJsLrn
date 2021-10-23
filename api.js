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
    if(countries instanceof Array){
    	const table = new sql.Table('dbo.COUNTRY_STATE'); // or temporary table, e.g. #temptable
        table.create = true;
        table.columns.add('id', sql.Int, {nullable: false});
        table.columns.add('country', sql.VarChar(50), {nullable: true});
        table.columns.add('name', sql.VarChar(50), {nullable: true});
        table.columns.add('abbr', sql.VarChar(50), {nullable: true});
        table.columns.add('area', sql.VarChar(50), {nullable: true});
        table.columns.add('largest_city', sql.VarChar(50), {nullable: true});
        table.columns.add('capital', sql.VarChar(50), {nullable: true});
		for(var i =0 ; i < countries.length ; i++){
			if(typeof(countries[i]) != 'undefined'){				    
				var country  = countries[i];		    	   
                table.rows.add(country.id,country.country,country.name,country.abbr,country.area,country.largest_city,country.capital) ;
					
           }
       }
       console.log('Data:'+ JSON.stringify(table));
       sql.close();       
       sql.connect(setUp).then(function(){
	       const request = new sql.Request()
			request.bulk(table, (err, result) => {
			    if(err){console.log('Erroring:'+ err)}
			});
	    }).catch(function(err) {
	  		if (err)
	   		console.log('SQL Connection Error: ' + err);
	    });
	}
});
});

var server = app.listen(8081, function () {
   var host = server.address().address;
   var port = server.address().port;
   
   console.log("Example app listening at http://%s:%s", host, port);
});
