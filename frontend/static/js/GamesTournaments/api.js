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
  fetch("/templates/Components/GameCard.html")
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
          gamesContent.innerHTML = "";
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
    game: {
      user1: parseInt(document.getElementById('passwordInput').value)
    }
  };
  console.log("gameData: ", gameData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    data: JSON.stringify(gameData),
    success: function (res) {
      showSuccessToast(langData);
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

//? POST - /api/update-game/
async function enterGame(gameID) {
  const userLang = localStorage.getItem("language") || "en";
  const langData = await getLanguageData(userLang);
  const APIurl = `/api/update-game/`;
  let gameData = {
      id: gameID,
      user: 3
  };
  console.log("gameData: ", gameData);
  $.ajax({
    type: "POST",
    url: APIurl,
    contentType: "application/json",
    data: JSON.stringify(gameData),
    success: function (res) {
      fetchGames(1);
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
  fetch("/templates/Components/TournamentCard.html")
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
          const newCard = document.createElement("div");
          gamesContent.innerHTML = "";
          newCard.innerHTML = data;
          divElement.appendChild(newCard);
          //res.games.forEach((element) => {
            //insertInfo(newCard, element, statusID);
          //});
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