document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("pongCanvas");
    const ctx = canvas.getContext("2d");

    // Configurações da raquete e bola
    const paddleHeight = 75, paddleWidth = 10;
    let playerY = (canvas.height - paddleHeight) / 2;
    let aiY = (canvas.height - paddleHeight) / 2;
    const ballRadius = 10;
    let ballX = canvas.width / 2, ballY = canvas.height / 2;
    let ballDX = 2, ballDY = 2;

    // Variáveis para controle por teclado
    let upPressed = false;
    let downPressed = false;

    // Função para desenhar uma raquete
    function drawPaddle(x, y) {
        ctx.fillStyle = "#0095DD";
        ctx.fillRect(x, y, paddleWidth, paddleHeight);
    }

    // Função para desenhar a bola
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }

    // Função para desenhar o cenário e atualizar a lógica do jogo
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha as raquetes e a bola
        drawPaddle(0, playerY);
        drawPaddle(canvas.width - paddleWidth, aiY);
        drawBall();

        // Movimento da bola
        ballX += ballDX;
        ballY += ballDY;

        // Colisão com as paredes superior e inferior
        if (ballY + ballDY > canvas.height - ballRadius || ballY + ballDY < ballRadius) {
            ballDY = -ballDY;
        }

        // Colisão com a raquete do jogador
        if (ballX - ballRadius < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
            ballDX = -ballDX;
        }
        // Colisão com a raquete da IA
        else if (ballX + ballRadius > canvas.width - paddleWidth && ballY > aiY && ballY < aiY + paddleHeight) {
            ballDX = -ballDX;
        }

        // Reinicia a posição da bola se passar pelos lados
        if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            ballDX = -ballDX;
        }

        // Movimento da IA (simples)
        aiY += (ballY - (aiY + paddleHeight / 2)) * 0.05;

        // Movimento da raquete do jogador com base nas teclas pressionadas
        if (upPressed && playerY > 0) {
            playerY -= 5;  // Velocidade de movimento para cima
        }
        if (downPressed && playerY < canvas.height - paddleHeight) {
            playerY += 5;  // Velocidade de movimento para baixo
        }
    }

    // Eventos de tecla para capturar o movimento
    document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowUp") {
            upPressed = true;
        }
        else if (event.key === "ArrowDown") {
            downPressed = true;
        }
    });

    document.addEventListener("keyup", function(event) {
        if (event.key === "ArrowUp") {
            upPressed = false;
        }
        else if (event.key === "ArrowDown") {
            downPressed = false;
        }
    });

    // Executa o jogo a 60 FPS
    setInterval(draw, 1000 / 60);
});
