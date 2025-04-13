const searchingIDCheck = ["searchingLi", "searchingID", "searchingIcon"];
const happeningIDCheck = ["happeningLi", "happeningID", "happeningIcon"];
const finishedIDCheck = ["finishedLi", "finishedID", "finishedIcon"];
const botImages = [
    '/static/img/bot/bot1.jpeg',
    '/static/img/bot/bot2.jpeg',
    '/static/img/bot/bot3.jpeg',
    '/static/img/bot/bot4.jpeg',
    '/static/img/bot/bot5.jpeg',
    '/static/img/bot/bot6.jpg',
    '/static/img/bot/bot7.jpeg',
];

function activateInput(elementID) {
    const formElement = document.getElementById(elementID);
    formElement.disabled = !formElement.disabled;
    if (elementID == "passwordInput")
        formElement.required = !formElement.required;
}

function activateGameForm(typeForm) {
    if (typeForm == 'localForm') {
        postLocalGame();
        return;
    }
    if (typeForm == 'remoteForm') {
        postRemoteGame();
        return;
    }
    const formElement = document.getElementById(typeForm);
    const selectForm = document.getElementById('selectForm');
    if (formElement) {
        formElement.classList.remove('d-none');
        selectForm.classList.add('d-none');
    }
}

function GamesTournamentsMatches(elementID) {
    const searchElement = document.getElementById('loadGamesIcon');
    const searchingLi = document.getElementById('searchingLi');
    const happeningLi = document.getElementById('happeningLi');
    const finishedLi = document.getElementById('finishedLi');
    if (searchingIDCheck.includes(elementID)) {
        if (!document.getElementById('createTournamentBtn').classList.contains('d-none')) {
            searchingLi.classList.add('d-none')
            searchingLi.classList.remove('ms-2')
        } else {
            searchingLi.classList.remove('d-none')
            searchingLi.classList.add('ms-2')
            disableIcon(searchingLi);
        }
        disableIcon(happeningLi);
        disableIcon(finishedLi);
        activateIcon(searchingLi);
        if (searchElement.classList.contains('iconActive'))
            fetchGames(1);
        else
            fetchTournaments(1);
    } else if (happeningIDCheck.includes(elementID)) {
        if (!document.getElementById('createTournamentBtn').classList.contains('d-none')) {
            searchingLi.classList.add('d-none')
            searchingLi.classList.remove('ms-2')
        } else {
            searchingLi.classList.remove('d-none')
            searchingLi.classList.add('ms-2')
            disableIcon(searchingLi);
        }
        disableIcon(finishedLi);
        activateIcon(happeningLi);
        if (searchElement.classList.contains('iconActive'))
            fetchGames(2);
        else
            fetchTournaments(2);
    } else if (finishedIDCheck.includes(elementID)) {
        disableIcon(searchingLi);
        disableIcon(happeningLi);
        activateIcon(finishedLi);
        if (searchElement.classList.contains('iconActive'))
            fetchGames(3);
        else
            fetchTournaments(3);
    }
}

function GamesTournamentsSelect(elementID) {
    const element = document.getElementById(elementID);
    if (elementID == "loadTournamentsIcon") {
        const otherElement = document.getElementById('loadGamesIcon');
        disableIcon(otherElement);
        activateIcon(element);
        document.getElementById('createTournamentBtn').classList.remove('d-none');
        document.getElementById('createGameBtn').classList.add('d-none');
        GamesTournamentsMatches('happeningLi');
        fetchTournaments(2);
    } else if (elementID == "loadGamesIcon") {
        const otherElement = document.getElementById('loadTournamentsIcon');
        disableIcon(otherElement);
        activateIcon(element);
        document.getElementById('createGameBtn').classList.remove('d-none');    
        document.getElementById('createTournamentBtn').classList.add('d-none');
        GamesTournamentsMatches('searchingLi');
        fetchGames(1);
    }
}

function setRandomImage(imgElement) {
    const randomIndex = Math.floor(Math.random() * botImages.length);
    imgElement.src = botImages[randomIndex];
}

