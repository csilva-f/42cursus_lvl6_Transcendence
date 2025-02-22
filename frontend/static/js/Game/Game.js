const KEY_ARROWUP = 38;
const KEY_ARROWDOWN = 40;
const KEY_W = 87;
const KEY_S = 83;
const keyPressed = [];
const maxSpeed = 10;
const maxScore = 5;
const ballVelocity = 5;
const ballRadius = 15;
var stopGame = false;


window.addEventListener('keydown', function (e) {
    keyPressed[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keyPressed[e.keyCode] = false;
})
/*
function respawnBall(canvas, objects) {
    if (objects[0].ballVelocityX > 0) {
        objects[0].ballX = canvas.width / 2;
        objects[0].ballY = (Math.random() * (canvas.height - 200)) + 100;
    }
    if (objects[0].ballVelocityX < 0) {
        objects[0].ballX = canvas.width / 2;
        objects[0].ballY = (Math.random() * (canvas.height - 200)) + 100;
    }
    if(objects[0].ballVelocityX < 0)
        objects[0].ballVelocityX = ballVelocity;
    else
        objects[0].ballVelocityX = -ballVelocity;
    objects[0].ballVelocityY *= -1;
}

function incScore(canvas, objects) {
    if (objects[0].ballX <= -objects[0].ballRadius){
        objects[2].paddleScore += 1;
        document.getElementById("playerRightScore").innerHTML = objects[2].paddleScore;
        if(objects[2].paddleScore < maxScore){
            respawnBall(canvas, objects);
        }
        else {
            stopGame = true;
            stopTimer();
        }
    }
    if (objects[0].ballX >= canvas.width + objects[0].ballRadius){
        objects[1].paddleScore += 1;
        document.getElementById("playerLeftScore").innerHTML = objects[1].paddleScore;
        if(objects[1].paddleScore < maxScore){
            respawnBall(canvas, objects);
        }
        else {
            stopGame = true;
            stopTimer();
        }
    }
}

function gameUpdate(canvas, objects) {
    objects.forEach(element => {
        element.update();
        element.colissionEdge(canvas);
        if (element instanceof Paddle)
            element.colissionBall(objects[0], element);
    });
    incScore(canvas, objects);
}

function gameDraw(ctx, objects) {
    objects.forEach(element => {
        element.draw(ctx);
    });
}

function resize(canvas){
    const rootStyle = getComputedStyle(document.documentElement);
    const remToPixels = parseFloat(rootStyle.fontSize);
    const marginWidth = window.innerWidth * 0.3;
    const marginHeight = window.innerHeight * 0.4;

    canvas.width = window.innerWidth - marginWidth;
    canvas.height = window.innerHeight - marginHeight;
}

function gameLoop(canvas, ctx, objects) {
    window.onresize = function() {
        resize(canvas);
        objects[1].setPaddleX(30);
        objects[2].setPaddleX(canvas.width - 50);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!stopGame) {
        window.requestAnimationFrame(() => gameLoop(canvas, ctx, objects));
        gameUpdate(canvas, objects);
        gameDraw(ctx, objects);
    } else
        showGameStats("Shin", objects[1].paddleScore, objects[1].paddleColisionTimes, "Chan", objects[2].paddleScore, objects[2].paddleColisionTimes);
}

function initGame() {
    /* Main Initializations */
    const canvas = document.getElementById("pongGameCanvas");
    const ctx = canvas.getContext('2d');
    const gameData = JSON.parse(localStorage.getItem('gameData'));
    var objects;

    resize(canvas);

    if (gameData == null) {
        objects = [
            new Ball(canvas.width / 2, canvas.height / 2, ballVelocity, ballVelocity, ballRadius),
            new Paddle(1, 20, 150, "#AC3B61", 30, (canvas.height / 2) - 75, 10),
            new Paddle(2, 20, 150, "#87709C", canvas.width - 50, (canvas.height / 2) - 75 , 10)
        ];
        document.getElementById("leftPlayerName").innerHTML = "Shin";
        document.getElementById("rightPlayerName").innerHTML = "Chan";
    } else {
        objects = [
            new Ball(canvas.width / 2, canvas.height / 2, ballVelocity, ballVelocity, ballRadius),
            new Paddle(1, 20, 150, gameData.P1Color, 30, (canvas.height / 2) - 75, 10),
            new Paddle(2, 20, 150, gameData.P2Color, canvas.width - 50, (canvas.height / 2) - 75, 10)
        ];
        document.getElementById("leftPlayerName").innerHTML = gameData.P1;
        document.getElementById("rightPlayerName").innerHTML = gameData.P2;
        localStorage.removeItem("gameData"); 
    }
    //* objects[0]: Ball
    //* objects[1]: PaddleLeft
    //* objects[2]: PaddleRight

    document.getElementById("playerLeftScore").innerHTML = objects[1].paddleScore;
    document.getElementById("playerRightScore").innerHTML = objects[2].paddleScore;
    startTimer();
    gameLoop(canvas, ctx, objects);
}*/

