let allGames = [];

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
  console.log("accessToken", accessToken)
  console.log("statusID: ", statusID)
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
          console.log("Games", allGames)
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
//! FAZER A CENA PARA PARA CRIAR JOGOS LOCAIS NO API
async function postGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    user1ID: 1,
    islocal: false,
  };
  console.log("gameData: ", gameData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    headers: { Accept: "application/json" },
    data: JSON.stringify(gameData),
    success: function (res) {
      showSuccessToast(langData, langData.gamecreated);
      fetchGames(1);
      resetModal();
      $("#createModal").modal("hide");
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    },
  });
}

//? POST - Local Game Creation
async function postLocalGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    P1: document.getElementById("P1NickInput").value,
    P1Color: document.getElementById("P1ColorInput").value,
    P2: document.getElementById("P2NickInput").value,
    P2Color: document.getElementById("P2ColorInput").value,
  };
  console.log("gameData: ", gameData);
  showSuccessToast(langData, langData.gameEntered);
  resetModal();
  $("#createModal").modal("hide");
  window.history.pushState({}, "", "/pong");
  await locationHandler("content");
  const game = new Game(0, null, false, gameData);
  game.initGame();
}

// const ws = new WebSocket("wss://localhost:8000/channels/game_id/");
//? POST - Remote Game Creation
async function postRemoteGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    P1: "Me",
    P1Color: document.getElementById("P1ColorInput").value,
    P2: "Waiting for player 1",
    P2Color: document.getElementById("P2ColorInput").value,
    islocal: false,
  };
  console.log("gameData: ", gameData);
  const accessToken = await JWT.getAccess();
  console.log("accessToken", accessToken)
  $.ajax({
    type: "POST",
    url: APIurl,
    Accept: "application/json",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: JSON.stringify(gameData),
    success: function (res) {
      showSuccessToast(langData, langData.gamecreated);
      resetModal();
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

      ws.onopen = function () {
        console.log("WebSocket connection established successfully.");
        console.log(ws);
      };
      ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        console.log("I'm here");
        console.log(data.message);
        //console.log("Message received:", e.data);
        if (data.message === "A player joined the game!") {
          playerCount++;
          if (playerCount === 1){
            window.history.pushState({}, "", `/pong`);
            locationHandler("content");
          }
          console.log(`Player count: ${playerCount}`);
          if (playerCount === 2) {
            console.log("Both players connected. Opening the game page...");
            console.table(gameData)
            const game = new RemoteGame(gameId, ws, true, gameData);
            //5 4 3 2 1
            game.initGame();
          //   gameInterval = setInterval(() => {
          //     if (typeof getCurrentGameState === "function") {  // Verifica se a função existe
          //         const gameState = getCurrentGameState();
          //         ws.send(JSON.stringify({
          //             type: "game_state",
          //             ...gameState
          //         }));
          //     }
          // }, 50);
          }
        }
      };

      ws.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      ws.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
        // clearInterval(gameInterval);
      };

      console.log("Attempting to connect to WebSocket...");
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
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

  let gameDataCanvas = {
    P1: "host",
    P1Color: document.getElementById("P1ColorInput").value,
    P2: "me",
    P2Color: document.getElementById("P2ColorInput").value,
  };

  console.log("gameData: ", gameData);
  const accessToken = await JWT.getAccess();
  console.log("accessToken", accessToken)

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

      // Construir dinamicamente a URL do WebSocket com o gameID correto
      const socketUrl = `wss://${window.location.host}/channels/${gameID}/`;
      console.log("Connecting to WebSocket:", socketUrl);

      const ws = new WebSocket(socketUrl);

      ws.onopen = function () {
        console.log("WebSocket connection established successfully.");
        // const paddle2 = objects[2];

        // document.addEventListener("keydown", function (event) {
        //   if (event.key === "ArrowUp") {  // Seta para cima
        //     paddle2.paddleY = Math.max(0, paddle2.paddleY - 10);  // Move para cima
        //   } else if (event.key === "ArrowDown") {  // Seta para baixo
        //     paddle2.paddleY = Math.min(canvas.height - paddle2.height, paddle2.paddleY + 10);  // Move para baixo
        //   }
        //   // 🟢 Envia a nova posição do paddle para `user1` via WebSocket
        //   socket.send(JSON.stringify({
        //     type: "paddle_move",
        //     paddle: 2,  // Indica que é o paddle do `user2`
        //     position: paddle2.paddleY  // Envia a nova posição Y do paddle
        //   }));
        // });
      };

      ws.onmessage = async function (event) {
        const data = JSON.parse(event.data);
        console.log("Message received:", data.message);
        if (data.message === "A player joined the game!"){
          window.history.pushState({}, "", `/pong`);
          await locationHandler("content");
          const game = new RemoteGame(gameID, ws, false, gameDataCanvas);
          //5 4 3 2 1
          game.initGame();
        }
      };

      ws.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      ws.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
      };

    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    },
  });
}

//TODO getUserID
//? POST - /api/update-game/
async function finishGame(gameID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/update-game/`;

  let gameData = {
    gameID: gameID,
    isJoin: false,
  };
  console.log("gameData: ", gameData);

  $.ajax({
    type: "POST",
    url: APIurl,
    Accept: "application/json",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
    data: JSON.stringify(gameData),
    success: function (res) {
      showSuccessToast(langData, langData.gameEntered);
      fetchGames(1);

    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    },
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
          console.log(res);
          console.log(allGames);
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

//TODO resetTournamentModal
//? POST - /api/create-tournament/
async function postTournament() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-tournament/`;
  let tournamentData = {
    name: document.getElementById("nameTournamentInput").value,
    beginDate: document.getElementById("beginDateInput").value,
    endDate: document.getElementById("endDateInput").value,
    createdByUser: 1,
  };
  console.log("tournamentData: ", tournamentData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    headers: { Accept: "application/json" },
    data: JSON.stringify(tournamentData),
    success: function (res) {
      showSuccessToast(langData, langData.tournamentcreated);
      fetchTournaments(1);
      resetModal();
      $("#createTournamentModal").modal("hide");
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    },
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
  const todayDate = getCurrentDate();
  
  let tournamentCreationData = {
    name: document.getElementById("localNameTournamentInput").value,
    beginDate: todayDate,
    endDate: todayDate,
    createdByUser: 1,
  };

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: APIurl,
      contentType: "application/json",
      headers: { Accept: "application/json" },
      data: JSON.stringify(tournamentCreationData),
      success: function (res) {
        showSuccessToast(langData, langData.tournamentcreated);
        console.log("res.tournament_id", res.tournament_id);
        resolve(res.tournament_id); // Resolve the promise with the tournament ID
      },
      error: function (xhr, status, error) {
        showErrorToast(APIurl, error, langData);
        resetModal();
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
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    },
  });
}

async function fetchTournamentGames(tournamentID) {
  const accessToken = await JWT.getAccess();
  const APIurl = `/api/get-games/?tournamentID=${tournamentID}`;
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: APIurl,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      success: function (res) {
        resolve(res.games); // Resolve the promise with the tournament ID
      },
      error: function (xhr, status, error) {
        reject(error); // Reject the promise on error
      },
    });
  });
}
