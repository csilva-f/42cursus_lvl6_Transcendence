class Ball {
    constructor(ballX, ballY, ballVelocityX, ballVelocityY, ballRadius) {
        this.ballX = ballX;
        this.ballY = ballY;
        this.ballRadius = ballRadius;
        this.ballVelocityX = ballVelocityX;
        this.ballVelocityY = ballVelocityY;
    }
    update() {
        this.ballX += this.ballVelocityX;
        this.ballY += this.ballVelocityY;
    }
    draw(ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        ctx.fill()
    }
    colissionEdge(canvas) {
        if (this.ballY + this.ballRadius >= canvas.height)
            this.ballVelocityY *= -1;
        if (this.ballY - this.ballRadius <= 0)
            this.ballVelocityY *= -1;
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
    }
    getHalfWidth() { return this.paddleWidth / 2; }
    getHalfHeight() { return this.paddleHeight / 2; }
    getCenterWidth() { return this.paddleX + this.getHalfWidth(); }
    getCenterHeight() { return this.paddleY + this.getHalfHeight(); }
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
    }
    draw(ctx) {
        ctx.fillStyle = this.paddleColor;
        ctx.fillRect(this.paddleX, this.paddleY, this.paddleWidth, this.paddleHeight);
    }
    colissionEdge(canvas) {
        if (this.paddleY + this.paddleHeight >= canvas.height)
            this.paddleY = canvas.height - this.paddleHeight;
        if (this.paddleY <= 0)
            this.paddleY = 0;
    }
    colissionBall(ball) {
        let dX = Math.abs(ball.ballX - this.getCenterWidth());
        let dY = Math.abs(ball.ballY - this.getCenterHeight());

        if (dX <= (ball.ballRadius + this.getHalfWidth()) && dY <= (ball.ballRadius + this.getHalfHeight()))
            ball.ballVelocityX *= -1;
    }
}