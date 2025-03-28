async function insertHistoryInfo(newCard, element) {
    const winnerImg = newCard.querySelector("#winnerImg");
    const matchResult = newCard.querySelector("#matchResult");
    const divDefeat = newCard.querySelector("#divDefeat");
    const winnerNick = newCard.querySelector("#winnerNick");

    if (element.winnerUserID != await UserInfo.getUserID()) {
        element.tournamentID == null ? matchResult.textContent = "Defeat" : matchResult.textContent = "Tournament Defeat";
        divDefeat.classList.remove("d-none");
        element.winnerUserID == element.user1ID ? winnerNick.textContent = element.user1Nick : winnerNick.textContent = element.user2Nick
    } else {
        element.tournamentID == null ? matchResult.textContent = "Winner" : matchResult.textContent = "Tournament Winner";
        winnerImg.src = "/static/img/pfp1.jpeg";
    }
}

function insertHomeFriendInfo(newCard, element, users_on) {
    newCard.querySelector('#friendNick').textContent = element.friendNick;
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
}