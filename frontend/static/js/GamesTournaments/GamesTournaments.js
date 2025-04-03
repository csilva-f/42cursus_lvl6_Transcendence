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
];

function showErrorToast(APIurl, error, langData) {
    fetch("/templates/Components/ToastError.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then((data) => {
            const bodyElement = document.getElementById("body");
            const newToast = document.createElement("div");
            newToast.innerHTML = data;
            const errorToast = newToast.querySelector('#errorToast')
            const toastShow = bootstrap.Toast.getOrCreateInstance(errorToast)
            const errorMsg = newToast.querySelector('#errorMsg')
            const urlAPIElement = newToast.querySelector('#urlAPI')
            if (error == null)
                errorMsg.textContent = "Unknown Error";
            else
                errorMsg.textContent = error;
            urlAPIElement.textContent = APIurl;
            bodyElement.appendChild(newToast);
            updateContent(langData);
            toastShow.show()
        })
}

function showSuccessToast(langData, type) {
    fetch("/templates/Components/ToastSuccess.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then((data) => {
            const bodyElement = document.getElementById("body");
            const newToast = document.createElement("div");
            newToast.innerHTML = data;
            const successToast = newToast.querySelector('#successToast')
            const toastShow = bootstrap.Toast.getOrCreateInstance(successToast)
            const successMsg = newToast.querySelector('#successMsg')
            successMsg.textContent = type;
            bodyElement.appendChild(newToast);
            updateContent(langData);
            toastShow.show()
        })
}

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

// function resetModal() {
//     document.getElementById('localForm').classList.add('d-none');
//     document.getElementById('remoteForm').classList.add('d-none');
//     document.getElementById('selectForm').classList.remove('d-none');
//     document.getElementById('goBackLi').classList.add('d-none');

//     const localInputs = document.querySelectorAll('#localForm input[type="text"]');
//     localInputs.forEach(input => {
//         input.value = '';
//     });
//     const remoteInputs = document.querySelectorAll('#remoteForm input[type="text"]');
//     remoteInputs.forEach(input => {
//         input.value = '';
//     });
// }

function GamesTournamentsMatches(elementID) {
    const searchElement = document.getElementById('loadGamesIcon');
    const searchingLi = document.getElementById('searchingLi');
    const happeningLi = document.getElementById('happeningLi');
    const finishedLi = document.getElementById('finishedLi');
    if (searchingIDCheck.includes(elementID)) {
        disableIcon(happeningLi);
        disableIcon(finishedLi);
        activateIcon(searchingLi);
        if (searchElement.classList.contains('iconActive'))
            fetchGames(1);
        else
            fetchTournaments(1);
    } else if (happeningIDCheck.includes(elementID)) {
        disableIcon(searchingLi);
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
        GamesTournamentsMatches('searchingLi');
        fetchTournaments(1);
        document.getElementById('createTournamentBtn').classList.remove('d-none');
        document.getElementById('createGameBtn').classList.add('d-none');
    } else if (elementID == "loadGamesIcon") {
        const otherElement = document.getElementById('loadTournamentsIcon');
        disableIcon(otherElement);
        activateIcon(element);
        GamesTournamentsMatches('searchingLi');
        fetchGames(1);
        document.getElementById('createGameBtn').classList.remove('d-none');
        document.getElementById('createTournamentBtn').classList.add('d-none');
    }
}

function setRandomImage(imgElement) {
    const randomIndex = Math.floor(Math.random() * botImages.length);
    imgElement.src = botImages[randomIndex];
}

