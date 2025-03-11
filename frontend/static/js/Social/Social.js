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

function insertUserInfo(newCard, user) {
    const userNick = newCard.querySelector("#userNick");
    const userLvl = newCard.querySelector("#userLvl");
    const userGamesWon = newCard.querySelector("#userGamesWon");
    const userTournamentsWon = newCard.querySelector("#userTournamentsWon");
    const inviteLi = newCard.querySelector("#inviteLi");
    const profileLi = newCard.querySelector("#profileLi");
    userNick.textContent = user.userNick;
    userLvl.textContent = user.userID;
    userGamesWon.textContent = user.victories;
    userTournamentsWon.textContent = user.tVictories;
    inviteLi.setAttribute("data-id", user.userID);
    profileLi.setAttribute("data-id", user.userID);

}

function searchUser() {
    const userSearchInput = document.getElementById('userSearchInput');
    var filter = userSearchInput.value.toUpperCase();
    const usersCards = document.querySelectorAll("#cardUserContent");

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

function goToProfile(userID) {
	window.history.pushState({}, "", `/profile/${userID}`);
	locationHandler("content");
	fetchProfileInfo(userID);
	fetchStatistics(userID);
}