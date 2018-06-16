var canPollLiveGames = true;

function initGame() {
      pollLiveGames();
}

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


var existingGames = [];

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
            var actionStr = game.playing ? 'Watch' : 'Join';
            var playingStr = "";
            if(game.playing) {
                  playingStr = "<div class='playing-icon' title='playing'></div>";
            }
            var action = '<div class="game-action"><button class="btn-fdesk btn-danger btn-sm" onclick="' + clk + '">'+actionStr+'</button>'+ playingStr +'</div>';   
            
            liHtml += desc + players + action + "</li>";
            ulTag.insertAdjacentHTML("beforeend",liHtml);                 
      });
      
      

      existingGames = gameList;
}









window.onload = initGame;