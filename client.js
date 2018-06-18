var canPollLiveGames = true;

function initGame() {
      pollLiveGames();
}

var currentPlayerInfo = {};
currentPlayerInfo.games = {};
currentPlayerInfo.playingGames = {};
var viewSymbols = { "1" : "X", "0" : "O", "-99" : ""};

function pollLiveGames() {
      if(!canPollLiveGames) return;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              console.log("Poll output : " + this.responseText);
              populateLiveGames(JSON.parse(this.responseText));
              setTimeout(pollLiveGames, 2500);
            }
      };
      xhttp.open("GET", "/getLiveGames", true);
      xhttp.send();
}


function onHostGame(){
      var div = document.querySelector("#create-game");
      div.style.display = div.style.display == "none" ? "block" : "none";
}

function hostGame(){
      var pName = document.querySelector("#player1").value;
      var desc = document.querySelector("#desc").value;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              console.log("Created game : " + this.responseText);
              document.querySelector("#create-game").style.display = "none";
              var newGame = JSON.parse(this.responseText);
              currentPlayerInfo.playingGames[newGame.token] = {playingAs : newGame.player1, symbol : newGame.player1.symbol};
              populateCurrentGame(newGame); 
              resetAndShowNewGame();             
                       
            }
          };
      xhttp.open("GET", "/createGame?pName=" + pName + "&desc=" + desc, true);
      xhttp.send();
}

function onJoinGame(gameId, ele) {

      if(Object.keys(currentPlayerInfo.games).indexOf(gameId) >= 0) {
            return;
      }
      var joinAsDiv = document.querySelector("#join-div");
      
      if(joinAsDiv) {
            joinAsDiv.parentNode.removeChild(joinAsDiv);
            var visiblility = joinAsDiv.style.display;
      } 

      joinAsDiv = document.createElement("div");
      joinAsDiv.setAttribute("id","join-div");
      joinAsDiv.innerHTML = '<labe>Join as :  </labe><input type="text" class="input-text" id="join-as"/>';
      joinAsDiv.innerHTML += '<button class="btn-fdesk btn-danger btn-sm" onclick="joinGame()">Join</button>';
      joinAsDiv.style.display = visiblility == "none" ? "block" : "none";
      ele.parentNode.insertBefore(joinAsDiv, ele.nextSibling);
      currentPlayerInfo.joiningGame = gameId;
 }
 
 function joinGame() {

      var joinAs = document.querySelector("#join-as").value;

      var joinAsDiv = document.querySelector("#join-div");
      joinAsDiv.style.display = "none";

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              console.log("Joined game : " + this.responseText);
              var newGame = JSON.parse(this.responseText);
              currentPlayerInfo.playingGames[newGame.token] = {playingAs : newGame.player2, symbol : newGame.player2.symbol};
              populateCurrentGame(newGame); 
              resetAndShowNewGame();                  
            }
          };
      xhttp.open("GET", "/joinGame?pName=" + joinAs + "&gameId=" + currentPlayerInfo.joiningGame, true);
      xhttp.send();
 }

function onWatchGame(gameId) {
      currentPlayerInfo.activeGameToken = gameId;
      resetAndShowNewGame();
}

function resetAndShowNewGame() {

      clearInterval(currentPlayerInfo.activeIntervalId);// clear old interval, so old polling method stops
      currentPlayerInfo.games[currentPlayerInfo.activeGameToken] = null; // reset so that UI refreshes
      updateCurrentGame(); // to fix the 2.5sec latency in showing the first time
      currentPlayerInfo.activeIntervalId = setInterval(updateCurrentGame, 2500);  
}

function updateCurrentGame() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                  console.log("updated game : " + this.responseText);
                  var newGame = {};

                  if(this.responseText && this.responseText.length > 0){
                        newGame = JSON.parse(this.responseText);
                  }

                  populateCurrentGame(newGame);              
            }
          };
      xhttp.open("GET", "/onpollgame?gameId=" + currentPlayerInfo.activeGameToken, true);
      xhttp.send();
}

function populateCurrentGame(newGame) {
      document.querySelector("#board").style.display = "block";
      console.log("begin populateCurrentGame");
      if(!newGame || !newGame.token) return;
      var game = currentPlayerInfo.games[currentPlayerInfo.activeGameToken];
      if(game && game.token == newGame.token && JSON.stringify(game) == JSON.stringify(newGame)) {
            console.log("No Updates on current game : " + game.token);
      } else {
            currentPlayerInfo.games[newGame.token] = newGame;
            currentPlayerInfo.activeGameToken = newGame.token;
            console.log("Received new Updates on current game : " + newGame.token);
            var data = newGame.data;
            if(data) {
                  updateGridView(data);
            }
            showGameMiscDetails(newGame);

            if(newGame.status && newGame.status.code !== -1 && newGame.playing) { // game is over
                  clearInterval(currentPlayerInfo.activeIntervalId);// clear interval, so we dont need to keep polling, since the game is over
            }
      } 
}

