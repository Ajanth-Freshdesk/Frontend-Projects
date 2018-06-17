var canPollLiveGames = true;

function initGame() {
      pollLiveGames();
}

var currentPlayerInfo = {};
currentPlayerInfo.games = {};

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
             
              populateCurrentGame(newGame); 
              resetAndShowNewGame();             
                       
            }
          };
      xhttp.open("GET", "/createGame?pName=" + pName + "&desc=" + desc, true);
      xhttp.send();
}

function onWatchGame(gameId) {
      currentPlayerInfo.activeGameToken = gameId;
      resetAndShowNewGame();
}

function resetAndShowNewGame() {
      clearInterval(currentPlayerInfo.activeIntervalId);  // clear old interval, so old polling method stops
      updateCurrentGame(); // to fix the 2.5sec latency in showing the first time
      currentPlayerInfo.activeIntervalId = setInterval(updateCurrentGame, 2500);  
}

function updateCurrentGame() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              console.log("updated game : " + this.responseText);
              var newGame = JSON.parse(this.responseText);
              populateCurrentGame(newGame);              
            }
          };
      xhttp.open("GET", "/onpollgame?gameId=" + currentPlayerInfo.activeGameToken, true);
      xhttp.send();
}

function populateCurrentGame(newGame) {

      console.log("begin populateCurrentGame");
      var game = currentPlayerInfo.games[currentPlayerInfo.activeGameToken];
      if(game && game.token == newGame.token && JSON.stringify(game) == JSON.stringify(newGame)) {
            console.log("No Updates on current game : " + game.token);
      } else {
            currentPlayerInfo.games[newGame.token] = newGame;
            currentPlayerInfo.activeGameToken = newGame.token;
            console.log("Received new Updates on current game : " + newGame.token);
            var gameDesc = document.querySelector("#game-desc");
            gameDesc.innerHTML = newGame.player1.name + " ("+newGame.player1.symbol+") vs ";

            if(newGame.playing) {
                  gameDesc.innerHTML += newGame.player2.name + " ("+newGame.player2.symbol + ")";
            }

            gameDesc.innerHTML += ", " + newGame.status.desc;

            var data = newGame.data;
            if(newGame.playing) {
                  updateGridView(data);
            }
      } 
}

function updateGridView(data) {
      var trs = document.querySelectorAll("#board table.game tr");
      for(var i =0; i < 3; i++) {
            var tds = trs[i].querySelectorAll("td");
            for(var j=0; j < 3; j++) {
                  tds[j].innerText = data[i][j];
            }
      }
}

var existingGames = [];

function onmove(yIndex, xIndex, ele) {
      ele.innerText = "X";
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
            var clk = game.playing ? 'onWatchGame(\''+game.token + '\')' : 'onJoinGame(\''+game.token + '\')';
            var playingStr = "";
            if(game.playing) {
                  playingStr = "<div class='playing-icon' title='playing'></div>"; // show the green circle
                  liHtml = '<li onclick="'+ clk +'">'; // if already playing, then anyone clicking the li should be able to see
            }
            var action = '';
            if(!game.playing) {
                  action = '<div class="game-action"><button class="btn-fdesk btn-danger btn-sm" onclick="' + clk + '">Join</button>'+ playingStr +'</div>';  
            }

            liHtml += desc + players + action + playingStr + "</li>";
            ulTag.insertAdjacentHTML("beforeend",liHtml);                 
      });
      existingGames = gameList;
}









window.onload = initGame;