function insertInfo(newCard, element, statusID) {
    console.log("statusID: ", statusID)
    const user1Level = newCard.querySelector("#user1Level");
    const user1Nick = newCard.querySelector("#user1Nick");
    const user2Img = newCard.querySelector("#user2Img");
    const user2LvlLabel = newCard.querySelector("#user2LvlLabel");
    const user2Level = newCard.querySelector("#user2Level");
    const user2Nick = newCard.querySelector("#user2Nick");
    const enterBtn = newCard.querySelector("#enterLi");
    enterBtn.setAttribute("data-id", element.gameID);
    if (statusID != 1)
        enterBtn.classList.add('d-none');
    user1Level.textContent = element.user1ID;
    user1Nick.textContent = element.user1Nick;
    if (element.user2ID == null) {
        setRandomImage(user2Img);
        user2LvlLabel.style.display = "none";
        //user2Nick.setAttribute("data-i18n", "waiting");
        user2Nick.textContent = element.gameID
    } else {
        user2Level.textContent = element.user2ID;
        user2Nick.textContent = element.user2Nick;
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
        divElement.classList.remove('d-none');
        const divElement2 = newCard.querySelector('#tournUsers');
        divElement2.classList.add('d-none');
    } else {
        const tournamentPlayers = newCard.querySelector("#tournamentPlayers")
        tournamentPlayers.textContent = 4;
        const tournamentUser1Nick = newCard.querySelector("#tournamentP1Nick")
        tournamentUser1Nick.textContent = element.user1Nick;
        const tournamentUser2Nick = newCard.querySelector("#tournamentP2Nick")
        tournamentUser2Nick.textContent = element.user2Nick;
        const tournamentUser3Nick = newCard.querySelector("#tournamentP3Nick")
        tournamentUser3Nick.textContent = element.user3Nick;
        const tournamentUser4Nick = newCard.querySelector("#tournamentP4Nick")
        tournamentUser4Nick.textContent = element.user4Nick;
        const divElement3 = newCard.querySelector('#tournWinner');
        divElement3.classList.add('d-none');
        const divElement4 = newCard.querySelector('#tournUsers');
        divElement4.classList.remove('d-none');
    }
    const tournamentCreatedOnDate = newCard.querySelector("#tournamentCreatedOn")
    tournamentCreatedOnDate.textContent = element.createdOn;
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
function hideGameForm(formOpenID, tabID, confirmBtnID, backBtnID) {
    const form = document.getElementById(formOpenID);
    form.classList.add('d-none');
    const tab = document.getElementById(tabID);
    tab.classList.remove('d-none');
    const confirmBtn = document.getElementById(confirmBtnID);
    confirmBtn.classList.add('d-none');
    const backBtn = document.getElementById(backBtnID);
    backBtn.classList.add('d-none');
    backBtn.removeAttribute("data-id");
}

//* Function to cancel and reset Forms
function closeGameForm(formIDs, tabID, confirmBtnID, backBtnID) {
    const backBtn = document.getElementById(backBtnID);
    let formOpenID = backBtn.getAttribute("data-id")
    if (formOpenID != null)
        hideGameForm(formOpenID, tabID, confirmBtnID, backBtnID)
    formIDs.forEach((f) => {
        const form = document.getElementById(f.id)
        const inputs = document.querySelectorAll(`#${f.id} input`)
        inputs.forEach((i) => {
            i.value = '';
        })
    })
}

//* Function to expand or retract the games section of each tournament
function toggleTournamentGames(divID) {
    const gamesDiv = document.getElementById(divID);
    console.log(gamesDiv);
  
    if (!gamesDiv) return;
    if (gamesDiv.classList.contains("d-none")) {
        gamesDiv.classList.remove("d-none");
        
        const tournamentID = divID.split("-")[1];
        console.log(tournamentID);
        loadTournamentGames(tournamentID, gamesDiv);
    } else {
        gamesDiv.classList.add("d-none");
    }
}

//* Function to insert in frontend the info regarding its games
function insertTournamentGameInfo(newCard, game) {
    console.log(game);
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
        const element = newCard.querySelector('#tournGameBtn');
        if (element) element.classList.remove('d-none');
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
        console.log("Loading games for tournament:", tournamentID);
        const games = await fetchTournamentGames(tournamentID);
        console.log("Fetched games:", games);
        containerDiv.classList.remove("d-none");

        if (!games || games.length === 0) {
            const noGamesMsg = document.createElement("p");
            noGamesMsg.classList.add("text-muted");
            noGamesMsg.textContent = "No games found for this tournament.";
            containerDiv.appendChild(noGamesMsg);
            return;
        }
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
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });
    } catch (error) {
        console.error("Error fetching games:", error);
        containerDiv.innerHTML = "<p class='text-danger'>Error loading games.</p>";
    }
}