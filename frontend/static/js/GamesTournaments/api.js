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
  window.history.pushState({}, "", "/pong");
  await locationHandler("content");
  const game = new Game(0, gameData);
  game.initGame();
}

//TODO getUserID
//? POST - /api/update-game/
async function enterGame(gameID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/update-game/`;
  let gameData = {
    gameID: gameID,
    user2ID: 2,
  };
  console.log("gameData: ", gameData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    headers: { Accept: "application/json" },
    data: JSON.stringify(gameData),
    success: async function (res) {
      showSuccessToast(langData, langData.gameEntered);
      fetchGames(1);
      window.history.pushState({}, "", "/pong");
      await locationHandler("content");
      const game = new Game(gameID, null);
      game.initGame();
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    },
  });
}

//* TOURNAMENTS
//? GET - /api/get-games/?statusID=
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
