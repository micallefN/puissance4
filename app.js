var http = require('http');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end('hello');
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

let player1 = '';
let player2 = '';

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    if (player1 === '') {
        player1 = socket.id;
        socket.emit('turn', true);
        socket.emit('color', 'red');

    } else if (player2 === '' && socket.id !== player1) {
        player2 = socket.id;
        socket.emit('turn', false);
        socket.emit('color', 'orange');

    }

    socket.on('message', function (message, blockedTable) {
        socket.broadcast.emit('message', message, blockedTable);
    });
    socket.on('turn', function(playerTurn){
        socket.broadcast.emit('turn', playerTurn);
    })

    socket.on('disconnect', function () {
        socket.broadcast.emit('reset', true);
        if (socket.id === player1) {
            player1 = '';
        } else {
            player2 = '';
        }
    })
});


server.listen(8080);
