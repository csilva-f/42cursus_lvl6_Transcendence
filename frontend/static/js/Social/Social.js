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

function insertUserInfo(newCard, userName, usersImg) {
    const userImg = newCard.querySelector("#userImg");
    const userNick = newCard.querySelector("#userNick");
    userNick.textContent = userName;
    userImg.src = usersImg;

} 