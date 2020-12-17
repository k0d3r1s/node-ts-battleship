"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("../config");
const player_1 = require("./player");
class Game {
    constructor(id, p1, p2) {
        this.id = id;
        this.current = Math.floor(Math.random() * 2);
        this.winner = null;
        this.status = config.status.progress;
        this.players = [new player_1.Player(p1), new player_1.Player(p2)];
    }
    getPlayer(player) {
        return this.players[player].id;
    }
    getWinner() {
        if (this.winner === null) {
            return null;
        }
        return this.players[this.winner].id;
    }
    getLoser() {
        if (this.winner === null) {
            return null;
        }
        return this.players[this.winner === config.players.player ? config.players.opponent : config.players.player].id;
    }
    switch() {
        this.current = this.current === config.players.player ? config.players.opponent : config.players.player;
    }
    abort(player) {
        this.status = config.status.gameover;
        this.winner = player === config.players.player ? config.players.opponent : config.players.player;
    }
    shoot(coordinate) {
        let opponent = this.current === config.players.player ? config.players.opponent : config.players.player, index = coordinate.y * config.grid.cols + coordinate.x;
        if (this.players[opponent].shots[index] === 0 && this.status === config.status.progress) {
            if (!this.players[opponent].shoot(index)) {
                this.switch();
            }
            if (this.players[opponent].remaining() <= 0) {
                this.status = config.status.gameover;
                this.winner = opponent === config.players.player ? config.players.opponent : config.players.player;
            }
            return true;
        }
        return false;
    }
    mark(index) {
        let opponent = this.current === config.players.player ? config.players.opponent : config.players.player;
        this.players[opponent].shots[index] = 1;
        return true;
    }
    state(player, owner) {
        return {
            turn: this.current === player,
            index: player === owner ? config.players.player : config.players.opponent,
            grid: this.getGrid(owner, player !== owner)
        };
    }
    getGrid(player, hide) {
        return {
            shots: this.players[player].shots,
            ships: hide ? this.players[player].getSunk() : this.players[player].ships
        };
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map