class Game  {
    constructor(gameID, gameData) {
        this.gameID = gameID
        this.gameData = gameData
        this.canvas = document.getElementById("pongGameCanvas")
        this.ctx = this.canvas.getContext('2d');
        this.objects = []
        this.ballVelocity = 5;
        this.ballRadius = 15;
        this.maxScore = 5;
        this.stopGame = false;
    }
    initGame() {
        this.resize();
        if (this.gameData == null) {
            this.objects = [
                new Ball(this.canvas.width / 2, this.canvas.height / 2, this.ballVelocity, this.ballVelocity, this.ballRadius),
                new Paddle(1, 20, 150, "#482445", 30, (this.canvas.height / 2) - 75, 10),
                new Paddle(2, 20, 150, "#de94ad",  this.canvas.width - 50, (this.canvas.height / 2) - 75 , 10)
            ]
            document.getElementById("leftPlayerName").innerHTML = "Shin";
            document.getElementById("rightPlayerName").innerHTML = "Chan";
        } else {
            console.log(this.gameData)
            this.objects = [
                new Ball(this.canvas.width / 2, this.canvas.height / 2, this.ballVelocity, this.ballVelocity, this.ballRadius),
                new Paddle(1, 20, 150, this.gameData.P1Color, 30, (this.canvas.height / 2) - 75, 10),
                new Paddle(2, 20, 150, this.gameData.P2Color,  this.canvas.width - 50, (this.canvas.height / 2) - 75 , 10)
            ]
            document.getElementById("leftPlayerName").innerHTML = this.gameData.P1;
            document.getElementById("rightPlayerName").innerHTML = this.gameData.P2;
        }
        document.getElementById("playerLeftScore").innerHTML = this.objects[1].paddleScore;
        document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
        startTimer();
        this.gameLoop();
    }
    gameLoop() {
        window.onresize = function() {
            this.resize();
            this.objects[1].setPaddleX(30);
            this.objects[2].setPaddleX(this.canvas.width - 50);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.stopGame) {
            window.requestAnimationFrame(() => this.gameLoop());
            this.gameUpdate();
            this.gameDraw();
        } else
            showGameStats("Shin", this.objects[1].paddleScore, this.objects[1].paddleColisionTimes, "Chan", this.objects[2].paddleScore, this.objects[2].paddleColisionTimes);
    }
    gameUpdate() {
        this.objects.forEach(element => {
            element.update();
            element.colissionEdge(this.canvas);
            if (element instanceof Paddle)
                element.colissionBall(this.objects[0], element);
        });
        this.incScore();
    }
    gameDraw() {
        this.objects.forEach(element => {
            element.draw(this.ctx);
        });
    }
    incScore() {
        if (this.objects[0].ballX <= -this.objects[0].ballRadius){
            this.objects[2].paddleScore += 1;
            document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
            if(this.objects[2].paddleScore < this.maxScore)
                this.respawnBall();
            else {
                this.stopGame = true;
                stopTimer();
            }
        }
        if (this.objects[0].ballX >= this.canvas.width + this.objects[0].ballRadius){
            this.objects[1].paddleScore += 1;
            document.getElementById("playerLeftScore").innerHTML = this.objects[1].paddleScore;
            if(this.objects[1].paddleScore < this.maxScore)
                this.respawnBall();
            else {
                this.stopGame = true;
                stopTimer();
            }
        }
    }
    respawnBall() {
        if (this.objects[0].ballVelocityX > 0) {
            this.objects[0].ballX = this.canvas.width / 2;
            this.objects[0].ballY = (Math.random() * (this.canvas.height - 200)) + 100;
        }
        if (this.objects[0].ballVelocityX < 0) {
            this.objects[0].ballX = this.canvas.width / 2;
            this.objects[0].ballY = (Math.random() * (this.canvas.height - 200)) + 100;
        }
        if(this.objects[0].ballVelocityX < 0)
            this.objects[0].ballVelocityX = ballVelocity;
        else
            this.objects[0].ballVelocityX = -ballVelocity;
        this.objects[0].ballVelocityY *= -1;
    }
    resize() {
        const marginWidth = window.innerWidth * 0.3;
        const marginHeight = window.innerHeight * 0.4;
        this.canvas.width = window.innerWidth - marginWidth;
        this.canvas.height = window.innerHeight - marginHeight;
    }
}