async function insertInfo(newCard, element, statusID) {
    newCard.innerHTML = newCard.innerHTML.replaceAll("{{GAME_ID}}", element.gameID);
    const user1Level = newCard.querySelector("#user1Level");
    const user1Nick = newCard.querySelector("#user1Nick");
    const user1Img = newCard.querySelector("#user1Img");
    const user2Img = newCard.querySelector("#user2Img");
    const user2LvlLabel = newCard.querySelector("#user2LvlLabel");
    const user2Level = newCard.querySelector("#user2Level");
    const user2Nick = newCard.querySelector("#user2Nick");
    const enterBtn = newCard.querySelector("#enterLi");
    const uid = await UserInfo.getUserID();
    enterBtn.setAttribute("data-id", element.gameID);
    const statsButton = document.getElementById('statsDropdownBtn');
    if (!element.isLocal && (uid == element.user1ID || uid == element.user2ID))
        enterBtn.classList.add('d-none');
    if (statusID != 1)
        enterBtn.classList.add('d-none');
    if (statusID != 3)
        statsButton.classList.add('d-none');
    user1Level.textContent = element.user1Lvl;
    user1Nick.textContent = element.user1Nick;
    user1Img.src = `/static/img/profilePic/${element.user1Avatar}`;
    if (element.user2ID == null) {
        setRandomImage(user2Img);
        user2LvlLabel.style.display = "none";
        user2Nick.setAttribute("data-i18n", "waiting");
    } else {
        user2Nick.textContent = element.user2Nick;
        if (element.user2ID != -1) {
            user2Level.textContent = element.user2Lvl;
            user2Img.src = `/static/img/profilePic/${element.user2Avatar}`;
        } else {
            user2LvlLabel.classList.add('d-none');
            user2Img.src = `/static/img/bot/guest.svg`
        }
    }
}

function insertTournamentInfo(newCard, element, statusID, allGames) {
    newCard.innerHTML = newCard.innerHTML.replaceAll("{{TOURNAMENT_ID}}", element.tournamentID);
    const tournamentTitle = newCard.querySelector("#tournamentTitle")
    tournamentTitle.textContent = element.name;
    const enterBtn = newCard.querySelector("#enterLi");
    enterBtn.setAttribute("data-id", element.tournamentID);
    if (element.statusID == 3) {
        const tournamenWinner = newCard.querySelector("#tournWinnerNick")
        tournamenWinner.textContent = element.winnerNick;
        const divElement = newCard.querySelector('#tournWinner');
        if (divElement) divElement.classList.remove('d-none');
        const divElementBar = newCard.querySelector('#tournWinnerBar');
        if (divElementBar) divElementBar.classList.remove('d-none');
        // const divElement2 = newCard.querySelector('#tournUsers');
        // divElement2.classList.add('d-none');
    } else {
        // const tournamentPlayers = newCard.querySelector("#tournamentPlayers")
        // tournamentPlayers.textContent = 4;
        // const tournamentUser1Nick = newCard.querySelector("#tournamentP1Nick")
        // tournamentUser1Nick.textContent = element.user1Nick;
        // const tournamentUser2Nick = newCard.querySelector("#tournamentP2Nick")
        // tournamentUser2Nick.textContent = element.user2Nick;
        // const tournamentUser3Nick = newCard.querySelector("#tournamentP3Nick")
        // tournamentUser3Nick.textContent = element.user3Nick;
        // const tournamentUser4Nick = newCard.querySelector("#tournamentP4Nick")
        // tournamentUser4Nick.textContent = element.user4Nick;
        const divElement3 = newCard.querySelector('#tournWinner');
        if (divElement3) divElement3.classList.add('d-none');
        const divElementBar2 = newCard.querySelector('#tournWinnerBar');
        if (divElementBar2) divElementBar2.classList.add('d-none');
        // const divElement4 = newCard.querySelector('#tournUsers');
        // divElement4.classList.remove('d-none');
    }
    const tournamentCreatedOnDate = newCard.querySelector("#tournamentCreatedOn")
    tournamentCreatedOnDate.textContent = element.createdOn.split(" ")[0];
}

function reloadInformation(statusID) {
    const loadGamesIcon = document.getElementById('loadGamesIcon');
    if (loadGamesIcon.classList.contains('iconActive'))
        fetchGames(statusID);
    else
        fetchTournaments(statusID);
}

