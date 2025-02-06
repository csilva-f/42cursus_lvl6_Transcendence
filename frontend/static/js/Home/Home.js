function insertHistoryInfo(newCard, element, userID) {
    const cardHistoryMainDiv = newCard.querySelector("#cardHistoryMainDiv");
    const winnerImg = newCard.querySelector("#winnerImg");
    const matchResult = newCard.querySelector("#matchResult");
    const divDefeat = newCard.querySelector("#divDefeat");
    const winnerNick = newCard.querySelector("#winnerNick");
    if (element.winnerUserID != userID) {
        cardHistoryMainDiv.classList.add("border-danger");
        matchResult.textContent = "Defeat"
        divDefeat.classList.remove("d-none");
        winnerNick.textContent = "{IDK}"
    } else {
        cardHistoryMainDiv.classList.add("border-success");
        matchResult.textContent = "Winner"
    }
}
