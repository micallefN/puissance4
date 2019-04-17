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
let rooms = [];
// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    socket.emit('connection', function(){});

    socket.on('setPseudo', function(pseudo){
        socket.playerPseudo = pseudo;
    });

    socket.on('createRoom', function(room){
        socket.roomName = room;
        socket.join(room);
        let roomDetail = {
            player1 : socket.playerPseudo,
            room : socket.roomName,
            player1Ready: false,
            player2Ready: false
        }
        rooms.push(roomDetail);

        socket.broadcast.emit('getRooms', rooms);

        socket.emit('setWaitingRoom', roomDetail);
    });

    socket.on('joinRoom', function(room){
        socket.join(room);
        socket.roomName = room;
        let i;
        for(i = 0; i < rooms.length; i++){
            if(rooms[i].room === room){
                rooms[i].player2 = socket.playerPseudo;
                break;
            }
        }

        socket.broadcast.emit('getRooms', rooms);
        socket.in(socket.roomName).emit('setWaitingRoom', rooms[i]);
        socket.emit('setWaitingRoom', rooms[i]);

    });

    socket.on('askRooms', function(){
        socket.emit('getRooms', rooms);
    });

    socket.on('setReady', function(room){
        let i;
        for(i = 0; i < rooms.length; i++){
            if(rooms[i].room === room){
                if(socket.playerPseudo === rooms[i].player1){
                    rooms[i].player1Ready = true;
                } else {
                    rooms[i].player2Ready = true;
                }
                break;
            }
        }

        if(rooms[i].player1Ready === true && rooms[i].player2Ready === true){
            console.log('voilu');
            socket.in(socket.roomName).emit('launchGame', rooms[i]);
            socket.emit('launchGame', rooms[i]);
        } else {
            console.log('moche');
            socket.in(socket.roomName).emit('setWaitingRoom', rooms[i]);
            socket.emit('setWaitingRoom', rooms[i]);
        }


    });

    socket.on('message', function (message, blockedTable) {
        socket.broadcast.to(socket.roomName).emit('message', message, blockedTable);
    });
    socket.on('turn', function(playerTurn){
        socket.broadcast.to(socket.roomName).emit('turn', playerTurn);
    })

    socket.on('disconnect', function () {
        socket.broadcast.to(socket.roomName).emit('reset', true);

    })

    socket.on('animate', function(idButton, heightButton){
        socket.broadcast.to(socket.roomName).emit('animate', idButton, heightButton);
    })


});


server.listen(process.env.PORT || 8080);
