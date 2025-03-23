const KEY_ARROWUP = 38;
const KEY_ARROWDOWN = 40;
const KEY_W = 87;
const KEY_S = 83;
const keyPressed = [];
const maxSpeed = 10;
const maxScore = 5;
const ballVelocity = 5;
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

class Game  {
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
        this.ws = ws;
        this.isHost = isHost;
    }
    initGame() {
        console.log("onload");
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
            console.log(this.gameData)
            this.objects = [
                new Ball(this.canvas.width / 2, this.canvas.height / 2, this.ballVelocity, this.ballVelocity, this.ballRadius),
                new Paddle(1, paddleWidth, paddleHeight, this.gameData.P1Color, 30, (this.canvas.height / 2) - 75, paddleVelocity),
                new Paddle(2, paddleWidth, paddleHeight, this.gameData.P2Color,  this.canvas.width - 50, (this.canvas.height / 2) - 75 , paddleVelocity)
            ]
            document.getElementById("leftPlayerName").innerHTML = this.gameData.P1;
            document.getElementById("rightPlayerName").innerHTML = this.gameData.P2;
        }
        document.getElementById("playerLeftScore").innerHTML = this.objects[1].paddleScore;
        document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
        startTimer();
        // this.ws.onmessage = (event) => {
        //     const data = JSON.parse(event.data);
        //     // console.log("Element:", data.element);
        //     // console.log("Side:", data.paddleSide);
        //     // console.log("X:", data.paddleX);
        //     // console.log("Y:", data.paddleY);
        //     //NOTE - 1 - Atualizar a bola
        //     if (data.element == 0) { //saber se e a a minha bola faz sentido? o nuno diz que nao
        //         this.ballUpdateByValue(this.objects[0], data.ballX, data.ballY, data.ballVelocityX, data.ballVelocityY);
        //     }
        //     //NOTE - 2 - Atualizar o paddle
        //     if (data.element == 1) {
        //         this.paddleUpdateByValue(this.objects[data.paddleSide], data.paddleX, data.paddleY);
        //     }
        // };
        this.gameLoop();
    }
    gameLoop() {
        // window.onresize = function() {
        //     this.resize();
        //     this.objects[1].setPaddleX(30);
        //     this.objects[2].setPaddleX(this.canvas.width - 50);
        // }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.stopGame) {
            window.requestAnimationFrame(() => this.gameLoop());
            if (this.ws == null)
                this.localGame()
            else if(this.isHost)
                this.hostGame()
            else
                this.joinerGame()
        } else
            showGameStats("Shin", this.objects[1].paddleScore, this.objects[1].paddleColisionTimes, "Chan", this.objects[2].paddleScore, this.objects[2].paddleColisionTimes);
    }
    localGame(){
        this.gameUpdate();
        this.incScore();
        this.gameDraw();
    }
    hostGame(){
        //Update bola e paddle direito
        this.elementUpdate(this.objects[0]);
        this.objects[1].colissionBall(this.objects[0], this.objects[1]); //colisao da bola com o paddle esquerdo
        this.elementUpdate(this.objects[2]); //atualiza o padle consoante as teclas, colisao do paddle com os limites cima e baixo da canva e colisao da bola com o paddle

        //NOTE - SEND MESSAGES
        const ball_msg = JSON.stringify(this.objects[0].toJSON());
        this.ws.send(ball_msg);
        const paddle_msg = JSON.stringify(this.objects[2].toJSON());
        this.ws.send(paddle_msg);

        // TODO
        //4 - Inc score
        this.incScore();
        //5 - draw
        this.gameDraw();
    }
    joinerGame() {
        this.elementUpdate(this.objects[0]);
        this.objects[1].colissionBall(this.objects[0], this.objects[1]); //colisao da bola com o paddle esquerdo
        this.elementUpdate(this.objects[1]);

        //NOTE - 1 - Atualizar o paddle esquerdo e colisao com bola

        const msg = JSON.stringify(this.objects[1].toJSON());
        this.ws.send(msg);
        const ball_msg = JSON.stringify(this.objects[0].toJSON());
        this.ws.send(ball_msg);

        //4 - Inc scores
        this.incScore();
        //5 - draw
        this.gameDraw();

        // OLD CODE
                //1 - update ball
        //this.objects[0].update(); //update ball

        //2 - update left paddle
        // this.objects[1].update(); 
        // this.objects[1].colissionEdge(this.canvas);
        //this.objects[1].colissionBall(this.objects[0], element);
        // const msg = JSON.stringify(this.objects[1].toJSON());
        // this.ws.send(msg);

    }
    gameUpdate(){
        this.objects.forEach(element => {
            this.elementUpdate(element);
        });
    }
    elementUpdate(element){
        element.update();
        element.colissionEdge(this.canvas);
        if (element instanceof Paddle)
            element.colissionBall(this.objects[0]);
    }
    paddleUpdateByValue(element, x, y){
        element.updateByValue(x, y);
        element.colissionEdge(this.canvas);
        element.colissionBall(this.objects[0], element);
    }
    ballUpdateByValue(element, x, y, velocityX, velocityY){
        element.updateByValue(x, y, velocityX, velocityY);
        element.colissionEdge(this.canvas);
        this.objects[1].colissionBall(element, this.objects[1]);
        this.objects[1].colissionBall(element, this.objects[1]);
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