

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
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // console.log("Element:", data.element);
            // console.log("Side:", data.paddleSide);
            // console.log("X:", data.paddleX);
            // console.log("Y:", data.paddleY);
            //NOTE - 1 - Atualizar a bola
            if (data.element == 0) { //saber se e a a minha bola faz sentido? o nuno diz que nao
                this.ballUpdateByValue(data.ballX, data.ballY, data.ballVelocityX, data.ballVelocityY);
            }
            //NOTE - 2 - Atualizar o paddle
            if (data.element == 1) {
                this.paddleUpdateByValue(this.objects[data.paddleSide], data.paddleY);
                if(data.paddleSide == 1){
                    this.objects[1].paddleScore = data.paddleScore;
                    document.getElementById("playerLeftScore").innerHTML = data.paddleScore;
                }
                if(data.paddleSide == 2)
                    document.getElementById("playerRightScore").innerHTML = data.paddleScore;
            }
        };
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
            if(this.isHost)
                this.hostGame();
            else
                this.joinerGame();

            // if (this.ws == null)
            //     this.localGame()
            // else if(this.isHost)
            //     this.hostGame()
            // else
            //     this.joinerGame()
        } else
            showGameStats("Shin", this.objects[1].paddleScore, this.objects[1].paddleColisionTimes, "Chan", this.objects[2].paddleScore, this.objects[2].paddleColisionTimes);
    }
    hostGame(){
        this.gameUpdate();
        this.incScore();
        this.gameDraw();
    }
    joinerGame(){
        this.objects[0].update();
        this.objects[0].colissionEdge(this.canvas);
        this.objects[2].colissionBall(this.objects[0]);
        this.paddleUpdate(this.objects[1]);
        this.gameDraw();
    }
    gameUpdate(){
        this.ballUpdate();
        this.paddleUpdate(this.objects[1]);
        this.paddleUpdate(this.objects[2]);
    }
    //update da bola pela velocidade
    ballUpdate(){
        this.objects[0].update();
        this.objects[0].colissionEdge(this.canvas);
        this.objects[1].remoteColissionBall(this.objects[0], this.ws, this.isHost);
        this.objects[2].remoteColissionBall(this.objects[0], this.ws, this.isHost);
    }
    ballUpdateByValue(x, y, velocityX, velocityY){
        this.objects[0].updateByValue(x, y, velocityX, velocityY);
        this.objects[0].colissionEdge(this.canvas);
        this.objects[1].colissionBall(this.objects[0]);
        this.objects[2].colissionBall(this.objects[0]);
    }
    //update do paddle pelas teclas e update da colisao do paddle com a bola
    paddleUpdate(paddle){
        paddle.updateRemote(this.isHost, this.ws);
        paddle.colissionEdge(this.canvas);
        paddle.remoteColissionBall(this.objects[0], this.ws, this.isHost);
    }
    paddleUpdateByValue(paddle, y){
        paddle.paddleY = y;
        paddle.colissionEdge(this.canvas);
        paddle.colissionBall(this.objects[0]);
    }
    gameDraw() {
        this.objects.forEach(element => {
            element.draw(this.ctx);
        });
    }
    incScore() {
        if (this.objects[0].ballX <= -this.objects[0].ballRadius){
            this.objects[2].paddleScore += 1;
            let msg = JSON.stringify(this.objects[2].toJSON());
            this.ws.send(msg);
            //document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
            if(this.objects[2].paddleScore < this.maxScore)
                this.respawnBall();
            else {
                this.stopGame = true;
                stopTimer();
            }
        }
        if (this.objects[0].ballX >= this.canvas.width + this.objects[0].ballRadius){
            this.objects[1].paddleScore += 1;
            let msg = JSON.stringify(this.objects[1].toJSON());
            this.ws.send(msg);
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
        let msg = JSON.stringify(this.objects[0].toJSON());
        this.ws.send(msg);
    }

    //DEPRECATED
    hostGameDepre(){
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
    joinerGameDepre() {
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
    resize() {
        const marginWidth = window.innerWidth * 0.3;
        const marginHeight = window.innerHeight * 0.4;
        this.canvas.width = window.innerWidth - marginWidth;
        this.canvas.height = window.innerHeight - marginHeight;
    }
}