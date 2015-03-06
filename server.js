#!/bin/env node
var config = require('config');
var connect = require('connect');
var https = require('https');
var fs = require('fs');
console.log(config);

var options = {
    key:    fs.readFileSync(__dirname + '/ssl/startssl.key.nopass'),
    cert:   fs.readFileSync(__dirname + '/ssl/startssl.crt.append'),
    ca:     fs.readFileSync(__dirname + '/ssl/ca.pem')
};
// oreore
//var options = {
//    key:    fs.readFileSync(__dirname + '/ssl/server_key.pem'),
//    cert:   fs.readFileSync(__dirname + '/ssl/server_crt.pem')
//};

https.createServer(options, function(req, res){
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


