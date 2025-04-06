class Ball {
    constructor(ballX, ballY, ballVelocityX, ballVelocityY, ballRadius) {
        this.ballX = ballX;
        this.ballY = ballY;
        this.ballRadius = ballRadius;
        this.ballVelocityX = ballVelocityX;
        this.ballVelocityY = ballVelocityY;
        this.lastColision = 0;
    }
    toJSON() {
        return {
            element: 0,
            ballX: this.ballX,
            ballY: this.ballY,
            ballVelocityX: this.ballVelocityX,
            ballVelocityY: this.ballVelocityY,
            lastColision: this.lastColision,
        }
    }
    update() {
        this.ballX += this.ballVelocityX;
        this.ballY += this.ballVelocityY;
        //console.log("update ball:", this);
    }
    updateByValue(x, y, velocityX, velocityY, lastColision) {
        this.ballX = x;
        this.ballY = y;
        this.ballVelocityX  = velocityX;
        this.ballVelocityY = velocityY;
        this.lastColision = lastColision;
        //console.log("update ball:", this);
    }
    draw(ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        ctx.fill();
        //if (ball.lastColision = 2)
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
        this.paddleRightSide = 0;
        this.paddleLeftSide = 0;
        this.paddleTop = 0;
        this.paddleBottom = 0;
        this.ballRightSide = 0;
        this.ballLeftSide = 0;;
        this.ballTop = 0;
        this.ballBottom = 0;

        this.dist_BallCenter_PaddleTopLeftCornner =  0;
        this.dist_BallCenter_PaddleBottomLeftCornner = 0;
        this.dist_BallCenter_PaddleBottomRightCornner = 0;
        this.dist_BallCenter_PaddleTopRightCornner = 0;
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

    distBetweenTwoPoints(a, b){
        let x = (b[0] - a[0]) * (b[0] - a[0]);
        let y = (b[1] - a[1]) * (b[1] - a[1]);
        return Math.sqrt(x + y);
    }
    setUpColisionData(ball){
        this.paddleRightSide = this.paddleX + this.paddleWidth + 0.01;
        this.paddleLeftSide = this.paddleX + 0.01;
        this.paddleTop = this.paddleY + 0.01;
        this.paddleBottom = this.paddleY + this.paddleHeight + 0.01;
        this.ballRightSide = ball.ballX + ball.ballRadius + 0.01;
        this.ballLeftSide = ball.ballX - ball.ballRadius + 0.01;
        this.ballTop = ball.ballY - ball.ballRadius + 0.01;
        this.ballBottom = ball.ballY + ball.ballRadius + 0.01;

        let ballCenter = [ball.ballX, ball.ballY];
        let PaddleTopRightCornner = [this.paddleRightSide, this.paddleTop];
        let PaddleTopLeftCornner = [this.paddleLeftSide, this.paddleTop];
        let PaddleBottomRightCornner = [this.paddleRightSide, this.paddleBottom];
        let PaddleBottomLeftCornner = [this.paddleLeftSide, this.paddleBottom];

        this.dist_BallCenter_PaddleTopLeftCornner = this.distBetweenTwoPoints(ballCenter, PaddleTopLeftCornner);
        this.dist_BallCenter_PaddleBottomLeftCornner = this.distBetweenTwoPoints(ballCenter, PaddleBottomLeftCornner);
        this.dist_BallCenter_PaddleBottomRightCornner = this.distBetweenTwoPoints(ballCenter, PaddleBottomRightCornner);
        this.dist_BallCenter_PaddleTopRightCornner = this.distBetweenTwoPoints(ballCenter, PaddleTopRightCornner);
    }

    leftColissionBall(ball) {
        if (ball.lastColision == 1){
            return false;
        }
        this.setUpColisionData(ball);
        if (ball.ballVelocityX < 0 && this.ballLeftSide <= this.paddleRightSide && this.ballRightSide > this.paddleRightSide && this.ballBottom >= this.paddleTop && this.ballTop <= this.paddleBottom){ //Colisao com o lado direito do paddle
            if(ball.ballY > this.paddleBottom && this.dist_BallCenter_PaddleBottomRightCornner > ball.ballRadius) //corrigir colisao com o canto de baixo
                return false;
            if(ball.ballY < this.paddleTop && this.dist_BallCenter_PaddleTopRightCornner > ball.ballRadius) //corrigir colisao com o canto de cima
                return false;
            //console.log("colisao com o lado");
            if (Math.abs(ball.ballVelocityX) < maxSpeed)
                ball.ballVelocityX *= -ballVellocityIncreaseRate;
            else
                ball.ballVelocityX *= -1;
            if (ball.ballY > this.paddleBottom && ball.ballVelocityY < 0){ //colisao com o vertice da base
                //console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            if (ball.ballY < this.paddleTop && ball.ballVelocityY > 0 ){ // colisao com o vertice do topo
                //console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            ball.lastColision = 1;
            return true;
        }
        if (ball.ballVelocityX < 0 && this.ballLeftSide <= this.paddleRightSide && this.ballRightSide >= this.paddleLeftSide) { //Se a bola passar o lado direito do paddle verifica-se colisao com topo e base
            if(ball.ballY > this.paddleBottom && this.dist_BallCenter_PaddleBottomLeftCornner > ball.ballRadius) //corrigir colisao com o canto de baixo
                return false;
            if(ball.ballY < this.paddleTop && this.dist_BallCenter_PaddleTopLeftCornner > ball.ballRadius) //corrigir colisao com o canto de cima
                return false;
            if (ball.ballVelocityY > 0 && this.ballBottom > this.paddleTop && this.ballTop < this.paddleTop){ //Colisao com o topo do paddle
                //console.log("colisao com o topo");
                ball.ballVelocityY *= -1;
                ball.lastColision = 1;
                return true;
            }
            if (ball.ballVelocityY < 0 && this.ballTop < this.paddleBottom && this.ballBottom > this.paddleBottom){ //Colisao com a base do paddle
                //console.log("colisao com a base"); 
                ball.ballVelocityY *= -1;
                ball.lastColision = 1;
                return true;
            }
        }
        return false;
    }

    rightColissionBall(ball) {
        if (ball.lastColision == 2){
            return false;
        }
        this.setUpColisionData(ball);
        if (ball.ballVelocityX > 0 && this.ballRightSide >= this.paddleLeftSide && this.ballLeftSide < this.paddleLeftSide && this.ballBottom >= this.paddleTop && this.ballTop <= this.paddleBottom){ //Colisao com o lado esquerdo do paddle
            //porque a bola nao e um quadrado
            if(ball.ballY > this.paddleBottom && this.dist_BallCenter_PaddleBottomLeftCornner > ball.ballRadius) //corrigir colisao com o canto de baixo
                return false;
            if(ball.ballY < this.paddleTop && this.dist_BallCenter_PaddleTopLeftCornner > ball.ballRadius) //corrigir colisao com o canto de cima
                return false;
            //console.log("colisao com o lado");
            if (Math.abs(ball.ballVelocityX) < maxSpeed)
                ball.ballVelocityX *= -ballVellocityIncreaseRate;
            else
                ball.ballVelocityX *= -1;
            if (ball.ballY > this.paddleBottom && ball.ballVelocityY < 0){ //inverter a velocidade do y na colisao com o vertice da base
                //console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            if (ball.ballY < this.paddleTop && ball.ballVelocityY > 0){ //inverter a velocidade do y na colisao com o vertice do topo
                //console.log("inverte y");
                ball.ballVelocityY *= -1;
            }
            ball.lastColision = 2;
            return true;
        }
        if (ball.ballVelocityX > 0 && this.ballRightSide >= this.paddleLeftSide && this.ballLeftSide <= this.paddleRightSide) { //Se a bola passar o lado esquerdo do paddle verifica-se colisao com topo e base
            //porque a bola nao e um quadrado
            if(ball.ballY > this.paddleBottom && this.dist_BallCenter_PaddleBottomRightCornner > ball.ballRadius) //corrigir colisao com o canto de baixo
                return false;
            if(ball.ballY < this.paddleTop && this.dist_BallCenter_PaddleTopRightCornner > ball.ballRadius) //corrigir colisao com o canto de cima
                return false;
            if (ball.ballVelocityY > 0 && this.ballBottom > this.paddleTop && this.ballTop < this.paddleTop){ //Colisao com o topo do paddle
                //console.log("colisao com o topo");
                ball.ballVelocityY *= -1;
                ball.lastColision = 2;
                return true;
            }
            if (ball.ballVelocityY < 0 && this.ballTop < this.paddleBottom && this.ballBottom > this.paddleBottom){ //Colisao com a base do paddle
                //console.log("colisao com a base");
                ball.ballVelocityY *= -1;
                ball.lastColision = 2;
                return true;
            }
        }
        return false;
    }
}