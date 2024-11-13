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
            fetchGames();
        } else if (happeningIDCheck.includes(elementID)) {
            disableIcon(searchingLi);
            disableIcon(finishedLi);
            activateIcon(happeningLi);
        } else if (finishedIDCheck.includes(elementID)) {
            disableIcon(searchingLi);
            disableIcon(happeningLi);
            activateIcon(finishedLi);
        }
}

function setRandomImage(imgElement) {
    const randomIndex = Math.floor(Math.random() * botImages.length);
    imgElement.src = botImages[randomIndex];
}