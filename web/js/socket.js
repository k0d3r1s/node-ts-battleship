let socket = io({transports: ['websocket'], upgrade: false});

$(function() {
    socket.on("connect", function() {
        console.log("Connected to server.");
        $("#disconnected").hide();
        $("#room").show();
    });

    socket.on("disconnect", function() {
        console.log("Disconnected from server.");
        $("#room").hide();
        $("#game").hide();
        $("#disconnected").show();
    });

    socket.on("join", function(id) {
        Game.init();
        $("#disconnected").hide();
        $("#room").hide();
        $("#game").show();
        $("#game-number").html(id);
    });

    socket.on("update", function(state) {
        Game.doTurn(state.turn);
        Game.update(state.index, state.grid);
    });

    socket.on("gameover", function(winner) {
        Game.gameover(winner);
    });

    socket.on("leave", function() {
        $("#game").hide();
        $("#room").show();
    });
});

function leave(e) {
    e.preventDefault();
    socket.emit("leave");
}

function shot(square) {
    socket.emit("shot", JSON.stringify(square));
}

function markIndex(index) {
    socket.emit("mark", index);
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}