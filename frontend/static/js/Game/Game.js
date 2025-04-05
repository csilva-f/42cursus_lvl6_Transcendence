const KEY_ARROWUP = 38;
const KEY_ARROWDOWN = 40;
const KEY_W = 87;
const KEY_S = 83;
const F5 = 116;
const keyPressed = [];
const maxSpeed = 14;
const maxScore = 5;
const ballVelocity = 6;
const ballVellocityIncreaseRate = 1.2;
const ballRadius = 15;
const paddleWidth = 20;
const paddleHeight = 150;
const paddleVelocity = 10;
var stopGame = false;
const wsConnections = {};

window.addEventListener('keydown', function (e) {
    keyPressed[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keyPressed[e.keyCode] = false;
})

window.addEventListener("popstate", function (e) {
    keyPressed["back"] = true;
    // Handle back button event (e.g., show a warning or log data)
})

window.addEventListener("beforeunload", function (e) {
    keyPressed["close"] = true;
    //console.log("Aba ou navegador foi fechado!");
});

class Game  {
    constructor(gameData) {
        this.gameData = gameData
        this.canvas = document.getElementById("pongGameCanvas")
        this.ctx = this.canvas.getContext('2d');
        this.objects = []
        this.ballVelocity = ballVelocity;
        this.ballRadius = 15;
        this.maxScore = maxScore;
        this.stopGame = false;
    }
    initGame() {
        console.info("onload");
        //this.canvas = document.getElementById('pongGameCanvas');
        //const context = canvas.getContext('2d');

        // Get the device pixel ratio (DPR)
        const dpr = window.devicePixelRatio || 1;

        // Set the logical canvas size (how big it should appear visually)
        const width = 1200;
        const height = 550;

        // Set the actual canvas size (scale by the device pixel ratio)
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        // Scale the context to account for the device pixel ratio
        this.ctx.scale(dpr, dpr);

        if (this.gameData == null) {
            this.objects = [
                new Ball(this.canvas.width / 2, this.canvas.height / 2, this.ballVelocity, this.ballVelocity, this.ballRadius),
                new Paddle(1, paddleWidth, paddleHeight, "#482445", 30, (this.canvas.height / 2) - 75, 10),
                new Paddle(2, paddleWidth, paddleHeight, "#de94ad",  this.canvas.width - 50, (this.canvas.height / 2) - 75 , 10)
            ]
            document.getElementById("leftPlayerName").innerHTML = "Shin";
            document.getElementById("rightPlayerName").innerHTML = "Chan";
        } else {
            //console.log(this.gameData)
            this.objects = [
                new Ball(this.canvas.width / 2, this.canvas.height / 2, this.ballVelocity, this.ballVelocity, this.ballRadius),
                new Paddle(1, paddleWidth, paddleHeight, "#482445", 30, (this.canvas.height / 2) - 75, paddleVelocity),
                new Paddle(2, paddleWidth, paddleHeight, "#de94ad",  this.canvas.width - 50, (this.canvas.height / 2) - 75 , paddleVelocity)
            ]
            document.getElementById("leftPlayerName").innerHTML = this.gameData.P1;
            document.getElementById("rightPlayerName").innerHTML = this.gameData.P2;
        }
        document.getElementById("playerLeftScore").innerHTML = this.objects[1].paddleScore;
        document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
        startTimer();
        this.gameLoop();
    }

    async gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.stopGame && !keyPressed["close"] && !keyPressed["back"]) {
            window.requestAnimationFrame(async () => this.gameLoop());
            this.gameUpdate();
            this.incScore();
            this.gameDraw();
            //console.log("game on going");
        }
        else if (keyPressed["close"] || keyPressed["back"]) {
              //keyPressed["finishGame"] = false;
              await updateGameStatusForceFinish(this.gameData);
              if (keyPressed["back"]){
                  window.history.pushState({}, "", `/games`);
                  await locationHandler();
              }
        } else {
            //console.log("Normal finish!");
            showGameStats(this.gameData.P1, this.objects[1].paddleScore, this.objects[1].paddleColisionTimes, this.gameData.P2, this.objects[2].paddleScore, this.objects[2].paddleColisionTimes, this.gameData.isTournament);
            startWinAnimation();
            const data = {
                uid: this.gameData.P1_uid,
                gameID: this.gameData.gameID, 
                user1_points : this.objects[1].paddleScore,
                user2_points: this.objects[2].paddleScore,
                user1_hits: this.objects[1].paddleColisionTimes,
                user2_hits: this.objects[2].paddleColisionTimes,
            }
            await updateGameStatus(data);
        }
    }
    gameUpdate(){
        this.paddleUpdateLeft();
        this.paddleUpdateRight();
        this.ballUpdate();
    }
    ballUpdate(){
        this.objects[0].update();
        this.objects[0].colissionEdge(this.canvas);
    }
    paddleUpdateLeft(){
        this.objects[1].update();
        this.objects[1].colissionEdge(this.canvas);
        let colision = this.objects[1].leftColissionBall(this.objects[0]);
        if(colision){
            console.log("Colision left: update ball again");
            this.objects[1].paddleColisionTimes++;
            this.objects[0].lastColision = 1;
            //this.objects[0].update();
        }
    }
    paddleUpdateRight(){
        this.objects[2].update();
        this.objects[2].colissionEdge(this.canvas);
        let colision = this.objects[2].rightColissionBall(this.objects[0]);
        if(colision){
            console.log("Colision right: update ball again");
            this.objects[2].paddleColisionTimes++;
            this.objects[0].lastColision = 2;
            //this.objects[0].update();
        }
    }
    gameDraw() {
        this.objects.forEach(element => {
            element.draw(this.ctx);
        });
    }
    incScore() {
        if (this.objects[0].ballX + this.objects[0].ballRadius < 0){
            this.objects[0].lastColision = 0;
            this.objects[2].paddleScore += 1;
            document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
            if(this.objects[2].paddleScore < this.maxScore)
                this.respawnBall();
            else {
                this.stopGame = true;
                stopTimer();
            }
        }
        if (this.objects[0].ballX - this.objects[0].ballRadius > this.canvas.width){
            this.objects[0].lastColision = 0;
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
        console.info("respawn")
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