//* Function to show Forms
function showGameForm(formID, tabOpenID, confirmBtnID, backBtnID) {
    const form = document.getElementById(formID);
    form.classList.remove('d-none');
    const tab = document.getElementById(tabOpenID);
    tab.classList.add('d-none');
    const confirmBtn = document.getElementById(confirmBtnID);
    // confirmBtn.classList.remove('d-none');
    const backBtb = document.getElementById(backBtnID);
    backBtb.classList.remove('d-none');
    backBtb.setAttribute("data-id", formID);
}

//* Function to hide Forms
function hideGameForm(formOpenID, tabID, confirmBtnID) {
    const form = document.getElementById(formOpenID);
    if (form) {
        form.classList.add('d-none');
        form.classList.remove('was-validated')
    }
    const tab = document.getElementById(tabID);
    if (tab) tab.classList.remove('d-none');
    const confirmBtn = document.getElementById(confirmBtnID);
    if (confirmBtn) confirmBtn.classList.add('d-none');
}

//* Function to cancel and reset Forms
function closeGameForm(formIDs, tabID, confirmBtnID, backBtnID) {
    const tournErrorSection = document.querySelector('#tournErrorSection');
    if (tournErrorSection) tournErrorSection.classList.add('d-none');
    const tournErrorNick = document.querySelector('#tournErrorNick');
    if (tournErrorNick) tournErrorSection.classList.add('d-none');
    const tournErrorName = document.querySelector('#tournErrorName');
    if (tournErrorName) tournErrorSection.classList.add('d-none');

    if (formIDs != null)
        hideGameForm(formIDs, tabID, confirmBtnID)
    formIDs.forEach((f) => {
        const form = document.getElementById(f.id)
        form.classList.remove('was-validated')
        const inputs = document.querySelectorAll(`#${f.id} input`)
        inputs.forEach((i) => {
            i.value = '';
        })
    })
}

//* Function to expand or retract the games section of each tournament
function toggleTournamentGames(divID) {
    const gamesDiv = document.getElementById(divID);
  
    if (!gamesDiv) return;
    if (gamesDiv.classList.contains("d-none")) {
        gamesDiv.classList.remove("d-none");
        
        const tournamentID = divID.split("-")[1];
        loadTournamentGames(tournamentID, gamesDiv);
    } else {
        gamesDiv.classList.add("d-none");
    }
}

//* Function to insert in frontend the info regarding a tournament's games
async function insertTournamentGameInfo(newCard, game) {
    const tournGameNbr = newCard.querySelector("#tournGameNumber")
    tournGameNbr.textContent = game.phase;
    const tournP1 = newCard.querySelector("#tournGamePlayer1")
    if (game.user1Nick) {
        tournP1.textContent = game.user1Nick;
    } else {
        tournP1.textContent = "(To be be defined)";
    }
    const tournP2 = newCard.querySelector("#tournGamePlayer2")
    if (game.user2Nick) {
        tournP2.textContent = game.user2Nick;
    } else {
        tournP2.textContent = "(To be be defined)";
    }
    const enterTournGameBtn = newCard.querySelector("#enterLi");
    enterTournGameBtn.setAttribute("data-id", game.gameID);
    if (game.user1Nick && game.user2Nick && game.statusID == 2) {
        if (game.createdByUser == await UserInfo.getUserID()) {
            const element = newCard.querySelector('#tournGameBtn');
            if (element) element.classList.remove('d-none');
        }
    } else if (game.statusID == 3) {
        const element2 = newCard.querySelector('#tournGameWinnerText');
        if (element2) element2.classList.remove('d-none');
        const tournGameWinner = newCard.querySelector("#tournGameWinner")
        tournGameWinner.textContent = game.winnerNick;
    }
    const tournGameStat = newCard.querySelector("#tournGameStatus")
    tournGameStat.textContent = game.status;
}

