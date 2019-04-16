var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });

});

// Chargement de socket.io
var io = require('socket.io').listen(server);


let first = true;
let room = '';

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    if (first) {
        first = false;
        room = makeid(10);
        socket.emit('turn', true);
        socket.emit('color', 'red');
        socket.join(room);
        socket.joinedRoom = room

    } else {
        first = true;
        socket.emit('turn', false);
        socket.emit('color', 'orange');
        socket.join(room);
        socket.joinedRoom = room

    }

    socket.on('message', function (message, blockedTable) {
        socket.broadcast.to(socket.joinedRoom).emit('message', message, blockedTable);
    });
    socket.on('turn', function(playerTurn){
        socket.broadcast.to(socket.joinedRoom).emit('turn', playerTurn);
    })

    socket.on('disconnect', function () {
        socket.broadcast.to(socket.joinedRoom).emit('reset', true);

    })

});


server.listen(process.env.PORT || 8080);