function showGameMiscDetails(game){
      var gmDesc = document.querySelector(".game-header .game-desc");
      gmDesc.innerText = game.desc;
      var gmTurn = document.querySelector(".game-header .game-turn");
      gmTurn.innerText = "";
      if(!currentPlayerInfo.playingGames[game.token] && game.status.code == -1) {
            gmTurn.innerText = (game.nextTurn == game.player1.symbol ? game.player1.name : game.player2.name ) + "'s turn";
      } else if(currentPlayerInfo.playingGames[game.token] && game.nextTurn == currentPlayerInfo.playingGames[game.token].symbol && game.status.code == -1) {
            gmTurn.innerText = "Your turn";
      } else if(game.status.code == -1) {
            var player = currentPlayerInfo.playingGames[game.token].playingAs;
            gmTurn.innerText = (player.name == game.player1.name ? game.player2.name : game.player1.name ) + "'s turn";
      }

      var gmStatus = document.querySelector(".game-header .game-status");
      gmStatus.innerText = game.player1.name + "("+game.player1.symbol+") vs ";
      if(game.playing) {
            gmStatus.innerText += game.player2.name + "("+game.player2.symbol + ") ";
      } else {
            gmStatus.innerText += " ? ";
      }

      gmStatus.innerText += game.status.desc;
      
      var gameTable = document.querySelector("table.game");
      gameTable.style.background = "#fff";
      if(game.status.code == 1 || game.status.code == 0) {
            gameTable.style.background = "#26c26f";
      } else if (game.status.code == -99) {
            gameTable.style.background = "#fec108";
      }
      

}

function updateGridView(data) {
      var trs = document.querySelectorAll("#board table.game tr");
      for(var i =0; i < 3; i++) {
            var tds = trs[i].querySelectorAll("td");
            for(var j=0; j < 3; j++) {
                  tds[j].innerText = viewSymbols[data[i][j]];
                  
            }
      }
}

var existingGames = [];

function onmove(yIndex, xIndex, ele) {
      var gm = currentPlayerInfo.games[currentPlayerInfo.activeGameToken];
      if(gm && currentPlayerInfo.playingGames[gm.token] && gm.playing && gm.status.code == -1) {
            // user is part of game and can play
            if(gm.nextTurn == currentPlayerInfo.playingGames[gm.token].symbol) {
                  // player's turn , grant move
                  ele.innerText = gm.nextTurn;
                  console.log("move granted ");
                  var xhttp = new XMLHttpRequest();
                  xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                              console.log("updated game : " + this.responseText);

                              var newGame = {};
                              if(this.responseText && this.responseText.length > 0) {
                                    JSON.parse(this.responseText);
                              }

                              populateCurrentGame(newGame);              
                        }
                  };
                  xhttp.open("POST", "/onmove?gameId=" + gm.token + "&yPoint=" + yIndex + "&xPoint=" + xIndex + "&playerSymbol=" + gm.nextTurn, true);
                  xhttp.send();
                  gm.nextTurn = "";
                  return;
            }
      }

      console.log("move not granted!!");
      
}

function populateLiveGames(gameList) {

      var newKeys = gameList.map(element => ({value : element.token, name : element.playing}));
      var existingKeys = existingGames.map(element => ({value : element.token, name : element.playing}));
      var nogames = document.querySelector("#no-games");

      if(gameList.length == 0) {
            nogames.style.display = "block";
      } else {
            nogames.style.display = "none";
      }


      if(JSON.stringify(newKeys) == JSON.stringify(existingKeys)) { //Vulnerable because if order changes, I'm messed
            return;
      }

      var ulTag = document.querySelector("#available-games");
      ulTag.innerHTML = "";
      


      gameList.forEach((game) => {
            var liHtml = "<li>";
            var desc = '<div class="game-desc">'+game.gameDesc+'</div>';
            var plCount = game.player2 ? '(2/2)' : '(1/2)';
            var players = '<div class="game-players">'+ game.player1.name +' <span class="players">' + plCount + '</span></div>';
            var clk = game.playing ? 'onWatchGame(\''+game.token + '\')' : 'onJoinGame(\''+game.token + '\', this)';
            var playingStr = "";
            if(game.playing) {
                  playingStr = "<div class='playing-icon' title='playing'></div>"; // show the green circle
            }
            var action = '';

            liHtml = '<li onclick="'+ clk +'">'; 

            liHtml += desc + players + action + playingStr + "</li>";
            ulTag.insertAdjacentHTML("beforeend",liHtml);                 
      });
      existingGames = gameList;
}









window.onload = initGame;