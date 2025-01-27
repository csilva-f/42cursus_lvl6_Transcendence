function GlobalFriendsSelect(elementID) {
    const element = document.getElementById(elementID);
    if (elementID == "loadGlobalUsers") {
        const otherElement = document.getElementById('loadFriendUsers');
        otherElement.classList.remove('iconActive');
        disableIcon(otherElement);
        activateIcon(element);
    } else if (elementID == "loadFriendUsers") {
        const otherElement = document.getElementById('loadGlobalUsers');
        otherElement.classList.remove('iconActive');
        disableIcon(otherElement);
        activateIcon(element);
    }
}

function insertUserInfo2(newCard, userName, usersImg) {
    const userImg = newCard.querySelector("#userImg");
    const userNick = newCard.querySelector("#userNick");
    const userGamesWon = newCard.querySelector("#userGamesWon");
    const userTournamentsWon = newCard.querySelector("#userTournamentsWon");
    userImg.src = usersImg;
    userNick.textContent = userName;
    userGamesWon.textContent = 3;
    userTournamentsWon.textContent = 3;
}

function insertUserInfo(newCard, user) {
    const userNick = newCard.querySelector("#userNick");
    const userLvl = newCard.querySelector("#userLvl");
    const userGamesWon = newCard.querySelector("#userGamesWon");
    const userTournamentsWon = newCard.querySelector("#userTournamentsWon");
    userNick.textContent = user.birthdate;
    userLvl.textContent = user.level;
    userGamesWon.textContent = user.victories;
    userTournamentsWon.textContent = user.tVictories;

}