const express = require('express');
const app = express();
const tictac = require('./tictactoe.js');



app.use(express.static(__dirname + '/'));
app.listen(3000, function() {
    console.log('listening on 3000 ');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
}); 



app.get('/joinGame', (req, res) => {
    console.log("joinGame : Request : watch : " + JSON.stringify(req.query));
    res.json(onPlayerJoin(req.query.pName, req.query.gameId));
});

app.get('/createGame', (req, res) => {
    console.log("createGame : Request : watch : " + JSON.stringify(req.query));
    res.json(onCreateGame(req.query.pName, req.query.desc));
});

app.get('/getLiveGames', (req, res) => {
    res.json(getLiveGames());
});


app.post('/onmove', (req, res) => {
    console.log("Request : onmove : watch : " + JSON.stringify(req.query));

    res.json(onMove(req.query.gameId, req.query.yPoint, req.query.xPoint, req.query.playerSymbol));
});

app.get('/onpollgame', (req, res) => {
    res.json(pollGame(req.query.gameId));
});




app.locals.gameData = {};

function onMove(gameId, yPoint, xPoint, playerSymbol) {
    var game = app.locals.gameData[gameId];
    var sym = tictac.symbols[playerSymbol];
    if(game) {
        game.data = tictac.makeMove(xPoint, yPoint, sym, game.data);
        game.nextTurn = game.player1.symbol == playerSymbol ? game.player2.symbol : game.player1.symbol;
        var winner = tictac.isWin(game.data);
        switch(winner) {
            case -99 : {
                game.status = {"desc" : "Game Drawn", code : -99 };
                break;
            }
            case 1: {
                game.status = {"desc" : game.player1.name + " wins", code : 1};
                break;
            }
            case 0: {
                game.status = {"desc" : game.player2.name + " wins", code : 0};
                break;
            }
        }
    }



    return game;
}

function pollGame(gameId) {

    return app.locals.gameData[gameId];

}

function onPlayerJoin(pName, gameId) {

    var gData = app.locals.gameData;
    var game = {};

    if(gData[gameId]) {
        game = gData[gameId];
    }

    if(!game.playing) { // let this player join the game
        game.player2 = { 'name' : pName, 'symbol' : ( game.player1.symbol == 'X' ? 'O' : 'X' ) };
        game.data = tictac.initGame();
        game.playing = true; 
        game.status = {desc : 'Playing', code : -1 };
    } 

    return game;
}

function getLiveGames(){
    var gameKeys = Object.keys(app.locals.gameData); // Keys = unique game tokens created since application started
    var resp = [];
    gameKeys.forEach((key) => {
        var game = app.locals.gameData[key];
        resp.push({gameDesc : game.desc, player1 : game.player1, player2 : game.player2, token : key, playing : game.playing, status : game.status});
    });

    return resp;
}



function onCreateGame(pName, desc) {
    var gData = app.locals.gameData;
    var game = {};
    game.token = tictac.getUniqueToken();
    game.playing = false;
    game.player1 = { 'name' : pName, 'symbol' : 'X' };
    game.status = {desc : 'Waiting for +1', code : -2 };
    game.desc = desc;
    game.nextTurn = game.player1.symbol;
    gData[game.token] = game;
    return game;
}





