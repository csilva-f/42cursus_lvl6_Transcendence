let timer;
let timerSeconds = 0;
let timerActive = false;

function goToHome() {
  window.history.pushState({}, "", "/");
  locationHandler();
}

async function goToScreen(isTournament) {
    window.history.pushState({}, "", "/games");
    await locationHandler();
    if (isTournament == '0') {
        console.log("[isTournament == 0]")
        const iconElement = document.getElementById("loadGamesIcon");
		disableIcon(iconElement);
		const iconStatusElement = document.getElementById("searchingLi");
		disableIcon(iconStatusElement);
        GamesTournamentsSelect('loadTournamentsIcon')
    }
}

//trocar home por games
//tirar botao de play again nos jogos remotos e de torneios
async function showGameStats(leftName, leftScore, leftColision, rightName, rightScore, 
    rightColision, removePlayAgain, imgLeft, imgRight, isTournament, gameDuration) {
    console.log(window.location.href);
    const pongGameDiv = document.getElementById('pongGameDiv');
    const mainGameScore = document.getElementById('mainGameScore');
    const finishedGame = document.getElementById('finishedGame');
    const playAgain = document.getElementById('playAgainButton');
    const homeButton = document.getElementById('homeButton');

    pongGameDiv.classList.add('d-none');
    mainGameScore.classList.add('d-none');
    finishedGame.classList.remove('d-none');
    if(removePlayAgain)
        playAgain.classList.add('d-none');
    if(isTournament)
        homeButton.setAttribute("data-id", 0);
    else
        homeButton.setAttribute("data-id", 1);

    // Imagens
    document.getElementById("leftPlayerImg").src = imgLeft;
    document.getElementById("rightPlayerImg").src = imgRight;

    // Nomes
    document.getElementById('leftPlayerNameFinished').textContent = leftName;
    document.getElementById('rightPlayerNameFinished').textContent = rightName;

    // Pontuação
    document.getElementById('playerLeftScoreFinished').textContent = leftScore;
    document.getElementById('playerRightScoreFinished').textContent = rightScore;

    const scoreProgressLeft = document.getElementById('scoreProgressLeft');
    const scoreProgressRight = document.getElementById('scoreProgressRight');

    let totalScore = leftScore + rightScore;
    let leftScoreProgress = totalScore > 0 ? (leftScore * 100) / totalScore : 50;
    let rightScoreProgress = totalScore > 0 ? (rightScore * 100) / totalScore : 50;

    scoreProgressLeft.style.width = leftScoreProgress + "%";
    scoreProgressRight.style.width = rightScoreProgress + "%";

    // Colisões
    document.getElementById('playerLeftBalls').textContent = leftColision;
    document.getElementById('playerRightBalls').textContent = rightColision;

    const colisionProgressLeft = document.getElementById('colisionProgressLeft');
    const colisionProgressRight = document.getElementById('colisionProgressRight');

    let totalColision = leftColision + rightColision;
    let leftColisionProgress = totalColision > 0 ? (leftColision * 100) / totalColision : 50;
    let rightColisionProgress = totalColision > 0 ? (rightColision * 100) / totalColision : 50;

    colisionProgressLeft.style.width = leftColisionProgress + "%";
    colisionProgressRight.style.width = rightColisionProgress + "%";

    // Tempo total da partida
    const matchTotalTime = document.getElementById('matchTotalTime');
    matchTotalTime.textContent = formatTime(gameDuration || 0); // Garante que timerSeconds seja um número válido
}

function startWinAnimation() {
    const randomIndex = Math.floor(Math.random() * 3);
    console.log("randomIndex: ", randomIndex)
    switch (randomIndex){
        case 0:
            fireworkAnimation();
            break;
        case 1:
            prideAnimation();
            break;
        case 2:
            assAnimation();
            break;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function startTimer() {
    if (!timerActive) {
        timerActive = true;
        timer = setInterval(() => {
            timerSeconds++;
        }, 1000);
    }
}

function stopTimer() {
    if (timerActive) {
        clearInterval(timer);
        timerActive = false;
    }
    return timerSeconds;
}

async function updateGameStatus(data){
    const userLang = localStorage.getItem("language") || "en";
    const langData = await getLanguageData(userLang);
    console.log(data);
    const APIurl = `/api/update-game/`;
    const accessToken = await JWT.getAccess();
    $.ajax({
        type: "POST",
        url: APIurl,
        Accept: "application/json",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify(data),
        success: async function (res) {
            console.log(res);
            await UserInfo.refreshUser();
            activateTopBar();
        },
        error: function (xhr, status, error) {
            showErrorToast(APIurl, error, langData);
        },
    });
}

async function updateGameStatusForceFinish(gameData){
    const userLang = localStorage.getItem("language") || "en";
    const langData = await getLanguageData(userLang);
    const data = {
        uid: gameData.P1_uid,
        gameID: gameData.gameID,
        statusID: 3,
    }
    console.log(data);
    const APIurl = `/api/update-game/`;
    const accessToken = await JWT.getAccess();
    $.ajax({
        type: "POST",
        url: APIurl,
        Accept: "application/json",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify(data),
        success: async function (res) {
            console.log(res);
        },
        error: function (xhr, status, error) {
            showErrorToast(APIurl, error, langData);
        },
    });
    await UserInfo.refreshUser();
    document.getElementById("topbar").classList.remove('d-none');
    activateTopBar();
}
