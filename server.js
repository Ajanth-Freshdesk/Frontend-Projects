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
    res.json(onCreateGame(req.query.pName, req.query.symbol, req.query.desc));
});

app.get('/getLiveGames', (req, res) => {
    console.log("createGame : Request : watch : " + JSON.stringify(req.query));
    res.json(getLiveGames());
});


app.post('/onmove', (req, res) => {
    console.log("Request : onmove : watch : " + JSON.stringify(req.query));

    res.json(onMove(req.query.gameId, req.query.yPoint, req.query.xPoint, req.query.playerSymbol));
});

app.post('/onpollgames', (req, res) => {
    console.log("Request : onpollgames : watch : " + JSON.stringify(req.query));

    res.json(pollGames(req.query.gameIds));
});




app.locals.gameData = {};

function onMove(gameId, yPoint, xPoint, playerSymbol) {
    var game = app.locals.gameData[gameId];
    var sym = tictac.symbols[playerSymbol];

    if(game) {
        game.data = tictac.makeMove(xPoint, yPoint, sym, game.data);
    }

    return game;
}

function pollGames(gameIds) {

    var games = [];
    gameIds.split(",").forEach((id) => {
        games.push(app.locals.gameData[id]);
    });

    return games;

}

function onPlayerJoin(pName, gameId) {

    var gData = app.locals.gameData;
    var game = {};
    var response = {};

    if(gData[gameId]) {
        game = gData[gameId];
    }

    if(!game.playing) { // let this player join the game
        game.player2 = { 'name' : pName, 'symbol' : ( game.player1.symbol == 'X' ? 'O' : 'X' ) };
        game.data = tictac.initGame();
        game.playing = true; 
        game.status = 'Started';
    } 

    response.data = game;

    return response;
}

function getLiveGames(){
    var gameKeys = Object.keys(app.locals.gameData); // Keys = unique game tokens created since application started
    var resp = [];
    gameKeys.forEach((key) => {
        var game = app.locals.gameData[key];
        resp.push({gameDesc : game.desc, player1 : game.player1, player2 : game.player2, token : key, playing : game.playing});
    });

    return resp;
}



function onCreateGame(pName, symbol, desc) {
    var gData = app.locals.gameData;
    var game = {};
    game.token = tictac.getUniqueToken();
    game.playing = false;
    game.player1 = { 'name' : pName, 'symbol' : symbol };
    game.status = {desc : 'Not Started', code : -1 };
    game.desc = desc;
    gData[game.token] = game;
    return game;
}





