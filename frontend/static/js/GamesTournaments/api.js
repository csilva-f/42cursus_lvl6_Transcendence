let allGames = [];
let backButton = false;


//* GAMES
//? GET - /api/get-games/?statusID=
async function fetchGames(statusID) {
  const userLang = await localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
  const reloadBtn = document.getElementById("reloadBtn");
  reloadBtn.setAttribute("data-id", statusID);
  reloadIcon.classList.add("rotate");
  setTimeout(() => {
    reloadIcon.classList.remove("rotate");
  }, 250);
  const accessToken = await JWT.getAccess();
  fetch("/templates/Components/CardGame.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      const APIurl = `/api/get-games/?statusID=${statusID}`;
      $.ajax({
        type: "GET",
        url: APIurl,
        Accept: "application/json",
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        success: function (res) {
          const divElement = document.getElementById("gamesContent");
          divElement.innerHTML = "";
          allGames = res.games;
          res.games.forEach((element) => {
            if (element.tournamentID == null) {
              if (element.isInvitation == false) {
                const newCard = document.createElement("div");
                newCard.innerHTML = data;
                insertInfo(newCard, element, statusID);
                divElement.appendChild(newCard);
              }
            }
          });
          updateContent(langData);
        },
        error: function (xhr, status, error) {
          console.error("Error Thrown:", error);
          showErrorToast(APIurl, error, langData);
        },
      });
    })
    .catch((error) => {
    });
}

