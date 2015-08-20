#!/bin/env node
var config = require('config');
var connect = require('connect');
var http = require('http');
var https = require('https');
var fs = require('fs');
console.log(config);

if (config.isDev === false) {
  http.createServer(function (req, res) {
    res.writeHead(301, {'Location': 'https://'+ config.app.host + req.url});
    res.end();
  }).listen(80, config.app.ip);
}
  var options = {
      key:    fs.readFileSync(__dirname + '/' + config.ssl.key),
      cert:   fs.readFileSync(__dirname + '/' + config.ssl.cert)
  };
  if(config.ssl.ca){options.ca = fs.readFileSync(__dirname + '/' + config.ssl.ca);}

var server = https.createServer(options, function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end( fs.readFileSync(__dirname + ( (req.url === "/") ? '/index.html' : '/vchat.html')));
}).listen(config.app.port, config.app.ip);
 
var resource = connect().use(connect.static(__dirname + '/pub'));
https.createServer(options,resource).listen(config.resource.port, config.resource.ip);




