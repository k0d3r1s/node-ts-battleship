"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("../config");
const ship_1 = require("../object/ship");
class Player {
    constructor(id) {
        this.id = id;
        let max = config.grid.rows * config.grid.cols;
        this.shots = [max];
        this.grid = [max];
        this.ships = [new ship_1.Ship(config.ships.map[1])];
        for (let i = 0; i < max; i++) {
            this.shots[i] = 0;
            this.grid[i] = -1;
        }
        if (!this.random()) {
            return;
        }
    }
    shoot(index) {
        if (this.grid[index] >= 0) {
            this.ships[this.grid[index]].hits++;
            this.shots[index] = 2;
            return true;
        }
        else {
            this.shots[index] = 1;
            return false;
        }
    }
    getSunk() {
        let sunk = [];
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].sunk()) {
                sunk.push(this.ships[i]);
            }
        }
        return sunk;
    }
    remaining() {
        let count = 0;
        for (let i = 0; i < this.ships.length; i++) {
            if (!this.ships[i].sunk()) {
                count++;
            }
        }
        return count;
    }
    random() {
        this.ships.splice(0, this.ships.length);
        for (let index = 0; index < config.ships.map.length; index++) {
            let ship = new ship_1.Ship(config.ships.map[index]);
            if (!this.place(ship, index)) {
                return false;
            }
            this.ships.push(ship);
        }
        return true;
    }
    place(ship, index) {
        let gridIndex, xMax, yMax;
        for (let i = 0; i < config.ships.max; i++) {
            ship.vertical = Math.random() > 0.5;
            xMax = !ship.vertical ? config.grid.cols - ship.size + 1 : config.grid.cols;
            yMax = !ship.vertical ? config.grid.rows : config.grid.rows - ship.size + 1;
            ship.coordinate.x = Math.floor(Math.random() * xMax);
            ship.coordinate.y = Math.floor(Math.random() * yMax);
            if (!this.overlap(ship) && !this.adjacent(ship)) {
                gridIndex = ship.coordinate.y * config.grid.cols + ship.coordinate.x;
                for (let j = 0; j < ship.size; j++) {
                    this.grid[gridIndex] = index;
                    gridIndex += !ship.vertical ? 1 : config.grid.cols;
                }
                return true;
            }
        }
        return false;
    }
    overlap(ship) {
        let index = ship.coordinate.y * config.grid.cols + ship.coordinate.x;
        for (let i = 0; i < ship.size; i++) {
            if (this.grid[index] >= 0) {
                return true;
            }
            index += !ship.vertical ? 1 : config.grid.cols;
        }
        return false;
    }
    adjacent(ship) {
        let x1 = ship.coordinate.x - 1, y1 = ship.coordinate.y - 1, x2 = !ship.vertical ? ship.coordinate.x + ship.size : ship.coordinate.x + 1, y2 = !ship.vertical ? ship.coordinate.y + 1 : ship.coordinate.y + ship.size;
        for (let i = x1; i <= x2; i++) {
            if (i < 0 || i > config.grid.cols - 1)
                continue;
            for (let j = y1; j <= y2; j++) {
                if (j < 0 || j > config.grid.rows - 1)
                    continue;
                if (this.grid[j * config.grid.cols + i] >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map