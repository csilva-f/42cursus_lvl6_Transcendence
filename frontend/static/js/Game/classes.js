class Ball {
    constructor(ballX, ballY, ballVelocityX, ballVelocityY, ballRadius) {
        this.ballX = ballX;
        this.ballY = ballY;
        this.ballRadius = ballRadius;
        this.ballVelocityX = ballVelocityX;
        this.ballVelocityY = ballVelocityY;
    }
    toJSON() {
        return {
            element: 0,
            ballX: this.ballX,
            ballY: this.ballY,
            ballVelocityX: this.ballVelocityX,
            ballVelocityY: this.ballVelocityY,
        };
    }
    update() {
        this.ballX += this.ballVelocityX;
        this.ballY += this.ballVelocityY;
        //console.log("update ball:", this);
    }
    updateByValue(x, y, velocityX, velocityY) {
        this.ballX = x;
        this.ballY = y;
        this.ballVelocityX  = velocityX;
        this.ballVelocityY = velocityY;
        //console.log("update ball:", this);
    }
    draw(ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        ctx.fill();
        //if (lastPlayer = 2)
        //   console.log("ball x: ", this.ballX, " | ball Y: ", this.ballY, " | velocity: ", this.ballVelocityX);
    }
    colissionEdge(canvas) {
        if (this.ballY + this.ballRadius > canvas.height){ //baixo //voltar acolocar o =??
            if(this.ballVelocityY > 0) 
                this.ballVelocityY *= -1;
        }
        if (this.ballY - this.ballRadius < 0) {//cima{
            if(this.ballVelocityY < 0) 
                this.ballVelocityY *= -1;
        }
        // if (this.ballX + this.ballRadius >= canvas.width)
        //     this.ballVelocityX *= -1;
        // if (this.ballX - this.ballRadius <= 0)
        //     this.ballVelocityX *= -1;
    }
}

class Paddle {
    constructor(paddleSide, paddleWidth, paddleHeight, paddleColor, paddleX, paddleY, paddleVelocityY) {
        this.paddleSide = paddleSide;
        this.paddleWidth = paddleWidth;
        this.paddleHeight = paddleHeight;
        this.paddleScore = 0;
        this.paddleColor = paddleColor;
        this.paddleX = paddleX;
        this.paddleY = paddleY;
        this.paddleVelocityY = paddleVelocityY;
        this.paddleColisionTimes = 0;
    }
    toJSON() {
        return {
            element: 1,
            paddleSide: this.paddleSide,
            paddleScore: this.paddleScore,
            paddleY: this.paddleY,
            paddleColisionTimes: this.paddleColisionTimes,
        };
    }
    getHalfWidth() { return this.paddleWidth / 2; }
    getHalfHeight() { return this.paddleHeight / 2; }
    getCenterWidth() { return this.paddleX + this.getHalfWidth(); }
    getCenterHeight() { return this.paddleY + this.getHalfHeight(); }
    setPaddleX(paddleX) { this.paddleX = paddleX; }
    setPaddleY(paddleY) { this.paddleY = paddleY; }
    update() {
        if (this.paddleSide == 2) {
            if (keyPressed[KEY_ARROWUP])
                this.paddleY -= this.paddleVelocityY;
            if (keyPressed[KEY_ARROWDOWN])
                this.paddleY += this.paddleVelocityY;
        } else {
            if (keyPressed[KEY_W])
                this.paddleY -= this.paddleVelocityY;
            if (keyPressed[KEY_S])
                this.paddleY += this.paddleVelocityY;
        }
        //console.log("update paddle:", this);
    }
    updateRemote(isHost, ws) {
        if (this.paddleSide == 2 && isHost) {
            if (keyPressed[KEY_ARROWUP]){
                this.paddleY -= this.paddleVelocityY;
                let msg = JSON.stringify(this.toJSON());
                ws.send(msg);
            }
            if (keyPressed[KEY_ARROWDOWN]){
                this.paddleY += this.paddleVelocityY;
                let msg = JSON.stringify(this.toJSON());
                ws.send(msg);
            }
        }
        if (this.paddleSide == 1 && !isHost) {
            if (keyPressed[KEY_W]){
                this.paddleY -= this.paddleVelocityY;
                let msg = JSON.stringify(this.toJSON());
                ws.send(msg);
            }
            if (keyPressed[KEY_S]){
                this.paddleY += this.paddleVelocityY;
                let msg = JSON.stringify(this.toJSON());
                ws.send(msg);
            }
        }
        //console.log("update paddle:", this);
    }
    updateByValueBasic(targetX, targetY) {
        this.paddleX = targetX;
        this.paddleY = targetY;
    }

