let timer;
let timerSeconds = 0;
let timerActive = false;


function showGameStats(leftName, leftScore, leftColision, rightName, rightScore, rightColision) {
    const pongGameDiv = document.getElementById('pongGameDiv');
    const mainGameScore = document.getElementById('mainGameScore');
    const finishedGame = document.getElementById('finishedGame');
    pongGameDiv.classList.add('d-none');
    mainGameScore.classList.add('d-none');
    finishedGame.classList.remove('d-none');
    // Names
    const leftPlayerNameFinished = document.getElementById('leftPlayerNameFinished');
    const rightPlayerNameFinished = document.getElementById('rightPlayerNameFinished');
    leftPlayerNameFinished.textContent = leftName;
    rightPlayerNameFinished.textContent = rightName;
    // Scores
    const playerLeftScoreFinished = document.getElementById('playerLeftScoreFinished');
    const playerRightScoreFinished = document.getElementById('playerRightScoreFinished');
    const scoreProgressLeft = document.getElementById('scoreProgressLeft');
    const scoreProgressRight = document.getElementById('scoreProgressRight');
    playerLeftScoreFinished.textContent = leftScore;
    playerRightScoreFinished.textContent = rightScore;
    let leftProgress = parseFloat((leftScore * 100) / (leftScore + rightScore))
    let rightProgress = parseFloat((rightScore * 100) / (leftScore + rightScore))
    scoreProgressLeft.style.width = leftProgress + "%"
    scoreProgressRight.style.width = rightProgress + "%"
    // Colision
    const playerLeftBalls = document.getElementById('playerLeftBalls');
    const playerRightBalls = document.getElementById('playerRightBalls');
    const colisionProgressLeft = document.getElementById('colisionProgressLeft');
    const colisionProgressRight = document.getElementById('colisionProgressRight');
    playerLeftBalls.textContent = leftColision;
    playerRightBalls.textContent = rightColision;
    leftProgress = parseFloat((leftColision * 100) / (leftColision + rightColision))
    rightProgress = parseFloat((rightColision * 100) / (leftColision + rightColision))
    colisionProgressLeft.style.width = leftProgress + "%"
    colisionProgressRight.style.width = rightProgress + "%"
    // Time
    const matchTotalTime = document.getElementById('matchTotalTime');
    matchTotalTime.textContent = formatTime(timerSeconds);
    // Win Animaton
    startWinAnimation()
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
}