function GlobalFriendsSelect(elementID) {
    const element = document.getElementById(elementID);
    if (elementID == "loadGlobalUsers") {
        const otherElement = document.getElementById('loadFriendUsers');
        otherElement.classList.remove('iconActive');
        disableIcon(otherElement);
        activateIcon(element);
        fetchUsers();
    } else if (elementID == "loadFriendUsers") {
        const otherElement = document.getElementById('loadGlobalUsers');
        otherElement.classList.remove('iconActive');
        disableIcon(otherElement);
        activateIcon(element);
        fetchFriends();
    }
}

function insertGlobalUserInfo(newCard, user) {
    const userNick = newCard.querySelector("#userNick");
    const userLvl = newCard.querySelector("#userLvl");
    const inviteLi = newCard.querySelector("#inviteLi");
    const friendLi = newCard.querySelector("#friendLi");
    const profileLi = newCard.querySelector("#profileLi");
    userNick.textContent = user.userNick;
    userLvl.textContent = user.userID;
    inviteLi.setAttribute("data-id", user.userID);
    friendLi.setAttribute("data-id", user.userID);
    friendLi.setAttribute("data-type", 0);
    profileLi.setAttribute("data-id", user.userID);
}

function insertFriendInfo(newCard, user) {
    newCard.querySelector("#userNick").textContent = user.friendNick;
    newCard.querySelector("#userLvl").textContent = user.friendID;
    newCard.querySelector("#inviteLi").setAttribute("data-id", user.friendID);
    newCard.querySelector("#friendLi").setAttribute("data-id", user.friendID);
    newCard.querySelector("#friendLi").setAttribute("data-type", 1);
    newCard.querySelector("#friendLiIcon").classList.remove("fa-user-plus")
    newCard.querySelector("#friendLiIcon").classList.add("fa-user-minus")
    newCard.querySelector("#profileLi").setAttribute("data-id", user.friendID);
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

async function friendshipPlayer(ID, type){
    if (type == '0')
        await addPlayer(ID)
    else
        await removePlayer(ID)
}