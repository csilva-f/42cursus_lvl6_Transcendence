async function insertHistoryInfo(newCard, element) {
    const winnerImg = newCard.querySelector("#winnerImg");
    const divDefeat = newCard.querySelector("#divDefeat");
    const winnerNick = newCard.querySelector("#winnerNick");
    const resTextL = newCard.querySelector("#matchWinner");
    const resTextW = newCard.querySelector("#matchOpponent");
    const tsDate = newCard.querySelector("#gameHCreatedOn");
    tsDate.textContent = element.creationTS.split(" ")[0];

    const gwin = newCard.querySelector("#gameWin");
    const twin = newCard.querySelector("#tournWin");
    const gloss = newCard.querySelector("#gameLoss");
    const tloss = newCard.querySelector("#tournLoss");

    if (element.winnerUserID != await UserInfo.getUserID()) {
        divDefeat.classList.remove("d-none");
        resTextL.classList.remove("d-none");
        if (!element.tournamentID) {
            gloss.classList.remove("d-none");
        } else {
            tloss.classList.remove("d-none");
        }
        winnerNick.textContent = element.winnerNick;
        if (element.winnerUserID == element.user1ID) {
            winnerImg.src = `/static/img/profilePic/${element.user1Avatar}`;
        } else {
            winnerImg.src = `/static/img/profilePic/${element.user2Avatar}`;
        }
    } else {
        divDefeat.classList.remove("d-none");
        if (!element.tournamentID) {
            gwin.classList.remove("d-none");
            resTextW.classList.remove("d-none");
        } else {
            twin.classList.remove("d-none");
        }
        if (element.winnerUserID == element.user1ID) {
            if (!element.tournamentID) winnerNick.textContent = element.user2Nick;
            winnerImg.src = `/static/img/profilePic/${element.user1Avatar}`;
        } else {
            if (!element.tournamentID) winnerNick.textContent = element.user1Nick;
            winnerImg.src = `/static/img/profilePic/${element.user2Avatar}`;
        }
    }
}

function insertHomeFriendInfo(newCard, element, users_on) {
    newCard.querySelector('#friendNick').textContent = element.friendNick;
    newCard.querySelector('#friendImg').textContent = `/static/img/profilePic/${element.friendAvatar}`;
    const userOnStatus = newCard.querySelector("#userOnStatus");

    if (users_on.includes(Number(element.friendID))) {
        userOnStatus.style.backgroundColor = "green";
    } else {
        userOnStatus.style.backgroundColor = "white";
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