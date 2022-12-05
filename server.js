const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// app.use(express.static(__dirname + "/css"));

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

server.lastPlayderID = 0; // Keep track of the last id assigned to a new player

var gameData = [];

var roomData = {
    players: {},
    scores: {
        player1: 0,
        player2: 0,
    },
};
var players = {};
var scores = {
    player1: 0,
    player2: 0,
};
var gameStop = true;

//added logic to listen for connections and disconnections.
io.on("connection", function (socket) {
    console.log("a user connected: ", socket.id);

    let _isFirstPlayer = checkPosition(socket.id);
    let _totalTime = 60;

    // server side code

    socket.on("createRoom", function (roomData) {
        console.log(socket.rooms);
        socket.join(roomData.gameId);
        console.log("Room", roomData.gameId, "IS CREATED...");
        console.log(socket.rooms);
    });
    socket.on("joinRoom", function (roomData) {
        //if there is room already available.. then

        // check .. if there are players available...
        //if less than 2 players are there only join ...
        //else... emit to the client.. he cannot join ...
        //client ma chai ... if cannot join vanni socket le emit gareko cha vane... scene of cannot join

        console.log(
            "To join ",
            roomData.gameId,
            "there are ",
            io.sockets.adapter.rooms.get(roomData.gameId) &&
                io.sockets.adapter.rooms.get(roomData.gameId).size
        );
        // socket.join(roomData.gameId);
        var numClients =
            io.sockets.adapter.rooms.get(roomData.gameId) &&
            io.sockets.adapter.rooms.get(roomData.gameId).size != undefined
                ? io.sockets.adapter.rooms.get(roomData.gameId).size
                : 0;

        console.log("Number of clients", numClients);

        console.log("For second person ", socket.rooms);
        if (numClients === 1) {
            console.log("YOU CAN JOIN");
        } else {
            console.log("SERVER DOESNOT EXIST OR ALREADY FULL");
            //emit that.... server doesnt exist.. or the server is full
        }

        console.log("Room", roomData.gameId, "IS joined...");
    });

    players[socket.id] = {
        playerId: socket.id,
        isFirstPlayer: _isFirstPlayer,
        xPosition: 0,
    };
    // send the players object to the new player
    socket.emit("currentPlayers", players);

    // update all other players of the new player
    socket.broadcast.emit("newPlayer", players[socket.id]);

    let globalTimer;
    let foodTimer;

    if (Object.keys(players).length == 2) {
        gameStop = false;
        _totalTime = 60;
    } else {
        gameStop = true;
    }
    //timer
    if (Object.keys(players).length >= 2 && !gameStop && _totalTime > 0) {
        globalTimer = setInterval(() => {
            io.emit("timeLeft", _totalTime);
            // socket.broadcast.emit("timeLeft", _totalTime);

            _totalTime--;
            if (_totalTime < 0) {
                clearInterval(globalTimer);
                io.emit("stopGame", scores);
                // socket.broadcast.emit("stopGame", scores);
                gameStop = true;
            }
        }, 1000);
        let placement = [
            [100, -100],
            [250, -250],
            [400, -400],
        ];
        foodTimer = setInterval(() => {
            let _rand = Math.floor(Math.random() * placement.length);
            let _x = placement[_rand];
            let isGreenBall = Math.random() < 0.75;
            _x.map((xCoordinate) => {
                io.emit("ballDropped", xCoordinate, isGreenBall, players);
            });
            if (gameStop) {
                clearInterval(foodTimer);
            }
        }, 120);
    }

    // when a player disconnects, remove them from our players object
    socket.on("disconnect", function () {
        console.log("user disconnected: ", socket.id);
        delete players[socket.id];
        clearInterval(globalTimer);
        // emit a message to all players to remove this player
        io.emit("playerDisconnected", socket.id);
        server.lastPlayderID--;
    });

    // when a player moves, update the player data
    socket.on("trackPlayerMovement", function (_xPosition) {
        players[socket.id].xPosition = _xPosition;
        // emit a message to all players about the player that moved

        socket.broadcast.emit("playerMoved", players[socket.id]);
        // console.log("playerMovement of ", socket.id, _xPosition);
    });

    socket.on("ballCollected", function (gameId, _score) {
        if (players[socket.id].isFirstPlayer) {
            scores.player1 = _score;
        } else {
            scores.player2 = _score;
        }
        io.to(gameId).emit("scoreUpdated", scores);
    });
});

server.listen(8081, function () {
    // Listens to port 8081
    console.log("Listening on " + server.address().port);
});

function checkPosition(socketId) {
    //If someone joins first time in the game
    if (Object.keys(players).length == 0) {
        return true;
    }
    //But what if someone joins and leave....
    //Check objects... if someone is already true at firstPosition... send false.. else true
    let _toSend = true;
    Object.keys(players).forEach(function (id) {
        if (players[id].isFirstPlayer) {
            _toSend = false;
        }
    });

    return _toSend;
}

// all sockets in the "chat" namespace
// const ids = await io.of("/chat").allSockets();

// return all Socket instances in the "room1" room of the "admin" namespace
// const sockets = await io.of("/admin").in("room1").fetchSockets();

//Emits an event to all connected clients in the given namespace.
// const chat = io.of("/chat");
// chat.emit("an event sent to all connected clients in chat namespace");

// // client side code
// var socket = io.connect();
