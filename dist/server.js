"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const config = require("./config");
const game_1 = require("./object/game");
const user_1 = require("./object/user");
const coordinate_1 = require("./object/coordinate");
const dotenv = require("dotenv");
dotenv.config();
let port = process.env.PORT || 7666;
app.set("port", port);
let users = {};
let counter = 1;
const http = require("http").Server(app);
app.use(express.static(__dirname + "/../web"), function (req, res) {
    console.log(req);
});
http.listen(port, function () {
    console.log("listening on *:" + port);
});
let io = require("socket.io")(http);
io.on("connection", function (socket) {
    console.log(new Date().toISOString() + " ID " + socket.id + " connected.");
    console.log(socket.handshake.query.name);
    socket.join("waiting");
    socket.on("shot", function (square) {
        square = JSON.parse(square);
        console.log(square);
        let coordinate = new coordinate_1.Coordinate(square.x, square.y);
        let game = users[socket.id].game, opponent;
        if (game !== null) {
            if (game.current === users[socket.id].player) {
                opponent = game.current === config.players.player ? config.players.opponent : config.players.player;
                if (game.shoot(coordinate)) {
                    io.to(socket.id).emit("update", game.state(users[socket.id].player, opponent));
                    io.to(game.getPlayer(opponent)).emit("update", game.state(opponent, opponent));
                    check(game);
                }
            }
        }
    });
    socket.on("mark", function (index) {
        let game = users[socket.id].game, opponent;
        if (game !== null) {
            if (game.current === users[socket.id].player) {
                opponent = game.current === config.players.player ? config.players.opponent : config.players.player;
                if (game.mark(index)) {
                    io.to(socket.id).emit("update", game.state(users[socket.id].player, opponent));
                    io.to(game.getPlayer(opponent)).emit("update", game.state(opponent, opponent));
                }
            }
        }
    });
    socket.on("leave", function () {
        if (users[socket.id].game !== null) {
            leave(socket);
            socket.join("waiting");
            join();
        }
    });
    socket.on("disconnect", function () {
        console.log(new Date().toISOString() + " ID " + socket.id + " disconnected.");
        leave(socket);
        delete users[socket.id];
    });
    join();
});
function join() {
    let players = clients("waiting");
    if (players.length >= 2) {
        let game = new game_1.Game(counter++, players[config.players.player].id, players[config.players.opponent].id);
        players[config.players.player].leave("waiting");
        players[config.players.opponent].leave("waiting");
        players[config.players.player].join("game" + game.id);
        players[config.players.opponent].join("game" + game.id);
        users[players[config.players.player].id] = new user_1.User(game, 0);
        users[players[config.players.opponent].id] = new user_1.User(game, 1);
        io.to("game" + game.id).emit("join", game.id);
        io.to(players[config.players.player].id).emit("update", game.state(0, 0));
        io.to(players[config.players.opponent].id).emit("update", game.state(1, 1));
        console.log(new Date().toISOString() + " " + players[config.players.player].id + " and " + players[config.players.opponent].id + " have joined game ID " + game.id);
    }
}
function leave(socket) {
    if (typeof users[socket.id] !== "undefined") {
        if (users[socket.id].game !== null) {
            console.log(new Date().toISOString() + " ID " + socket.id + " left game ID " + users[socket.id].game.id);
            socket.broadcast.to("game" + users[socket.id].game.id).emit("notification", {
                message: "Opponent has left the game"
            });
            if (users[socket.id].game.status !== config.status.gameover) {
                users[socket.id].game.abort(users[socket.id].player);
                check(users[socket.id].game);
            }
            socket.leave("game" + users[socket.id].game.id);
            delete users[socket.id];
            io.to(socket.id).emit("leave");
        }
    }
}
function check(game) {
    if (game.status === config.status.gameover) {
        console.log(new Date().toISOString() + " Game ID " + game.id + " ended.");
        io.to(game.getWinner()).emit("gameover", true);
        io.to(game.getLoser()).emit("gameover", false);
    }
}
function clients(room) {
    let clients = [];
    for (let id in io.sockets.adapter.rooms[room].sockets) {
        clients.push(io.sockets.connected[id]);
    }
    return clients;
}
//# sourceMappingURL=server.js.map