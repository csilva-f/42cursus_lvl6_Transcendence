var remoteWs;

window.addEventListener('keydown', function (e) {
    keyPressed[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keyPressed[e.keyCode] = false;
})

//add f5 ao finishGame

class RemoteGame  {
    constructor(gameData, ws, isHost) {
        this.gameData = gameData
        this.canvas = document.getElementById("pongGameCanvas")
        this.ctx = this.canvas.getContext('2d');
        this.objects = []
        this.ballVelocity = ballVelocity;
        this.ballRadius = 15;
        this.maxScore = 5;
        this.ws = ws;
        this.isHost = isHost;
        this.gameDuration = 0;
        this.disconnect = false;
        this.stopGame = false;
    }
    initGame() {
        closeGame = false;
        remoteWs = this.ws;
        remoteGame = true;
        //console.log("onload");
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
                new Paddle(1, paddleWidth, paddleHeight, "#94DEC5", 30, (this.canvas.height / 2) - 75, 10),
                new Paddle(2, paddleWidth, paddleHeight, "#de94ad",  this.canvas.width - 50, (this.canvas.height / 2) - 75 , 10)
            ]
            document.getElementById("leftPlayerName").innerHTML = "Shin";
            document.getElementById("rightPlayerName").innerHTML = "Chan";
        } else {
            //console.log(this.gameData)
            this.objects = [
                new Ball(this.canvas.width / 2, this.canvas.height / 2, this.ballVelocity, this.ballVelocity, this.ballRadius),
                new Paddle(1, paddleWidth, paddleHeight, "#94DEC5", 30, (this.canvas.height / 2) - 75, paddleVelocity),
                new Paddle(2, paddleWidth, paddleHeight, "#de94ad",  this.canvas.width - 50, (this.canvas.height / 2) - 75 , paddleVelocity)
            ]
            document.getElementById("leftPlayerName").innerHTML = this.gameData.P1;
            document.getElementById("leftPlayerGameImg").src = this.gameData.imgLeft;
            document.getElementById("rightPlayerName").innerHTML = this.gameData.P2;
            document.getElementById("rightPlayerGameImg").src = this.gameData.imgRight;
        }
        document.getElementById("playerLeftScore").innerHTML = this.objects[1].paddleScore;
        document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
        //this.runCountdown()
        if(this.isHost)
            startTimer();
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            //NOTE - 1 - Atualizar a bola
            if (data.element == 0) {
                if(!this.isHost)
                    this.ballUpdateByValue(data.ballX, data.ballY, data.ballVelocityX, data.ballVelocityY, data.lastColision);
            }
            //NOTE - 2 - Atualizar o paddle
            if (data.element == 1) {
                if(data.paddleSide == 1 && this.isHost)
                    this.paddleUpdateByValueLeft(data.paddleY);
                if(data.paddleSide == 2 && !this.isHost)
                    this.paddleUpdateByValueRight(data.paddleY);
            }
            //NOTE - 3 - Atualizar o score (golo)
            if (data.element == 3) {
                if(data.paddleSide == 1){
                    document.getElementById("playerLeftScore").innerHTML = data.paddleScore;
                }
                if(data.paddleSide == 2)
                    document.getElementById("playerRightScore").innerHTML = data.paddleScore;
                if(!this.isHost){
                    this.objects[data.paddleSide].paddleScore = data.paddleScore;
                    this.ballUpdateByValue(data.ballX, data.ballY, data.ballVelocityX, data.ballVelocityY, data.lastColision);
                }
            }
            if (data.element == 4){
                this.stopGame = true;
                if(!this.isHost){
                    this.objects[1].paddleColisionTimes = data.paddleColisionTimesLeft;
                    this.objects[2].paddleColisionTimes = data.paddleColisionTimesRight;
                    this.gameDuration = data.gameDuration;
                    this.objects[data.paddleSide].paddleScore = data.paddleScore;
                }
            }
            if(!this.isHost && data.message == "Refresh game status"){
                //console.log("IT WORKS")
                await UserInfo.refreshUser();
                await activateTopBar();
                showGameStats(this.gameData.P1, this.objects[1].paddleScore, 
                    this.objects[1].paddleColisionTimes, this.gameData.P2, 
                        this.objects[2].paddleScore, this.objects[2].paddleColisionTimes, 
                            true, this.gameData.imgLeft, this.gameData.imgRight, false, data.gameDuration);
                remoteGame = false;
                this.ws.close(1000);
                if(this.isWinner())
                    startWinAnimation();
            }
            if(data.message == "A player left the game." && data.close_code != 1000){
                this.disconnect = true;
                //console.log("close code:", data.close_code);
            }
        };
        this.gameLoop();
    }
    ballUpdateByValue(x, y, velocityX, velocityY, lastColision){
        //console.log("=>> Ball update by value")
        this.objects[0].updateByValue(x, y, velocityX, velocityY, lastColision);
        this.objects[0].colissionEdge(this.canvas);
    }
    paddleUpdateByValueRight(y){
        this.objects[2].paddleY = y;
        this.objects[2].colissionEdge(this.canvas);
        this.objects[2].rightColissionBall(this.objects[0], remoteMaxSpeed);
        //console.log("=>> Paddle update right by value")
    }
    paddleUpdateByValueLeft(y){
        this.objects[1].paddleY = y;
        this.objects[1].colissionEdge(this.canvas);
        let colision = this.objects[1].leftColissionBall(this.objects[0], remoteMaxSpeed);
        if(colision && this.isHost)
            this.objects[1].paddleColisionTimes++;
    }
    isWinner(){
        if(this.isHost && this.objects[2].paddleScore > this.objects[1].paddleScore)
            return true;
        if(!this.isHost && this.objects[1].paddleScore > this.objects[2].paddleScore)
            return true;
        return false;
    }
    async gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.stopGame && !this.disconnect && !closeGame) { //!keyPressed["back"] &&
            window.requestAnimationFrame(() => this.gameLoop());
            if(this.isHost)
                this.hostGame();
            else
                this.joinerGame();
        } else if(closeGame){
            //console.log("force finish");
            closeGame = false;
            remoteGame = false;
        } else if (this.disconnect){
            //console.log("disconect");
            this.ws.close(3000); // meu codigo de unexpected close
            window.history.pushState({}, "", `/games`);
            await locationHandler();
            remoteGame = false;
        } else if (this.stopGame){
            if(this.isHost){
                const data = {
                    uid: this.gameData.P2_uid,
                    gameID: this.gameData.gameID,
                    user1_points: this.objects[2].paddleScore,
                    user2_points: this.objects[1].paddleScore,
                    user1_hits: this.objects[2].paddleColisionTimes,
                    user2_hits: this.objects[1].paddleColisionTimes,
                    isT: this.gameData.isTournament,
                    P1: this.gameData.P1,
                    P2: this.gameData.P2,
                    imgLeft: this.gameData.imgLeft,
                    imgRight: this.gameData.imgRight,
                }
                await updateGameStatus(data, this.ws, this.isWinner());
            }
            remoteGame = false;
        }
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
        this.paddleUpdateLeft();
        this.paddleUpdateRight();
        this.ballUpdate();
    }
    //update da bola pela velocidade
    ballUpdate(){
        this.objects[0].update();
        this.objects[0].colissionEdge(this.canvas);
    }
    //update do paddle pelas teclas e update da colisao do paddle com a bola
    paddleUpdateLeft(){
        this.objects[1].updateRemote(this.isHost, this.ws);
        this.objects[1].colissionEdge(this.canvas);
        let colision = this.objects[1].leftColissionBall(this.objects[0], remoteMaxSpeed);
        if(colision){
            // console.log("=>> Paddle update left")
            // console.log("Colision with paddle LEFT! Update ball again");
            if(this.isHost){
                this.objects[1].paddleColisionTimes++;
                let msg = JSON.stringify(this.objects[0].toJSON());
                this.ws.send(msg);
            }
        }
    }
    paddleUpdateRight(){
        this.objects[2].updateRemote(this.isHost, this.ws);
        this.objects[2].colissionEdge(this.canvas);
        let colision = this.objects[2].rightColissionBall(this.objects[0], remoteMaxSpeed);
        if(colision){
            //console.log("=>> Paddle update right")
            //console.log("Colision with paddle RIGHT! Update ball again");
            if(this.isHost){
                this.objects[2].paddleColisionTimes++;
                let msg = JSON.stringify(this.objects[0].toJSON());
                this.ws.send(msg);
            }
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
            //document.getElementById("playerRightScore").innerHTML = this.objects[2].paddleScore;
            if(this.objects[2].paddleScore < this.maxScore)
                this.respawnBallLeft();
            else {
                this.gameDuration = stopTimer();
                this.stopGame = true;
                let msg = {
                    element: 4,
                    paddleColisionTimesLeft: this.objects[1].paddleColisionTimes,
                    paddleColisionTimesRight: this.objects[2].paddleColisionTimes,
                    gameDuration: this.gameDuration,
                    paddleScore: this.objects[2].paddleScore,
                    paddleSide: 2,
                }
                this.ws.send(JSON.stringify(msg));
            }
        }
        if (this.objects[0].ballX - this.objects[0].ballRadius > this.canvas.width){
            //console.log("=>> GOLOOOO")
            this.objects[0].lastColision = 0;
            this.objects[1].paddleScore += 1;
            if(this.objects[1].paddleScore < this.maxScore)
                this.respawnBallRight();
            else {
                this.gameDuration = stopTimer();
                this.stopGame = true;
                let msg = {
                    element: 4,
                    paddleColisionTimesLeft: this.objects[1].paddleColisionTimes,
                    paddleColisionTimesRight: this.objects[2].paddleColisionTimes,
                    gameDuration: this.gameDuration,
                    paddleScore: this.objects[1].paddleScore,
                    paddleSide: 1,
                }
                this.ws.send(JSON.stringify(msg));
            }
        }
    }
    // respawnBall() {
    //     if (this.objects[0].ballVelocityX > 0) {
    //         this.objects[0].ballX = this.canvas.width / 2;
    //         this.objects[0].ballY = (Math.random() * (this.canvas.height - 200)) + 100; 
    //         this.objects[0].ballVelocityX = -ballVelocity;
    //     }
    //     if (this.objects[0].ballVelocityX < 0) {
    //         this.objects[0].ballX = this.canvas.width / 2;
    //         this.objects[0].ballY = (Math.random() * (this.canvas.height - 200)) + 100;
    //         this.objects[0].ballVelocityX = ballVelocity;
    //         let msg = {
    //             element: 3,
    //             paddleSide: 2,
    //             paddleScore: this.objects[2].paddleScore,
    //         }
    //     }
    //     this.objects[0].ballVelocityY *= -1;
    //     let msg = JSON.stringify(this.objects[0].toJSON());
    //     this.ws.send(msg);
    // }
    respawnBallLeft() {
        this.objects[0].ballX = this.canvas.width / 2;
        this.objects[0].ballY = (Math.random() * (this.canvas.height - 200)) + 100;
        this.objects[0].ballVelocityX = ballVelocity;
        this.objects[0].ballVelocityY *= -1;
        let msg = this.objects[0].toJSON();
        msg["element"] = 3;
        msg["paddleSide"] = 2;
        msg["paddleScore"] = this.objects[2].paddleScore;
        //console.log(msg);
        this.ws.send(JSON.stringify(msg));
    }
    respawnBallRight() {
        this.objects[0].ballX = this.canvas.width / 2;
        this.objects[0].ballY = (Math.random() * (this.canvas.height - 200)) + 100; 
        this.objects[0].ballVelocityX = -ballVelocity;
        this.objects[0].ballVelocityY *= -1;
        let msg = this.objects[0].toJSON();
        msg["element"] = 3;
        msg["paddleSide"] = 1;
        msg["paddleScore"] = this.objects[1].paddleScore;
        //console.log(msg);
        this.ws.send(JSON.stringify(msg));
    }
}