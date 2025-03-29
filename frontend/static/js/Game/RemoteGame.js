

window.addEventListener('keydown', function (e) {
    keyPressed[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keyPressed[e.keyCode] = false;
})

window.addEventListener("popstate", function (e) {
    keyPressed["finishGame"] = true;
    // Handle back button event (e.g., show a warning or log data)
})

window.addEventListener("beforeunload", function (e) {
    keyPressed["finishGame"] = true;
    //console.log("Aba ou navegador foi fechado!");
});

//add f5 ao finishGame

class RemoteGame  {
    constructor(gameData, ws, isHost) {
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
                new Paddle(1, paddleWidth, paddleHeight, "#482445", 30, (this.canvas.height / 2) - 75, paddleVelocity),
                new Paddle(2, paddleWidth, paddleHeight, "#de94ad",  this.canvas.width - 50, (this.canvas.height / 2) - 75 , paddleVelocity)
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
                if(data.paddleSide == 1)
                    this.paddleUpdateByValueLeft(data.paddleY);
                if(data.paddleSide == 2)
                    this.paddleUpdateByValueRight(data.paddleY);
            }
            //NOTE - 3 - Atualizar o score (golo)
            if (data.element == 3) {
                this.objects[data.paddleSide].paddleScore = data.paddleScore;
                this.objects[0].lastColision = 0;
                if(data.paddleSide == 1){
                    document.getElementById("playerLeftScore").innerHTML = data.paddleScore;
                }
                if(data.paddleSide == 2)
                    document.getElementById("playerRightScore").innerHTML = data.paddleScore;
            }
        };
        this.gameLoop();
    }
    async gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.stopGame && !keyPressed["finishGame"]) {
            window.requestAnimationFrame(() => this.gameLoop());
            if(this.isHost)
                this.hostGame();
            else
                this.joinerGame();
        } else if (keyPressed["finishGame"]) {
            keyPressed["finishGame"] = false;
            //mandar msg; fechar socket
            await updateGameStatusForceFinish(this.gameData);
        } else
            showGameStats(this.gameData.P1, this.objects[1].paddleScore, this.objects[1].paddleColisionTimes, this.gameData.P2, this.objects[2].paddleScore, this.objects[2].paddleColisionTimes);
    }
    hostGame(){
        this.gameUpdate();
        this.incScore();
        this.gameDraw();
    }
    joinerGame(){
        this.gameUpdate();
        this.gameDraw();
    }
    gameUpdate(){
        this.ballUpdate();
        this.paddleUpdateLeft();
        this.paddleUpdateRight();
    }
    //update da bola pela velocidade
    ballUpdate(){
        this.objects[0].update();
        this.objects[0].colissionEdge(this.canvas);
        //this.objects[1].colissionBall(this.objects[0]);
        //this.objects[2].colissionBall(this.objects[0]);
        let colision_left = this.objects[1].leftColissionBall(this.objects[0]);
        let colision_right = this.objects[2].rightColissionBall(this.objects[0]);
        if(colision_left){
            console.log("Colision with paddle LEFT! Update ball again");
            this.objects[0].lastColision = 1;
            this.objects[0].update();
            let msg = JSON.stringify(this.objects[0].toJSON()); 
            this.ws.send(msg);
        }
        if(colision_right){
            console.log("Colision with paddle RIGHT! Update ball again");
            this.objects[0].lastColision = 2;
            this.objects[0].update();
            if(this.isHost){
                let msg = JSON.stringify(this.objects[0].toJSON());
                this.ws.send(msg);
            }
        }
    }
    ballUpdateByValue(x, y, velocityX, velocityY){
        this.objects[0].updateByValue(x, y, velocityX, velocityY);
        this.objects[0].colissionEdge(this.canvas);
        let colision_left = this.objects[1].leftColissionBall(this.objects[0]);
        let colision_right = this.objects[2].rightColissionBall(this.objects[0]);
        if(colision_left){
            console.log("Colision with paddle LEFT! Update ball again");
            this.objects[0].lastColision = 1;
            this.objects[0].update();
        }
        if(colision_right){
            console.log("Colision with paddle RIGHT! Update ball again");
            this.objects[0].lastColision = 2;
            this.objects[0].update();
        }
    }
    //update do paddle pelas teclas e update da colisao do paddle com a bola
    paddleUpdateLeft(){
        this.objects[1].updateRemote(this.isHost, this.ws);
        this.objects[1].colissionEdge(this.canvas);
        let colision = this.objects[1].leftColissionBall(this.objects[0]);
        if(colision){
            console.log("Colision with paddle LEFT! Update ball again");
            this.objects[0].lastColision = 1;
            this.objects[0].update();
            let msg = JSON.stringify(this.objects[0].toJSON());
            this.ws.send(msg);
        }
    }
    paddleUpdateRight(){
        this.objects[2].updateRemote(this.isHost, this.ws);
        this.objects[2].colissionEdge(this.canvas);
        let colision = this.objects[2].rightColissionBall(this.objects[0]);
        if(colision){
            console.log("Colision with paddle RIGHT! Update ball again");
            this.objects[0].lastColision = 2;
            this.objects[0].update();
            if(this.isHost){
                let msg = JSON.stringify(this.objects[0].toJSON());
                this.ws.send(msg);
            }
        }
    }
    paddleUpdateByValueRight(y){
        this.objects[2].paddleY = y;
        this.objects[2].colissionEdge(this.canvas);
        let colision = this.objects[2].rightColissionBall(this.objects[0]);
        if(colision){
            console.log("Colision with paddle RIGHT! Update ball again");
            this.objects[0].lastColision = 2;
            this.objects[0].update();
        }
    }
    paddleUpdateByValueLeft(y){
        this.objects[1].paddleY = y;
        this.objects[1].colissionEdge(this.canvas);
        let colision = this.objects[1].rightColissionBall(this.objects[0]);
        if(colision){
            console.log("Colision with paddle LEFT! Update ball again");
            this.objects[0].lastColision = 1;
            this.objects[0].update();
        }
    }
    gameDraw() {
        this.objects.forEach(element => {
            element.draw(this.ctx);
        });
    }
    incScore() {
        if (this.objects[0].ballX <= -this.objects[0].ballRadius){
            this.objects[0].lastColision = 0;
            this.objects[2].paddleScore += 1;
            let msg = {
                element: 3,
                paddleSide: 2,
                paddleScore: this.objects[2].paddleScore,
            }
            this.ws.send(JSON.stringify(msg));
            //document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
            if(this.objects[2].paddleScore < this.maxScore)
                this.respawnBall();
            else {
                this.stopGame = true;
                stopTimer();
            }
        }
        if (this.objects[0].ballX >= this.canvas.width + this.objects[0].ballRadius){
            this.objects[0].lastColision = 0;
            this.objects[1].paddleScore += 1;
            let msg = {
                element: 3,
                paddleSide: 1,
                paddleScore: this.objects[1].paddleScore,
            }
            this.ws.send(JSON.stringify(msg));
            //document.getElementById("playerLeftScore").innerHTML = this.objects[1].paddleScore;
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
}