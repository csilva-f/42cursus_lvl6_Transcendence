function insertHistoryInfo(newCard, element, userID) {
    const winnerImg = newCard.querySelector("#winnerImg");
    const matchResult = newCard.querySelector("#matchResult");
    const divDefeat = newCard.querySelector("#divDefeat");
    const winnerNick = newCard.querySelector("#winnerNick");

    if (element.winnerUserID != userID) {
        element.tournamentID == null ? matchResult.textContent = "Defeat" : matchResult.textContent = "Tournament Defeat";
        divDefeat.classList.remove("d-none");
        winnerNick.textContent = "{IDK}";
    } else {
        element.tournamentID == null ? matchResult.textContent = "Winner" : matchResult.textContent = "Tournament Winner";
        winnerImg.src = "/static/img/pfp1.jpeg";
    }
}

function insertHomeFriendInfo(newCard, element) {
    newCard.querySelector('#friendNick').textContent = element.friendNick
}