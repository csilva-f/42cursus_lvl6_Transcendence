let timer;
let timerSeconds = 0;
let timerActive = false;


function showGameStats(leftName, leftScore, leftColision, rightName, rightScore, rightColision) {
    console.log(window.location.href);
    const pongGameDiv = document.getElementById('pongGameDiv');
    const mainGameScore = document.getElementById('mainGameScore');
    const finishedGame = document.getElementById('finishedGame');

    pongGameDiv.classList.add('d-none');
    mainGameScore.classList.add('d-none');
    finishedGame.classList.remove('d-none');

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
    matchTotalTime.textContent = formatTime(timerSeconds || 0); // Garante que timerSeconds seja um número válido

    // Animação de vitória
    startWinAnimation();
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
}

async function updateGameStatus(gameData){
    const userLang = localStorage.getItem("language") || "en";
    const langData = await getLanguageData(userLang);
    const data = {
        uid: gameData.P1_uid,
        gameID: gameData.gameId, 
        user1_points : gameData.objects[1].paddleScore,
        user2_points: gameData.objects[2].paddleScore,
        user1_hits: gameData.objects[1].paddleColisionTimes,
        user2_hits: gameData.objects[2].paddleColisionTimes,
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

async function updateGameStatusForceFinish(gameData){
    const userLang = localStorage.getItem("language") || "en";
    const langData = await getLanguageData(userLang);
    const data = {
        uid: gameData.P1_uid,
        gameID: gameData.gameId,
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