function insertHistoryInfo(newCard, element, userID) {
    const winnerImg = newCard.querySelector("#winnerImg");
    const matchResult = newCard.querySelector("#matchResult");
    const divDefeat = newCard.querySelector("#divDefeat");
    const winnerNick = newCard.querySelector("#winnerNick");

    if (element.winnerUserID != userID) {
        element.tournamentID == null ? matchResult.textContent = "Defeat" : matchResult.textContent = "Tournament Defeat";
        divDefeat.classList.remove("d-none");
        console.log("element.winnerUserID: ", element.winnerUserID, " element.user1Nick: ", element.user1Nick, " element.user2Nick: ", element.user2Nick)
        element.winnerUserID == element.user1ID ? winnerNick.textContent = element.user1Nick : winnerNick.textContent = element.user2Nick
    } else {
        element.tournamentID == null ? matchResult.textContent = "Winner" : matchResult.textContent = "Tournament Winner";
        winnerImg.src = "/static/img/pfp1.jpeg";
    }
}

function insertHomeFriendInfo(newCard, element) {
    newCard.querySelector('#friendNick').textContent = element.friendNick
}