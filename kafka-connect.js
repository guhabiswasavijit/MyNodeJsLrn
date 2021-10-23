const { Kafka } = require('kafkajs')
var fs = require('fs');
var util = require('util');
var async = require("async");
var os = require("os");

var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
  // Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;
console.log('platform : ' + os.platform());
console.log('New line : ' + os.EOL);

const kafka = new Kafka({
  clientId: 'kafka-demo',
  brokers: ['kafka-server:9092']
})
const producer = kafka.producer();
fs.readFile('C:\\SampleData\\employees.csv', 'utf8', function(err, data){
    console.log(data);
    var jsonArray = data.split(os.EOL);
    console.log("Got Json Array:"+jsonArray);
    for(var i =0 ; i < jsonArray.length ; i++){
       if(typeof(jsonArray[i]) != 'undefined'){
            var dataStr = JSON.stringify(jsonArray[i]);
            console.log("Sending data:"+dataStr);
            sendData(dataStr);
       }
    }
});
//console.log("Got Json Array:"+jsonArray);


console.log('readFile called');

async function sendData(dataStr){
  console.log("About to send data"+dataStr);
  await producer.connect()
  await producer.send({
    topic: 'Kafka-topic',
    messages: [
      { value: 'Sending message' },
    ],
  });
 }