    //functions to test smoth paddles
    updateByValue(targetX, targetY) {
        const lerpFactor = 0.2; // Adjust this for smoother movement (0 = no movement, 1 = instant)
    
        this.paddleX = this.paddleX + (targetX - this.paddleX) * lerpFactor;
        this.paddleY = this.paddleY + (targetY - this.paddleY) * lerpFactor;
    }
    updateByPrediction(targetY) {
        const predictionTime = 0.1; // Predict 100ms ahead
        const predictedY = targetY + this.paddleVelocityY * predictionTime;
    
        this.paddleY = this.paddleY + (predictedY - this.paddleY) * 0.2;
    }
    draw(ctx) {
        ctx.fillStyle = this.paddleColor;
        ctx.fillRect(this.paddleX, this.paddleY, this.paddleWidth, this.paddleHeight);
        //console.log("paddle color: ", this.paddleColor, " | paddleX: ", this.paddleX, " | paddleY: ", this.paddleY, " | paddleWidth", this.paddleWidth, " | paddleHeight", this.paddleHeight);
    }
    colissionEdge(canvas) {
        if (this.paddleY + this.paddleHeight >= canvas.height)
            this.paddleY = canvas.height - this.paddleHeight;
        if (this.paddleY <= 0)
            this.paddleY = 0;
    }

