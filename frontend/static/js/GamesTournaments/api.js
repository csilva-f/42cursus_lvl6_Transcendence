let allGames = [];

//* GAMES
//? GET - /api/get-games/?statusID=
async function fetchGames(statusID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
  const reloadBtn = document.getElementById("reloadBtn");
  const statsButton = document.getElementById('statsDropdownBtn');
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
          showErrorToast(APIurl, error, langData);
        },
      });
    })
    .catch((error) => {
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
      localStorage.setItem("gameInfo", JSON.stringify(res.game.id));
      window.history.pushState({}, "", "/pong");
      await locationHandler();
      const game = new Game(gameData);
      game.initGame();
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
      showSuccessToast(langData, langData.gamecreated);
      $("#createModal").modal("hide");
      const game = res.game;
      if (!game || !game.id) {
          throw new Error("Game not found in API response.");
      }
      const gameId = game.id;
      localStorage.setItem("isHost", "true");
      localStorage.setItem("currentGameId", gameId);
      const wsUrl = `wss://${window.location.host}/channels/${gameId}/`;
      const ws = new WebSocket(wsUrl);
      let myAvatar = await UserInfo.getUserAvatarPath();
      ws.onopen = async function () {
        localStorage.setItem("gameInfo", JSON.stringify(res.game.id));
        window.history.pushState({}, "", `/pong`);
        await locationHandler();
        document.getElementById("leftPlayerName").innerHTML = langData.waiting;
        document.getElementById("leftPlayerGameImg").src = `/static/img/bot/guest.svg`;
        document.getElementById("rightPlayerName").innerHTML = res.game.user1_nick;
        document.getElementById("rightPlayerGameImg").src = myAvatar;
        remoteGame = true;
        remoteWs = ws;
      };
      ws.onmessage = async function (e) {
        const data = JSON.parse(e.data);
        if(data.type == "join") {
          gameData["gameID"] = res.game.id;
          gameData["P2"] = res.game.user1_nick;
          gameData["P2_uid"] = res.game.user1;
          gameData["P1"] = data.nick;
          gameData["P1_uid"] = data.user_id;
          gameData["imgLeft"] = data.img;
          gameData["imgRight"] = myAvatar;
          const game = new RemoteGame(gameData, ws, true);
          game.initGame();
        }
      };
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

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
        localStorage.setItem("gameInfo", JSON.stringify(res.game.id));
        window.history.pushState({}, "", `/pong`);
        await locationHandler();
        const game = new RemoteGame(gameData, ws, false);
        game.initGame();
      };
    },
    error: function (xhr, status, error) {
      const data = JSON.parse(xhr.responseJSON);
      showErrorUserToast(langData, data.error);
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
          showErrorToast(APIurl, error, langData);
        },
      });
    })
    .catch((error) => {
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

  const accessToken = await JWT.getAccess();
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
        resolve(res.tournament); // Resolve the promise with the tournament ID
        document.querySelector("#localTournamentFormID").classList.remove('was-validated');
        document.querySelector("#localTournamentFormID").reset();
        $("#createTournamentModal").modal("hide");
        if (document.getElementById('happeningLi').classList.contains('iconActive'))
          fetchTournaments(2);
      },
      error: function (xhr, status, error) {
        const data = JSON.parse(xhr.responseJSON);
			  showErrorUserToast(langData, data.error);
        reject(error); // Reject the promise on error
      },
    });
  });
}

async function fetchTournamentGames(tournamentID) {
  const langData = localStorage.getItem("language") || "en";
  const accessToken = await JWT.getAccess();
  const APIurl = `/api/get-games/?tournamentID=${tournamentID}`;
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
      let gameInfo = {};
      gameInfo["gameID"] = res.game.gameID;
      gameInfo["islocal"] = res.game.isLocal;
      gameInfo["P1"] = res.game.user1Nick;
      gameInfo["P1_uid"] = res.game.user1ID;
      gameInfo["P2"] = res.game.user2Nick;
      gameInfo["P2_uid"] = res.game.user2ID;
      gameInfo["isTournament"] = true;
      localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
      window.history.pushState({}, "", "/pong");
      await locationHandler();
      updateContent(langData);
      const game = new Game(gameInfo);
      game.initGame();
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
    },
  });
}

async function fetchGameStatistics(gameID) {
  const accessToken = await JWT.getAccess();
  const APIurl = `/api/get-games/?gameID=${gameID}`;
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