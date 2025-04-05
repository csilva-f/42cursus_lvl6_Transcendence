async function insertHistoryInfo(newCard, element) {
    const winnerImg = newCard.querySelector("#winnerImg");
    const matchResult = newCard.querySelector("#matchResult");
    const divDefeat = newCard.querySelector("#divDefeat");
    const winnerNick = newCard.querySelector("#winnerNick");
    const resTextW = newCard.querySelector("#matchWinner");
    const resTextL = newCard.querySelector("#matchOpponent");
    const tsDate = newCard.querySelector("#gameHCreatedOn");
    if (element.tournamentID) {
        tsDate.textContent = element.createdOn.split(" ")[0];
    } else {
        tsDate.textContent = element.creationTS.split(" ")[0];
    }
    winnerNick.textContent = element.winnerNick
    if (element.winnerUserID != await UserInfo.getUserID()) {
        element.tournamentID == null ? matchResult.textContent = "Defeat" : matchResult.textContent = "Tournament Defeat";
        divDefeat.classList.remove("d-none");
        resTextW.classList.remove("d-none");
        
    } else {
        element.tournamentID == null ? matchResult.textContent = "Win" : matchResult.textContent = "Tournament Win";
        divDefeat.classList.remove("d-none");
        if (!element.tournamentID) resTextL.classList.remove("d-none");
        winnerImg.src = "/static/img/pfp1.jpeg";
    }
}

function insertHomeFriendInfo(newCard, element, users_on) {
    newCard.querySelector('#friendNick').textContent = element.friendNick;
    newCard.querySelector('#friendImg').textContent = `/static/img/profilePic/${element.friendAvatar}`;
    const userOnStatus = newCard.querySelector("#userOnStatus");

    if (users_on.includes(Number(element.friendID))) {
        userOnStatus.style.backgroundColor = "green"; // Online
    } else {
        userOnStatus.style.backgroundColor = "white"; // Offline
        userOnStatus.style.border = "1px solid gray";
    }
}

function insertTopPlayerInfo(newCard, element) {
    newCard.querySelector('#topPlayerNickname').textContent = element.nickname;
    newCard.querySelector('#topPlayerLvl').textContent = element.level;
    newCard.querySelector('#topPlayerAvatar').src = `/static/img/profilePic/${element.avatar}`;
}

function searchFriend() {
    const inputHomeSearchFriends = document.getElementById('inputHomeSearchFriends');
    var filter = inputHomeSearchFriends.value.toUpperCase();
    const usersCards = document.querySelectorAll("#friendsContent");
    usersCards.forEach(card => {
        var usersNick = card.querySelector('h4');
        if (usersNick) {
            let txtValue = usersNick.textContent || usersNick.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        }
    });
}

function renderHomeFriends(usersList, cardTemplate, users_on) {
	const divElement = document.getElementById("friendsContent");
	if (divElement) divElement.innerHTML = "";
	usersList.forEach(element => {
		const newCard = document.createElement("div");
		newCard.innerHTML = cardTemplate;
		insertHomeFriendInfo(newCard, element, users_on);
		divElement.appendChild(newCard);
	});
}