    leftColissionBall(ball) {
        let paddleRightSide = this.paddleX + this.paddleWidth + 0.01;
        let paddleLeftSide = this.paddleX + 0.01;
        let paddleTop = this.paddleY + 0.01;
        let paddleBottom = this.paddleY + this.paddleHeight + 0.01;
        let ballRightSide = ball.ballX + ball.ballRadius + 0.01;
        let ballLeftSide = ball.ballX - ball.ballRadius + 0.01;
        let ballTop = ball.ballY - ball.ballRadius + 0.01;
        let ballBottom = ball.ballY + ball.ballRadius + 0.01;
        
        if (lastPlayer == 1)
            return;
        if (ball.ballVelocityX < 0 && ballLeftSide <= paddleRightSide && ballRightSide > paddleRightSide && ballBottom >= paddleTop && ballTop <= paddleBottom){ //Colisao com o lado direito do paddle
            console.log("colisao com o lado");
            lastPlayer = 1;
            // console.log("Left paddle");
            // console.table(ball);
            // console.table(this);
            // console.log("Ball bottom", ballBottom);
            // console.log("Paddle bottom: ", paddleBottom);
            // console.log("Ball top", ballTop);
            // console.log("Paddle top: ", paddleTop);
            if (ball.ballVelocityX < maxSpeed)
                ball.ballVelocityX *= -ballVellocityIncreaseRate;
            else
                ball.ballVelocityX *= -1;
            if (ball.ballX > paddleBottom && ball.ballVelocityY < 0){ //colisao com o vertice da base
                console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            //colisao com o topo
            if (ball.ballX < paddleTop && ball.ballVelocityY > 0 ){ // colisao com o vertice do topo
                console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            this.paddleColisionTimes++;
            return true;
        }
        if (ball.ballVelocityX < 0 && ballLeftSide <= paddleRightSide) { //Se a bola passar o lado direito do paddle verifica-se colisao com topo e base
            if (ball.ballVelocityY > 0 && ballBottom >= paddleTop && ballTop <= paddleTop){ //Colisao com o topo do paddle
                console.log("colisao com o topo");
                ball.ballVelocityY *= -1;
                lastPlayer = 1;
                this.paddleColisionTimes++;
                return true;
            }
            if (ball.ballVelocityY < 0 && ballTop <= paddleBottom && ballBottom >= paddleBottom){ //Colisao com a base do paddle
                console.log("colisao com a base"); 
                ball.ballVelocityY *= -1;
                lastPlayer = 1;
                this.paddleColisionTimes++;
                return true;
            }
        }
    }

    rightColissionBall(ball) {
        let paddleRightSide = this.paddleX + this.paddleWidth + 0.01;
        let paddleLeftSide = this.paddleX + 0.01;
        let paddleTop = this.paddleY + 0.01;
        let paddleBottom = this.paddleY + this.paddleHeight + 0.01;
        let ballRightSide = ball.ballX + ball.ballRadius + 0.01;
        let ballLeftSide = ball.ballX - ball.ballRadius + 0.01;
        let ballTop = ball.ballY - ball.ballRadius + 0.01;
        let ballBottom = ball.ballY + ball.ballRadius + 0.01;
        
        if (lastPlayer == 2)
            return;
        if (ball.ballVelocityX > 0 && ballRightSide >= paddleLeftSide && ballLeftSide < paddleLeftSide && ballBottom >= paddleTop && ballTop <= paddleBottom){ //Colisao com o lado esquerdo do paddle
            console.log("colisao com o lado");
            lastPlayer = 2;
            if (ball.ballVelocityX < maxSpeed)
                ball.ballVelocityX *= -ballVellocityIncreaseRate;
            else
            ball.ballVelocityX *= -1;
            // console.log("Right paddle: ");
            // console.table(ball);
            // console.table(this);
            // console.log("Ball bottom", ballBottom);
            // console.log("Paddle bottom: ", paddleBottom);
            // console.log("Ball top", ballTop);
            // console.log("Paddle top: ", paddleTop);
            if (ball.ballX > paddleBottom && ball.ballVelocityY < 0){ //colisao com o vertice da base
                //console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            if (ball.ballX < paddleTop && ball.ballVelocityY > 0){ //colisao com o vertice do topo
                //console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            this.paddleColisionTimes++;
            return true;
        }
        if (ball.ballVelocityX > 0 && ballRightSide >= paddleLeftSide) { //Se a bola passar o lado esuqerdo do paddle verifica-se colisao com topo e base
            if (ball.ballVelocityY > 0 && ballBottom >= paddleTop && ballTop <= paddleTop){ //Colisao com o topo do paddle
                //console.log("colisao com o topo");
                ball.ballVelocityY *= -1;
                lastPlayer = 2;
                this.paddleColisionTimes++;
                return true;
            }
            if (ball.ballVelocityY < 0 && ballTop <= paddleBottom && ballBottom >= paddleBottom){ //Colisao com a base do paddle
                //console.log("colisao com a base");
                ball.ballVelocityY *= -1;
                lastPlayer = 2;
                this.paddleColisionTimes++;
                return true;
            }
        }
    }


    remoteColissionBall(ball, ws, sendMsg) {
        let dX = ball.ballX - this.getCenterWidth();
        let dY = ball.ballY - this.getCenterHeight();
        let absDX = Math.abs(dX);
        let absDY = Math.abs(dY);

        if (absDX <= (ball.ballRadius + this.getHalfWidth()) && absDY <= (ball.ballRadius + this.getHalfHeight())) {
            // Colisão na frente do paddle
            if (absDX > this.getHalfWidth()) {
                this.paddleColisionTimes++;
                if (ball.ballVelocityX < maxSpeed)
                    ball.ballVelocityX *= -1.08;
                else
                    ball.ballVelocityX *= -1;
                ball.ballX = (dX < 0)
                    ? this.getCenterWidth() - this.getHalfWidth() - ball.ballRadius
                    : this.getCenterWidth() + this.getHalfWidth() + ball.ballRadius;
            }
            // Colisão no topo ou na base
            if (absDY > this.getHalfHeight()) {
                ball.ballVelocityY *= -1; // Reverte a direção vertical
                ball.ballY = (dY < 0)
                    ? this.getCenterHeight() - this.getHalfHeight() - ball.ballRadius
                    : this.getCenterHeight() + this.getHalfHeight() + ball.ballRadius;
            }
            if (this.paddleSide == 2 && sendMsg){
                let msg = JSON.stringify(ball.toJSON());
                ws.send(msg);
           }
           if (this.paddleSide == 1){
               let msg = JSON.stringify(ball.toJSON());
               ws.send(msg);
          }
        }
    }
}