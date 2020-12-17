import { IGame } from "interface/igame";
import * as config from "../config";
import { Player } from "./player";
import { ICoordinate } from "interface/icoordinate";

export class Game implements IGame {
    public id: number;
    public current: number;
    public winner: number | null;
    public status: number;
    public players: Player[];

    constructor(id: number, p1: string, p2: string) {
        this.id = id;
        this.current = Math.floor(Math.random() * 2);
        this.winner = null;
        this.status = config.status.progress;
        this.players = [new Player(p1), new Player(p2)];
    }

    getPlayer(player: number) {
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

    abort(player: number) {
        this.status = config.status.gameover;
        this.winner = player === config.players.player ? config.players.opponent : config.players.player;
    }

    shoot(coordinate: ICoordinate) {
        let opponent = this.current === config.players.player ? config.players.opponent : config.players.player,
            index = coordinate.y * config.grid.cols + coordinate.x;

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

    mark(index: number) {
        let opponent = this.current === config.players.player ? config.players.opponent : config.players.player;
        this.players[opponent].shots[index] = 1;

        return true;
    }

    state(player: number, owner: number) {
        return {
            turn: this.current === player,
            index: player === owner ? config.players.player : config.players.opponent,
            grid: this.getGrid(owner, player !== owner)
        };
    }

    getGrid(player: number, hide: boolean) {
        return {
            shots: this.players[player].shots,
            ships: hide ? this.players[player].getSunk() : this.players[player].ships
        };
    }
}
