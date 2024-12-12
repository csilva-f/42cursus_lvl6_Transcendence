const KEY_ARROWUP = 38;
const KEY_ARROWDOWN = 40;
const KEY_W = 87;
const KEY_S = 83;
const keyPressed = [];
window.addEventListener('keydown', function (e) {
    keyPressed[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keyPressed[e.keyCode] = false;
})

function respawnBall(canvas, objects) {
    if (objects[0].ballVelocityX > 0) {
        objects[0].ballX = canvas.width / 2;
        objects[0].ballY = (Math.random() * (canvas.height - 200)) + 100;
    }
    if (objects[0].ballVelocityX < 0) {
        objects[0].ballX = canvas.width / 2;
        objects[0].ballY = (Math.random() * (canvas.height - 200)) + 100;
    }
    objects[0].ballVelocityX *= -1;
    objects[0].ballVelocityY *= -1;
}

function incScore(canvas, objects) {
    if (objects[0].ballX <= -objects[0].ballRadius){
        objects[2].paddleScore += 1;
        document.getElementById("playerRightScore").innerHTML = objects[2].paddleScore;
        respawnBall(canvas, objects);
    }
    if (objects[0].ballX >= canvas.width + objects[0].ballRadius){
        objects[1].paddleScore += 1;
        document.getElementById("playerLeftScore").innerHTML = objects[1].paddleScore;
        respawnBall(canvas, objects);
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

function gameLoop(canvas, ctx, objects) {
    window.onresize = function() {
        //otimizar isto e depois tambem dar update nas posicoes dos paddles e da bola
        const rootStyle = getComputedStyle(document.documentElement);
        const remToPixels = parseFloat(rootStyle.fontSize);
        canvas.width = window.innerWidth - (50 * remToPixels);
        canvas.height = window.innerHeight - (20 * remToPixels);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(() => gameLoop(canvas, ctx, objects));

    gameUpdate(canvas, objects);
    gameDraw(ctx, objects);
}

function initGame() {
    /* Main Initializations */
    const canvas = document.getElementById("pongGameCanvas");
    const ctx = canvas.getContext('2d');

    const rootStyle = getComputedStyle(document.documentElement);
    const remToPixels = parseFloat(rootStyle.fontSize);
    
    //TODO Entender pk que a width esta errada
    canvas.width = window.innerWidth - (50 * remToPixels);
    canvas.height = window.innerHeight - (20 * remToPixels);
    
    const objects = [
        new Ball(canvas.width / 2, canvas.height / 2, 10, 10, 15),
        new Paddle(1, 20, 150, "#AC3B61", 30, canvas.height / 2, 10),
        new Paddle(2, 20, 150, "#87709C", canvas.width - 50, canvas.height / 2, 10)
    ];
    //* objects[0]: Ball
    //* objects[1]: PaddleLeft
    //* objects[2]: PaddleRight

    document.getElementById("playerLeftScore").innerHTML = objects[1].paddleScore;
    document.getElementById("playerRightScore").innerHTML = objects[2].paddleScore;
    
    gameLoop(canvas, ctx, objects);
}