//? POST - /api/create-game/
async function postGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    user1ID: 1,
    islocal: false,
  };
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    headers: { Accept: "application/json" },
    data: JSON.stringify(gameData),
    success: function (res) {
      showSuccessToast(langData, langData.gamecreated);
      fetchGames(1);
      $("#createModal").modal("hide");
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

//? POST - Local Game Creation
async function postLocalGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {};
  const accessToken = await JWT.getAccess();
  gameData = {
    islocal: true,
  };
  $.ajax({
    type: "POST",
    url: APIurl,
    Accept: "application/json",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify(gameData),
    success: async function (res) {
      showSuccessToast(langData, langData.gameEntered);
      $("#createModal").modal("hide");
      if(res.game.id){
        gameData["gameID"] = res.game.id;
        gameData["P1"] = res.game.user1_nick;
        gameData["P1_uid"] = res.game.user1;
        gameData["P2"] = res.game.user2_nick;
        gameData["P2_uid"] = res.game.user2;
        gameData["isTournament"] = false;
      }
      localStorage.setItem("gameInfo", JSON.stringify(gameData));
      window.history.pushState({}, "", "/pong");
      await locationHandler();
      //const game = new Game(gameData);
      //game.initGame();
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

// const ws = new WebSocket("wss://localhost:8000/channels/game_id/");
//? POST - Remote Game Creation
async function postRemoteGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    islocal: false,
  };
  const accessToken = await JWT.getAccess();
  $.ajax({
    type: "POST",
    url: APIurl,
    Accept: "application/json",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify(gameData),
    success: async function (res) {
      console.log("Enter game: ", res);
      showSuccessToast(langData, langData.gamecreated);
      $("#createModal").modal("hide");
      console.log("Game Created Response:", res);
      const game = res.game;
      if (!game || !game.id) {
          throw new Error("Game not found in API response.");
      }
      const gameId = game.id;
      localStorage.setItem("isHost", "true");
      localStorage.setItem("currentGameId", gameId);
      const wsUrl = `wss://${window.location.host}/channels/${gameId}/`;
      const ws = new WebSocket(wsUrl);
      let playerCount = 0;
      // let gameInterval;
      let myAvatar = await UserInfo.getUserAvatarPath();
      ws.onopen = async function () {
        //console.log("WebSocket connection established successfully.");
        //console.log(ws);
        //localStorage.setItem("gameInfo", JSON.stringify(gameData)); //se apagarmos o historico no fim de cada jogo podemos tirar isto
        window.history.pushState({}, "", `/pong`);
        await locationHandler();
        document.getElementById("leftPlayerName").innerHTML = "Waiting...";
        document.getElementById("leftPlayerGameImg").src = `/static/img/bot/guest.svg`;
        document.getElementById("rightPlayerName").innerHTML = res.game.user1_nick;
        document.getElementById("rightPlayerGameImg").src = myAvatar;
      };
      ws.onmessage = async function (e) {
        const data = JSON.parse(e.data);
        console.log(data.message);
        if(data.type == "join") {
          console.log("Both players connected. Opening the game page...");
          gameData["gameID"] = res.game.id;
          gameData["P2"] = res.game.user1_nick;
          gameData["P2_uid"] = res.game.user1;
          gameData["P1"] = data.nick;
          gameData["P1_uid"] = data.user_id;
          gameData["imgLeft"] = data.img;
          gameData["imgRight"] = myAvatar;
          console.table(gameData)
          const game = new RemoteGame(gameData, ws, true);
          //5 4 3 2 1
          game.initGame();
        }
        if(data.message == "A player left the game.")
          console.log("OTHER PLAYER LEFT");
      };

      ws.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      ws.onclose = function (event) {
        console.log("WebSocket connection closed");
      };

      console.log("Attempting to connect to WebSocket...");
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

async function sendMessage(){
  ws.send("we did it!");
}

function openGameModal() {

}

//TODO getUserID
//? POST - /api/update-game/
async function enterGame(gameID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/update-game/`;

  let gameData = {
    gameID: gameID,
    isJoin: true,
  };

  const accessToken = await JWT.getAccess();
  $.ajax({
    type: "POST",
    url: APIurl,
    Accept: "application/json",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify(gameData),
    success: async function (res) {
      console.log("Enter game: ", res);
      showSuccessToast(langData, langData.gameEntered);
      fetchGames(1);

      const socketUrl = `wss://${window.location.host}/channels/${gameID}/`;
      const ws = new WebSocket(socketUrl);

      ws.onopen = async () => {
        const message = JSON.stringify({
            type: "join",
            nick: res.game.user2_nick,
            user_id: res.game.user2,
            img: await UserInfo.getUserAvatarPath(),
        });
        ws.send(message);
        gameData["gameID"] = res.game.id;
        gameData["P2"] = res.game.user1_nick;
        gameData["P2_uid"] = res.game.user1;
        gameData["P1"] = res.game.user2_nick;
        gameData["P1_uid"] = res.game.user2;
        gameData["islocal"] = res.game.isLocal;
        gameData["imgLeft"] = await UserInfo.getUserAvatarPath();
        gameData["imgRight"] = await fetchUserAvatar(res.game.user1); 
        //localStorage.setItem("gameInfo", JSON.stringify(gameData)); //se apagarmos o historico no fim de cada jogo podemos tirar isto
        window.history.pushState({}, "", `/pong`);
        await locationHandler();
        const game = new RemoteGame(gameData, ws, false);
        //5 4 3 2 1
        game.initGame();
      };

      ws.onmessage = async function (event) {
        const data = JSON.parse(event.data);
        console.log(data);
      }

      //talvez isto precise de um parse do erro
      ws.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      //talvez isto precise de um parse do event
      ws.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
      };

    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

async function fetchUserAvatar(userID) {
  const APIurl = `/api/get-userextensions/?userID=${userID}`
  const accessToken = await JWT.getAccess();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: APIurl,
      Accept: "application/json",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      success: function (res) {
        resolve(`/static/img/profilePic/${res.users[0].avatar}`);
      },
      error: function (xhr, status, error) {
        showErrorToast(APIurl, error, langData);
        reject(-1);
      },
    });
  });
}

//* TOURNAMENTS
//? GET - /api/get-tournaments/?statusID=
async function fetchTournaments(statusID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
  reloadIcon.classList.add("rotate");
  setTimeout(() => {
    reloadIcon.classList.remove("rotate");
  }, 250);
  const reloadBtn = document.getElementById("reloadBtn");
  reloadBtn.setAttribute("data-id", statusID);
  const accessToken = await JWT.getAccess();
  fetch("/templates/Components/CardTournament.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      const APIurl = `/api/get-tournaments/?statusID=${statusID}`;
      console.log(APIurl)
      $.ajax({
        type: "GET",
        url: APIurl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        success: function (res) {
          const divElement = document.getElementById("gamesContent");
          divElement.innerHTML = "";
          res.tournaments.forEach((element) => {
            const newCard = document.createElement("div");
            newCard.innerHTML = data;
            insertTournamentInfo(newCard, element, statusID, allGames);
            divElement.appendChild(newCard);
          });
          updateContent(langData);
        },
        error: function (xhr, status, error) {
          console.error("Error Thrown:", error);
          showErrorToast(APIurl, error, langData);
        },
      });
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function postLocalTournament() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-tournament/`;
  
  let tournamentData = {
    name: document.getElementById("localNameTournamentInput").value,
    nick2: document.getElementById("P2NickInputTourn").value,
    nick3: document.getElementById("P3NickInput").value,
    nick4: document.getElementById("P4NickInput").value
  };
  if (UserInfo.userNick == tournamentData.nick2 || 
    UserInfo.userNick == tournamentData.nick3 || 
    UserInfo.userNick == tournamentData.nick4 || 
    tournamentData.nick2 == tournamentData.nick3 ||
    tournamentData.nick2 == tournamentData.nick4 ||
    tournamentData.nick3 == tournamentData.nick4
  ) {
    return insertTournErrorMsg(1);
  }

  // const tourns = await fetchActiveTournaments();
  // console.log(tourns);
  // console.log(tourns.tournaments);
  // if (tourns && tourns.some(tourn => tourn.name == tournamentData.name)) {
  //   console.log("aqui");
  //   return insertTournErrorMsg(2);
  // }

  const accessToken = await JWT.getAccess();
  console.log(tournamentData);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: APIurl,
      Accept: "application/json",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: JSON.stringify(tournamentData),
      success: function (res) {
        showSuccessToast(langData, langData.tournamentcreated);
        console.log(res);
        console.log("res.tournament", res.tournament);
        resolve(res.tournament); // Resolve the promise with the tournament ID
        $("#createTournamentModal").modal("hide");
      },
      error: function (xhr, status, error) {
        showErrorToast(APIurl, error, langData);
        reject(error); // Reject the promise on error
      },
    });
  });
}

//? POST - /api/update-game/
async function enterTournament(gameID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/get-games/?tournamentID=${gameID}`;
  console.log(APIurl)
  let gameData = {};
  $.ajax({
    type: "GET",
    url: APIurl,
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${JWT.getAccess()}`,
    },
    success: function (res) {
      console.log(res);
      res.games.forEach((element) => {
        if (element.phaseID == 1) {
          //Logica para entrar nos jogos dos quartos de final
          //Perguntar carolina se faz-se aqui a logica de entrar para user1 ou user2
        }
      });
      updateContent(langData);
    },
    error: function (xhr, status, error) {
      const data = JSON.parse(xhr.responseJSON);
			showErrorUserToast(langData, data.error);
      // showErrorToast(APIurl, error, langData);
      // resetModal();
    },
  });
}

async function fetchTournamentGames(tournamentID) {
  const langData = localStorage.getItem("language") || "en";
  const accessToken = await JWT.getAccess();
  const APIurl = `/api/get-games/?tournamentID=${tournamentID}`;
  console.log(APIurl)
  if (!tournamentID)
    return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
        url: APIurl,
        Accept: "application/json",
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      success: function (res) {
        resolve(res.games); // Resolve the promise with the tournament ID\
      },
      error: function (xhr, status, error) {
        reject(error); // Reject the promise on error
      },
    });
  });
}

async function enterTournamentGame(gameID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const accessToken = await JWT.getAccess();
  const APIurl = `/api/update-gameTS/`;
  let gameData = {
    gameID: gameID
  };

  $.ajax({
    type: "POST",
    url: APIurl,
    Accept: "application/json",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify(gameData),
    success: async function (res) {
      const divElement = document.getElementById("gamesContent");
      divElement.innerHTML = "";
      game = res.game;
      let gameInfo = {};
      gameInfo["gameID"] = game.gameID;
      gameInfo["islocal"] = game.isLocal;
      gameInfo["P1"] = game.user1Nick;
      gameInfo["P1_uid"] = game.user1ID;
      gameInfo["P2"] = game.user2Nick;
      gameInfo["P2_uid"] = game.user2ID;
      gameInfo["isTournament"] = true;
      localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
      window.history.pushState({}, "", "/pong");
      await locationHandler();
      updateContent(langData);
    },
    error: function (xhr, status, error) {
      console.error("Error Thrown:", error);
      showErrorToast(APIurl, error, langData);
    },
  });
}

async function fetchGameStatistics(gameID) {
  const accessToken = await JWT.getAccess();
  const APIurl = `/api/get-games/?gameID=${gameID}`;
  console.log(APIurl)
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
        url: APIurl,
        Accept: "application/json",
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      success: function (res) {
        resolve(res.games); // Resolve the promise with the tournament ID\
      },
      error: function (xhr, status, error) {
        reject(error); // Reject the promise on error
      },
    });
  });
}

async function fetchActiveTournaments() {
  const langData = localStorage.getItem("language") || "en";
  const accessToken = await JWT.getAccess();
  const APIurl = `/api/get-tournaments/?statusID=2`;
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
        url: APIurl,
        Accept: "application/json",
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      success: function (res) {
        resolve(res.tournaments);
        updateContent(langData);
      },
      error: function (xhr, status, error) {
        reject(error);
      },
    });
  });
}