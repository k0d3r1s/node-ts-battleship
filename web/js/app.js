let config = {
    progress: 1,
    gameover: 2
};
const Game = (function() {
    function startFireworks(Fireworks, container) {
        const fireworks = new Fireworks(container, {
          maxRockets: 3, // max # of rockets to spawn
          rocketSpawnInterval: 150, // millisends to check if new rockets should spawn
          numParticles: 100, // number of particles to spawn when rocket explodes (+0-10)
          explosionMinHeight: 0.2, // percentage. min height at which rockets can explode
          explosionMaxHeight: 0.9, // percentage. max height before a particle is exploded
          explosionChance: 0.08 // chance in each tick the rocket will explode
        })
      
        fireworks.start()
    }
   
    let canvas = [],
        context = [],
        grid = [],
        width = 361,
        border = 1,
        rows = 10,
        space = (width - border * rows - border) / rows,
        turn = false,
        status,
        hover = { x: -1, y: -1 },
        player = 0,
        opponent = 1;
    canvas[player] = document.getElementById("canvas-grid1");
    canvas[opponent] = document.getElementById("canvas-grid2");
    context[player] = canvas[player].getContext("2d");
    context[opponent] = canvas[opponent].getContext("2d");
    canvas[opponent].addEventListener("mousemove", function(e) {
        let pos = coordinates(e, canvas[opponent]);
        hover = square(pos.x, pos.y);
        draw(1);
    });
    canvas[opponent].addEventListener("mouseout", function(e) {
        hover = { x: -1, y: -1 };
        draw(1);
    });
    canvas[opponent].addEventListener("click", function(e) {
        if (turn) {
            let pos = coordinates(e, canvas[1]);
            shot(square(pos.x, pos.y));
        }
    });
    function square(x, y) {
        return {
            x: Math.floor(x / (width / rows)),
            y: Math.floor(y / (width / rows))
        };
    }
    function coordinates(event, canvas) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: Math.round(((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width),
            y: Math.round(((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height)
        };
    }
    function init() {
        let i;
        status = config.progress;
        grid[player] = {
            shots: [rows * rows],
            ships: []
        };
        grid[opponent] = {
            shots: [rows * rows],
            ships: []
        };
        for (i = 0; i < rows * rows; i++) {
            grid[player].shots[i] = 0;
            grid[opponent].shots[i] = 0;
        }
        $("#turn-status")
            .removeClass("my-turn")
            .removeClass("opponent-turn")
            .removeClass("winner")
            .removeClass("loser");
        draw(player);
        draw(opponent);
    }
    function update(player, state) {
        grid[player] = state;
        draw(player);
        generateRemainingShipsHtml();
    }
    function doTurn(state) {
        if (status !== config.gameover) {
            turn = state;
            if (turn) {
                $("#turn-status")
                    .removeClass("opponent-turn")
                    .addClass("my-turn")
                    .html("Select one blue field where you want to shoot!");
            } else {
                $("#turn-status")
                    .removeClass("my-turn")
                    .addClass("opponent-turn")
                    .html("Waiting for opponent to shoot!");
            }
        }
    }
    function gameover(winner) {
        status = config.gameover;
        turn = false;
        if (winner) {
            startFireworks(Fireworks, document.getElementById('game'))
            $("#turn-status")
                .removeClass("opponent-turn")
                .removeClass("my-turn")
                .addClass("winner")
                .html('You won! <a href="#" class="btn-leave-game">Play again</a>.');
        } else {
            $("#turn-status")
                .removeClass("opponent-turn")
                .removeClass("my-turn")
                .addClass("loser")
                .html('You lost. <a href="#" class="btn-leave-game">Play again</a>.');
        }
        $(".btn-leave-game").click(leave);
    }
    function draw(index) {
        fixAround(index);
        drawSquares(index);
        drawShips(index);
        drawMarks(index);
    }
    function drawSquares(index) {
        let x, y;
        context[index].fillStyle = "#232323";
        context[index].fillRect(0, 0, width, width);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < rows; j++) {
                x = j * (space + border) + border;
                y = i * (space + border) + border;
                context[index].fillStyle = "#4477FF";
                if (j === hover.x && i === hover.y && index === 1 && grid[index].shots[i * rows + j] === 0 && turn) {
                    context[index].fillStyle = "#00FF00";
                }
                context[index].fillRect(x, y, space, space);
            }
        }
    }
    function drawShips(index) {
        let ship, shipWidth, shipLength;
        context[index].fillStyle = "#424247";
        for (let i = 0; i < grid[index].ships.length; i++) {
            ship = grid[index].ships[i];
            let x = ship.coordinate.x * (space + border) + border;
            let y = ship.coordinate.y * (space + border) + border;
            shipWidth = space;
            shipLength = space * ship.size + border * (ship.size - 1);
            if (!ship.vertical) {
                context[index].fillRect(x, y, shipLength, shipWidth);
            } else {
                context[index].fillRect(x, y, shipWidth, shipLength);
            }
        }
    }
    function drawMarks(index) {
        let squareX, squareY;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < rows; j++) {
                squareX = j * (space + border) + border;
                squareY = i * (space + border) + border;
                if (grid[index].shots[i * rows + j] === 1) {
                    context[index].fillStyle = "#2A2A96";
                    context[index].fillRect(squareX, squareY, space, space);
                } else if (grid[index].shots[i * rows + j] === 2) {
                    context[index].fillStyle = "#E33812";
                    context[index].fillRect(squareX, squareY, space, space);
                }
            }
        }
    }
    function fixAround(index) {
        let ship;
        for (let i = 0; i < grid[index].ships.length; i++) {
            ship = grid[index].ships[i];
            if (ship.hits >= ship.size) {
                for (let x = 0; x < rows; x++) {
                    for (let y = 0; y < rows; y++) {
                        if (x == ship.coordinate.x && y == ship.coordinate.y) {
                            for (let n = 0; n < ship.size; n++) {
                                let number;
                                if (ship.vertical) {
                                    number = (y + n) * rows + x;
                                } else {
                                    number = y * rows + (x + n);
                                }
                                mark(index, number);
                            }
                        }
                    }
                }
            }
        }
    }
    function mark(index, element) {
        if (turn) {
            getAdjacent(element).forEach(function(element) {
                if (grid[index].shots[element] == 0) {
                    grid[index].shots[element] = 1;
                    markIndex(element);
                }
            });
        }
    }
    function getAdjacent(index) {
        let adjacent = [];
        adjacent.push(index - rows, index + rows);
        if (index % rows !== 0) {
            adjacent.push(index - 1);
            adjacent.push(index - 1 - rows);
            adjacent.push(index - 1 + rows);
        }
        if ((index + 1) % rows !== 0) {
            adjacent.push(index + 1);
            adjacent.push(index + 1 - rows);
            adjacent.push(index + 1 + rows);
        }
        return adjacent;
    }

    /**
     * Get opponent ships array
     *
     * @returns {[]|[IShip]|[Ship]|[Ship]|*}
     */
    function getSunkOpponentShips() {
        return grid[opponent].ships;
    }

    /**
     *
     * @returns {{'1': number, '2': number, '3': number, '4': number, '5': number}}
     */
    function getShipsRemaining() {
        const ships = {
            1: 1,
            2: 1,
            3: 1,
            4: 1,
            5: 1,
        };

        getSunkOpponentShips().map((ship) => {
            if (ships[ship.size] > 0) {
                ships[ship.size]--;
            }
        });

        return ships;
    }

    /**
     * Generate & update remaining ships html on FE
     */
    function generateRemainingShipsHtml() {
        let html = '';
        const ships = getShipsRemaining();
        Object.entries(ships).map((ship) => {
            const [key, value] = ship;

            html += `<p>Size ${key} left: <strong>${value}</strong></p>`;
        });
        $('#remaining-ships').html(html);
    }

    return {
        init: init,
        update: update,
        doTurn: doTurn,
        gameover: gameover
    };
})();