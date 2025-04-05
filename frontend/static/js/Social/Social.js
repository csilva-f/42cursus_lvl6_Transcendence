function GlobalFriendsSelect(elementID) {
    const element = document.getElementById(elementID);
    if (elementID == "loadGlobalUsers") {
        const otherElement = document.getElementById('loadFriendUsers');
        otherElement.classList.remove('iconActive');
        disableIcon(otherElement);
        activateIcon(element);
        document.getElementById('reloadIconLi').setAttribute("data-id", 1);
        fetchUsers();
    } else if (elementID == "loadFriendUsers") {
        const otherElement = document.getElementById('loadGlobalUsers');
        otherElement.classList.remove('iconActive');
        disableIcon(otherElement);
        activateIcon(element);
        document.getElementById('reloadIconLi').setAttribute("data-id", 2);
        fetchFriends();
    }
}

function reloadSocialInformation(ID) {
    if (ID == '1')
        fetchUsers();
    else
        fetchFriends();
}

function insertGlobalUserInfo(newCard, user, users_on) {
    const userNick = newCard.querySelector("#userNick");
    const userLvl = newCard.querySelector("#userLvl");
    const userAvatar = newCard.querySelector("#userAvatar");
    const friendLi = newCard.querySelector("#friendLi");
    const profileLi = newCard.querySelector("#profileLi");
    const userOnStatus = newCard.querySelector("#userOnStatus");
    userNick.textContent = user.userNick;
    userLvl.textContent = user.userLevel;
    userAvatar.src = `/static/img/profilePic/${user.userAvatar}`;
    friendLi.setAttribute("data-id", user.userID);
    friendLi.setAttribute("data-type", 0);
    profileLi.setAttribute("data-id", user.userID);

    if (users_on.includes(Number(user.userID))) {
        userOnStatus.style.backgroundColor = "green"; // Online
    } else {
        userOnStatus.style.backgroundColor = "white"; // Offline
        userOnStatus.style.border = "1px solid gray";
    }
}

function insertFriendInfo(newCard, user, users_on) {
    newCard.querySelector("#userNick").textContent = user.friendNick;
    newCard.querySelector("#userLvl").textContent = user.friendLevel;
    newCard.querySelector("#userAvatar").src = `/static/img/profilePic/${user.userAvatar}`;
    newCard.querySelector("#friendLi").setAttribute("data-id", user.friendID);
    newCard.querySelector("#friendLi").setAttribute("data-type", 1);
    newCard.querySelector("#friendLiIcon").classList.remove("fa-user-plus")
    newCard.querySelector("#friendLiIcon").classList.add("fa-user-minus")
    newCard.querySelector("#profileLi").setAttribute("data-id", user.friendID);

    const userOnStatus = newCard.querySelector("#userOnStatus");
    if (users_on.includes(Number(user.friendID))) {
        userOnStatus.style.backgroundColor = "green"; // Online
    } else {
        userOnStatus.style.backgroundColor = "white"; // Offline
        userOnStatus.style.border = "1px solid gray";
    }
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
    if (userID == null) {
        window.history.pushState({}, "", `/profile`);
        locationHandler();
        fetchProfileInfo();
        fetchStatistics();
    } else {
        window.history.pushState({}, "", `/profile/${userID}`);
        locationHandler();
        fetchProfileInfo(userID);
        fetchStatistics(userID);
    }
}

async function friendshipPlayer(ID, type){
    if (type == '0')
        await addPlayer(ID)
    else
        await removePlayer(ID)
}