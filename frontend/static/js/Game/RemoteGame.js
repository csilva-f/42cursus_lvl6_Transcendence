// const KEY_ARROWUP = 38;
// const KEY_ARROWDOWN = 40;
// const KEY_W = 87;
// const KEY_S = 83;
// const keyPressed = [];
// const maxSpeed = 10;
// const maxScore = 5;
// const ballVelocity = 5;
// const ballRadius = 15;
var stopGame = false;
//const wsConnections = {};

window.addEventListener('keydown', function (e) {
    keyPressed[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keyPressed[e.keyCode] = false;
})

class RemoteGame  {
    constructor(gameID, ws, isHost, gameData) {
        this.gameID = gameID
        this.gameData = gameData
        this.canvas = document.getElementById("pongGameCanvas")
        this.ctx = this.canvas.getContext('2d');
        this.objects = []
        this.ballVelocity = 5;
        this.ballRadius = 15;
        this.maxScore = 5;
        this.stopGame = false;
        this.isHost = isHost;
        this.ws = ws;
    }
    initRemoteGame() {
        console.log("Init remote game");
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
}