//* Function to laod the tournament games
async function loadTournamentGames(tournamentID, containerDiv) {
    try {
        const games = await fetchTournamentGames(tournamentID);
        containerDiv.classList.remove("d-none");

        if (!games || games.length === 0) {
            const noGamesMsg = document.createElement("p");
            noGamesMsg.classList.add("text-muted");
            noGamesMsg.textContent = "No games found for this tournament.";
            containerDiv.appendChild(noGamesMsg);
            return;
        }
        const userLang = localStorage.getItem("language") || "en";
        const langData = await getLanguageData(userLang);
        fetch("/templates/Components/CardTournamentGame.html")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                return response.text();
            })
            .then((data) => {
                const divElement = document.getElementById(`gamesContainer-${tournamentID}`);
                divElement.innerHTML = "";
                games.forEach((element) => {
                    const newCard = document.createElement("div");
                    newCard.innerHTML = data;
                    insertTournamentGameInfo(newCard, element);
                    divElement.appendChild(newCard);
                });
                updateContent(langData);
            })
            .catch((error) => {
            });
    } catch (error) {
        containerDiv.innerHTML = "<p class='text-danger'>Error loading games.</p>";
    }
}

function toggleGameStats(divID) {
    const gameStatsDiv = document.getElementById(divID);
  
    if (!gameStatsDiv) return;
    if (gameStatsDiv.classList.contains("d-none")) {
        gameStatsDiv.classList.remove("d-none");
        
        const gameID = divID.split("-")[1];
        loadGameStats(gameID, gameStatsDiv);
    } else {
        gameStatsDiv.classList.add("d-none");
    }
}

//* Function to laod the game statistics
async function loadGameStats(gameID, containerDiv) {
    try {
        const statistics = await fetchGameStatistics(gameID);
        containerDiv.classList.remove("d-none");
        if (!statistics || statistics.length === 0) {
            const noStatsMsg = document.createElement("p");
            noStatsMsg.classList.add("text-muted");
            noStatsMsg.textContent = "No statistics found for this game.";
            containerDiv.appendChild(noStatsMsg);
            return;
        }
        const userLang = localStorage.getItem("language") || "en";
        const langData = await getLanguageData(userLang);
        fetch("/templates/Components/CardGameStatistics.html")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                return response.text();
            })
            .then((data) => {
                const divElement = document.getElementById(`gameStatContainer-${gameID}`);
                divElement.innerHTML = "";
                statistics.forEach((element) => {
                    const newCard = document.createElement("div");
                    newCard.innerHTML = data;
                    insertGameStatInfo(newCard, element);
                    divElement.appendChild(newCard);
                });
                updateContent(langData);
            })
            .catch((error) => {
            });
    } catch (error) {
        containerDiv.innerHTML = "<p class='text-danger'>Error loading game statistics.</p>";
    }
}

//* Function to insert in frontend the info regarding game stats
function insertGameStatInfo(newCard, game) {
    const gameCreatedOnDate = newCard.querySelector("#gameCreatedOn")
    gameCreatedOnDate.textContent = game.creationTS.split(" ")[0];
    const p1 = newCard.querySelector("#gamePlayer1")
    p1.textContent = game.user1Nick;
    const pointsP1 = newCard.querySelector("#pointsP1")
    pointsP1.textContent = game.user1_points;
    const hitsP1 = newCard.querySelector("#hitsP1")
    hitsP1.textContent = game.user1_hits;
    const p2 = newCard.querySelector("#gamePlayer2")
    p2.textContent = game.user2Nick;
    const pointsP2 = newCard.querySelector("#pointsP2")
    pointsP2.textContent = game.user2_points;
    const hitsP2 = newCard.querySelector("#hitsP2")
    hitsP2.textContent = game.user2_hits;
    const element2 = newCard.querySelector('#gameWinnerText');
    if (element2) element2.classList.remove('d-none');
    const gameWinner = newCard.querySelector("#gameWinner")
    gameWinner.textContent = game.winnerNick;
    const gameDuration = newCard.querySelector("#gameDuration")
    gameDuration.textContent = game.duration.split(".")[0];
}

//* Function to insert in frontend the tournament form error message
function insertTournErrorMsg(type) {
    const tournErrorSection = document.querySelector('#tournErrorSection');
    tournErrorSection.classList.remove('d-none');
    const msgNick = document.querySelector('#tournErrorNick');
    const msgName = document.querySelector('#tournErrorName');
    if (type == 1) {
        msgNick.classList.remove('d-none');
    } else if (type == 2) {
        msgName.classList.remove('d-none');
    }
}