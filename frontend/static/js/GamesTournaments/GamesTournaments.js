const searchingIDCheck = ["searchingLi", "searchingID", "searchingIcon"];
const happeningIDCheck = ["happeningLi", "happeningID", "happeningIcon"];
const finishedIDCheck = ["finishedLi", "finishedID", "finishedIcon"];
const botImages = [
    '/static/img/bot/bot1.jpeg',
    '/static/img/bot/bot2.jpeg',
    '/static/img/bot/bot3.jpeg',
    '/static/img/bot/bot4.jpeg',
    '/static/img/bot/bot5.jpeg',
    '/static/img/bot/bot6.jpg',
];

function GamesTournamentsMatches(elementID) {
    const searchingLi = document.getElementById('searchingLi');
    const happeningLi = document.getElementById('happeningLi');
    const finishedLi = document.getElementById('finishedLi');
    if (searchingIDCheck.includes(elementID)) {
        disableIcon(happeningLi);
        disableIcon(finishedLi);
        activateIcon(searchingLi);
        fetchGames(1);
    } else if (happeningIDCheck.includes(elementID)) {
        disableIcon(searchingLi);
        disableIcon(finishedLi);
        activateIcon(happeningLi);
        fetchGames(2);
    } else if (finishedIDCheck.includes(elementID)) {
        disableIcon(searchingLi);
        disableIcon(happeningLi);
        activateIcon(finishedLi);
        fetchGames(3);
    }
}

function setRandomImage(imgElement) {
    const randomIndex = Math.floor(Math.random() * botImages.length);
    imgElement.src = botImages[randomIndex];
}

function insertInfo(newCard, element) {
    const enterBtn = newCard.querySelector("#enterLi");
    const user1Level = newCard.querySelector("#user1Level");
    const user1Nick = newCard.querySelector("#user1Nick");
    const user2Img = newCard.querySelector("#user2Img");
    const user2LvlLabel = newCard.querySelector("#user2LvlLabel");
    const user2Level = newCard.querySelector("#user2Level");
    const user2Nick = newCard.querySelector("#user2Nick");
    enterBtn.setAttribute("data-id", element.id);
    user1Level.textContent = element.user1;
    user1Nick.textContent = "{Nickname}";
    if (element.user2 == null) {
        setRandomImage(user2Img);
        user2LvlLabel.style.display = "none";
        user2Nick.setAttribute("data-i18n", "waiting");
    } else {
        user2Level.textContent = element.user2;
        user2Nick.textContent = "{Nickname2}";
    }
}