#!/bin/env node
var config = require('config');
var connect = require('connect');

var app = connect()
//  .use(function(req, res){
//    if (0) { res.end(__dirname + '\n'); }
//  })
  .use(connect.static(__dirname + '/pub'));

app.listen(config.server.port, config.server.ip);

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


