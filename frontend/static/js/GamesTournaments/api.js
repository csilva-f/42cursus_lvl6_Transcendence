//* GAMES
//? GET - /api/get-games/?statusID=
async function fetchGames(statusID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const reloadIcon = document.getElementById("reloadIcon");
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
      const APIurl = `/api/get-games/?statusID=${statusID}`
      $.ajax({
        type: "GET",
        url: APIurl,
        success: function (res) {
          const divElement = document.getElementById("gamesContent");
          divElement.innerHTML = "";
          res.games.forEach((element) => {
            const newCard = document.createElement("div");
            newCard.innerHTML = data;
            insertInfo(newCard, element, statusID);
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

//? POST - /api/create-game/
async function postGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    user1ID: parseInt(document.getElementById('passwordInput').value)
  };
  console.log("gameData: ", gameData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    data: JSON.stringify(gameData),
    success: function (res) {
      showSuccessToast(langData, langData.gamecreated);
      fetchGames(1);
      resetModal();
      $('#createModal').modal('hide');
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    }
  });
}

//? POST - Local Game Creation
async function postLocalGame() {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/create-game/`;
  let gameData = {
    P1: document.getElementById('P1NickInput').value,
    P1Color: document.getElementById('P1ColorInput').value,
    P2: document.getElementById('P2NickInput').value,
    P2Color: document.getElementById('P2ColorInput').value
  };
  console.log("gameData: ", gameData);
  showSuccessToast(langData, langData.gameEntered);
  resetModal();
  $('#createModal').modal('hide');
  const enterLi = document.getElementById('enterLi');
  window.history.pushState({}, "", enterLi.getAttribute("href"));
  locationHandler("content");
  localStorage.setItem("gameData", JSON.stringify(gameData));
}

//TODO getUserID
//? POST - /api/update-game/
async function enterGame(gameID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/update-game/`;
  let gameData = {
    gameID: gameID,
    user2ID: 6543
  };
  console.log("gameData: ", gameData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    data: JSON.stringify(gameData),
    success: function (res) {
      showSuccessToast(langData, langData.gameEntered);
      fetchGames(1);
      const enterLi = document.getElementById('enterLi');
      window.history.pushState({}, "", enterLi.getAttribute("href"));
      locationHandler("content");
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    }
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
  fetch("/templates/Components/CardTournament.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      const APIurl = `/api/get-tournaments/?statusID=${statusID}`
      $.ajax({
        type: "GET",
        url: APIurl,
        success: function (res) {
          const divElement = document.getElementById("gamesContent");
          divElement.innerHTML = "";
          console.log(res);
          res.tournaments.forEach((element) => {
            const newCard = document.createElement("div");
            newCard.innerHTML = data;
            //insertInfo(newCard, element, statusID);
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
      name: document.getElementById('nameTournamentInput').value,
      beginDate: document.getElementById('beginDateInput').value,
      endDate: document.getElementById('endDateInput').value,
  };
  console.log("tournamentData: ", tournamentData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    data: JSON.stringify(tournamentData),
    success: function (res) {
      showSuccessToast(langData, langData.tournamentcreated);
      fetchTournaments(1);
      resetModal();
      $('#createTournamentModal').modal('hide');
    },
    error: function (xhr, status, error) {
      showErrorToast(APIurl, error, langData);
      resetModal();
    }
  });
}

