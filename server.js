#!/bin/env node
var config = require('config');
var connect = require('connect');
var http = require('http');
var https = require('https');
var fs = require('fs');
console.log(config);

if (config.isDev === false) {
  http.createServer(function (req, res) {
    res.writeHead(301, {'Location': 'https://syno.in' + req.url});
    res.end();
  }).listen(80, config.app.ip);
}
//var index_filename = __dirname + '/index.html';
//var vchat_filename = __dirname + '/vchat.html';
//var index = fs.readFileSync(index_filename);
//var vchat = fs.readFileSync(vchat_filename);
//fs.watch(index_filename);

var options = {
    key:    fs.readFileSync(__dirname + '/ssl/startssl.key.nopass'),
    cert:   fs.readFileSync(__dirname + '/ssl/startssl.crt.append'),
    ca:     fs.readFileSync(__dirname + '/ssl/ca.pem')
};
var server = https.createServer(options, function(req, res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end( fs.readFileSync(__dirname + ( (req.url === "/") ? '/index.html' : '/vchat.html')));
}).listen(config.app.port, config.app.ip);

var resource = connect().use(connect.static(__dirname + '/pub'));
https.createServer(options,resource).listen(config.resource.port, config.resource.ip);


/*
var server = http.createServer(app);
var io     = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    var ip = socket.handshake.headers['x-forwarded-for'] ||
             socket.handshake.address.address;

    socket.on('join', function (data) {
      console.log(data);
    });

//  socket.emit('init', { hello: 'world' });

});
*/

// app.listen(80, "210.152.137.233");
// app.listen(80);
// server.listen(80);


