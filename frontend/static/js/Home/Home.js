function insertHistoryInfo(newCard, element, userID) {
    //const cardHistoryMainDiv = newCard.querySelector("#cardHistoryMainDiv");
    const winnerImg = newCard.querySelector("#winnerImg");
    const matchResult = newCard.querySelector("#matchResult");
    const divDefeat = newCard.querySelector("#divDefeat");
    const winnerNick = newCard.querySelector("#winnerNick");

    if (element.winnerUserID != userID) {
        //cardHistoryMainDiv.style.setProperty('border-color', '#e12729cc', 'important');
        element.tournamentID == null ? matchResult.textContent = "Defeat" : matchResult.textContent = "Tournament Defeat";
        divDefeat.classList.remove("d-none");
        winnerNick.textContent = "{IDK}";
    } else {
        //cardHistoryMainDiv.style.setProperty('border-color', '#007f4ecc', 'important');
        element.tournamentID == null ? matchResult.textContent = "Winner" : matchResult.textContent = "Tournament Winner";
        winnerImg.src = "/static/img/pfp1.jpeg";
    }
}
