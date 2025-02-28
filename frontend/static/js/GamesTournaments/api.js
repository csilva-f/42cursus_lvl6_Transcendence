let allGames = [];

//* GAMES
//? GET - /api/get-games/?statusID=
async function fetchGames(statusID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
  const reloadBtn = document.getElementById("reloadBtn");
  reloadBtn.setAttribute("data-id", statusID);
  reloadIcon.classList.add("rotate");
  setTimeout(() => {
    reloadIcon.classList.remove("rotate");
  }, 250);
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
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
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
      console.error("There was a problem with the fetch operation:", error);
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
  const enterLi = document.getElementById("enterLi");
  window.history.pushState({}, "", "/pong"); //enterLi.getAttribute("href"));
  locationHandler("content");
  localStorage.setItem("gameData", JSON.stringify(gameData));
}

// const ws = new WebSocket("wss://localhost:8000/channels/game_id/");
//? POST - Remote Game Creation
async function postRemoteGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    P1: document.getElementById("P1NickInput").value,
    P1Color: document.getElementById("P1ColorInput").value,
    P2: document.getElementById("P2NickInput").value,
    P2Color: document.getElementById("P2ColorInput").value,
    islocal: false,
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
      showSuccessToast(langData, langData.gamecreated);
      fetchGames(1);
      resetModal();
      $("#createModal").modal("hide");
      console.log("Game Created Response:", res);
      const gameId = res.game_id;
      if (!gameId) {
        throw new Error("game_id não encontrado na resposta da API.");
      }
      const wsUrl = `wss://localhost:8000/channels/${gameId}/`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = function () {
        console.log("WebSocket connection established successfully.");
        console.log(ws);
      };

      ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        //console.log(data.message);
        console.log("Message received:", e.data);
      };

      ws.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      ws.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
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
      const enterLi = document.getElementById("enterLi");
      window.history.pushState({}, "", enterLi.getAttribute("href"));
      locationHandler("content");
      
      const socketUrl = `ws://${window.location.host}/ws/game/${gameID}/`;
      console.log("Connecting to WebSocket:", socketUrl);
      const socket = new WebSocket(socketUrl);

      socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log(data.message);
      };

      socket.onopen = function () {
        console.log("WebSocket connection established successfully.");
      };

      socket.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      socket.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
      };
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
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

      const enterLi = document.getElementById("enterLi");
      window.history.pushState({}, "", enterLi.getAttribute("href"));
      locationHandler("content");

      // Construir dinamicamente a URL do WebSocket com o gameID correto
      const socketUrl = `ws://${window.location.host}/ws/game/${gameID}/`;
      console.log("Connecting to WebSocket:", socketUrl);

      const socket = new WebSocket(socketUrl);

      socket.onopen = function () {
        console.log("WebSocket connection established successfully.");
      };

      socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log("Message received:", data.message);
      };

      socket.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      socket.onclose = function (event) {
        console.log("WebSocket connection closed:", event);
      };
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
        headers: { Accept: "application/json" },
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
