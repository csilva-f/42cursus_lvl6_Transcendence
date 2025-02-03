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
    console.log("showErrorToast()");
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
    const formElement = document.getElementById(typeForm);
    const selectForm = document.getElementById('selectForm');
    if (formElement) {
        formElement.classList.remove('d-none');
        selectForm.classList.add('d-none');
        document.getElementById('goBackLi').classList.remove('d-none');
    }
}

function resetModal() {
    document.getElementById('localForm').classList.add('d-none');
    //document.getElementById('remoteForm').classList.add('d-none');
    document.getElementById('selectForm').classList.remove('d-none');
    document.getElementById('goBackLi').classList.add('d-none');

    const localInputs = document.querySelectorAll('#localForm input[type="text"]');
    localInputs.forEach(input => {
        input.value = '';
    });
    const remoteInputs = document.querySelectorAll('#remoteForm input[type="text"]');
    remoteInputs.forEach(input => {
        input.value = '';
    });
}

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
    const user1Level = newCard.querySelector("#user1Level");
    const user1Nick = newCard.querySelector("#user1Nick");
    const user2Img = newCard.querySelector("#user2Img");
    const user2LvlLabel = newCard.querySelector("#user2LvlLabel");
    const user2Level = newCard.querySelector("#user2Level");
    const user2Nick = newCard.querySelector("#user2Nick");
    const enterBtn = newCard.querySelector("#enterLi");
    switch (statusID) {
        case 1:
            enterBtn.setAttribute("data-id", element.gameID);
            break;
        case 2:
            enterBtn.classList.add('d-none');
            break;
    }
    user1Level.textContent = element.user1ID;
    user1Nick.textContent = "{Nickname}";
    if (element.user2ID == null) {
        setRandomImage(user2Img);
        user2LvlLabel.style.display = "none";
        user2Nick.setAttribute("data-i18n", "waiting");
    } else {
        user2Level.textContent = element.user2ID;
        user2Nick.textContent = "{Nickname2}";
    }
}

function insertTournamentInfo(newCard, element, statusID, allGames) {
    const tournamentTitle = newCard.querySelector("#tournamentTitle")
    tournamentTitle.textContent = element.name;
    const tournamentBeginDate = newCard.querySelector("#tournamentBeginDate")
    tournamentBeginDate.textContent = element.beginDate;
    const tournamentEndDate = newCard.querySelector("#tournamentEndDate")
    tournamentEndDate.textContent = element.endDate;
    const tournamentPlayers = newCard.querySelector("#tournamentPlayers")
    let playerCount = 0;
    allGames.forEach((game) => {
        if (game.tournamentID == element.tournamentID) {
            if (game.user1ID != null)
                playerCount++;
            if (game.user2ID != null)
                playerCount++;
        }
    })
    tournamentPlayers.textContent = playerCount;
}

function reloadInformation(statusID) {
    const loadGamesIcon = document.getElementById('loadGamesIcon');
    if (loadGamesIcon.classList.contains('iconActive'))
        fetchGames(statusID);
    else
        fetchTournaments(statusID);
}