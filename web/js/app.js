let config = {
    progress: 1,
    gameover: 2
};

const Fireworks = window.Fireworks;

const fwc = document.getElementById('fireworks');
const pwc = document.getElementById('game-panel');

const options = {
    maxRockets: 3, // max # of rockets to spawn
    rocketSpawnInterval: 150, // millisends to check if new rockets should spawn
    numParticles: 100, // number of particles to spawn when rocket explodes (+0-10)
    explosionMinHeight: 0.2, // percentage. min height at which rockets can explode
    explosionMaxHeight: 0.9, // percentage. max height before a particle is exploded
    explosionChance: 0.08, // chance in each tick the rocket will explode,
    width: 425,
    height: 424
};


const Game = (function() {   
    let canvas = [],
        context = [],
        grid = [],
        border = 1,
        rows = 10,
        cols = 15,
        width = 36*cols+1,
        height = 36*rows+1,
        spaceHeight = (height - border * rows - border) / rows,
        spaceWidth = (width - border * cols - border) / cols,
        turn = false,
        status,
        hover = { x: -1, y: -1 },
        player = 0,
        opponent = 1;
        fireworks = new Fireworks(fwc, options);
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
            let pos = coordinates(e, canvas[opponent]);
            console.log(pos);
            let sq = square(pos.x, pos.y);
            console.log(sq);
            shot(sq);
        }
    });
    function square(x, y) {
        return {
            x: Math.floor(x / (width / cols)),
            y: Math.floor(y / (height / rows))
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
        fireworks.stop();
        pwc.style.display = 'block';
        fwc.innerHTML = '';
        console.log('init');

        canvas[player].width = width;
        canvas[player].height = height;

        canvas[opponent].width = width;
        canvas[opponent].height = height;

        status = config.progress;
        grid[player] = {
            shots: [rows * cols],
            ships: []
        };
        grid[opponent] = {
            shots: [rows * cols],
            ships: []
        };
        for (i = 0; i < rows * cols; i++) {
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
            pwc.style.display = 'none';
            fireworks = new Fireworks(fwc, options);
            fireworks.start();
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
        console.log(grid[index].shots.length);
        fixAround(index);
        drawSquares(index);
        drawShips(index);
        drawMarks(index);
    }
    function drawSquares(index) {
        let x, y;
        context[index].fillStyle = "#232323";
        context[index].fillRect(0, 0, width, height);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                x = j * (spaceWidth + border) + border;
                y = i * (spaceHeight + border) + border;
                context[index].fillStyle = "#4477FF";
                if (j === hover.x && i === hover.y && index === 1 && grid[index].shots[i * cols + j] === 0 && turn) {
                    context[index].fillStyle = "#00FF00";
                }
                context[index].fillRect(x, y, spaceWidth, spaceHeight);
            }
        }
    }
    function drawShips(index) {
        let ship, shipWidth, shipLength;
        context[index].fillStyle = "#424247";
        for (let i = 0; i < grid[index].ships.length; i++) {
            ship = grid[index].ships[i];
            let x = ship.coordinate.x * (spaceWidth + border) + border;
            let y = ship.coordinate.y * (spaceHeight + border) + border;
            shipWidth = spaceWidth;
            shipLength = spaceWidth * ship.size + border * (ship.size - 1);
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
            for (let j = 0; j < cols; j++) {
                squareX = j * (spaceWidth + border) + border;
                squareY = i * (spaceHeight + border) + border;
                if (grid[index].shots[i * cols + j] === 1) {
                    context[index].fillStyle = "#2A2A96";
                    context[index].fillRect(squareX, squareY, spaceWidth, spaceHeight);
                } else if (grid[index].shots[i * cols + j] === 2) {
                    context[index].fillStyle = "#E33812";
                    context[index].fillRect(squareX, squareY, spaceWidth, spaceHeight);
                }
            }
        }
    }
    function fixAround(index) {
        let ship;
        for (let i = 0; i < grid[index].ships.length; i++) {
            ship = grid[index].ships[i];
            console.log(ship, ship.hits >= ship.size);
            if (ship.hits >= ship.size) {
                for (let x = 0; x < cols; x++) {
                    for (let y = 0; y < rows; y++) {
                        if (x == ship.coordinate.x && y == ship.coordinate.y) {
                            for (let n = 0; n < ship.size; n++) {
                                let number;
                                if (ship.vertical) {
                                    number = (y + n) * cols + x;
                                } else {
                                    number = y * cols + (x + n);
                                }
                                console.log(x, y, number);
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
        console.log(index);
        let adjacent = [];
        adjacent.push(index - cols, index + cols);
        if (index % cols !== 0) {
            adjacent.push(index - 1);
            adjacent.push(index - 1 - cols);
            adjacent.push(index - 1 + cols);
        }
        if ((index + 1) % rows !== 0) {
            adjacent.push(index + 1);
            adjacent.push(index + 1 - cols);
            adjacent.push(index + 1 + cols);
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