// document.getElementById("out").textContent = "Oi";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- VARIÁVEIS DO JOGO ---
const gravity = 0.5;

// Objeto do Jogador
const player = {
    x: 100, // Posição atual no eixo x
    y: 200, // Posição atual no eixo y
    width: 40,  // Largura do personagem
    height: 40, // Altura do personagem
    color: 'blue',
    velocityX: 0,  // Velocidade atual no eixo x
    velocityY: 0,  // Velocidade atual no eixo y
    speed: 5, // Controla a velocidade horizontal do personagem
    jumpPower: 12, // Controla a força do pulo 
    isJumping: false // Identifica quando o personagem está em queda 
};

// Plataformas (nosso "ambiente 2D")
const platforms = [
    { x: 0,   y: canvas.height - 50, width: canvas.width, height: 50, color: '#4a250a' }, // Chão
    { x: 250,   y: 500, width: 100, height: 50, color: '#4a250a' }, // Chão
    { x: 200, y: 440, width: 150, height: 20, color: 'yellow' },
    { x: 400, y: 340, width: 100, height: 20, color: 'grey' },
    { x: 200, y: 240, width: 100, height: 20, color: 'indigo' },
    { x: 400, y: 140, width: 100, height: 20, color: 'green' },
    { x: 750, y: 140, width: 100, height: 20, color: 'pink' },
    { x: 50, y: 50, width: 100, height: 20, color: 'red' }
];

// Estado do teclado
const keys = {
    left: false,
    right: false,
    up: false
};

// --- CONTROLES ---
document.addEventListener('keydown', (e) => { // Executa quando a tecla é pressionada
    if (e.key === 'ArrowLeft'){
      event.preventDefault();
      keys.left = true;
    } 
    if (e.key === 'ArrowRight'){
      event.preventDefault();
      keys.right = true;
    } 
    if (e.key === 'ArrowUp') {
      event.preventDefault();
      keys.up = true;
    }
});

document.addEventListener('keyup', (e) => { // Executa quando a tecla é liberada
    if (e.key === 'ArrowLeft'){
      keys.left = false;
    }
    if (e.key === 'ArrowRight'){ 
      keys.right = false;
    }
    if (e.key === 'ArrowUp') {
      keys.up = false;
    }
});

function update() {
    // --- 1. MOVIMENTO HORIZONTAL ---
    player.velocityX = 0;
    if (keys.left && player.x > 0) {
        player.velocityX = -player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.velocityX = player.speed;
    }
    player.x += player.velocityX; // Aplica o movimento horizontal

    // --- 2. VERIFICAÇÃO DE COLISÃO HORIZONTAL ---
    for (const platform of platforms) {
        // Checa se os retângulos do jogador e da plataforma estão se sobrepondo
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // Se houve colisão, precisamos corrigir a posição do jogador.
            // Primeiro, descobrimos de que lado a colisão veio.

            if (player.velocityX > 0) { // Estava se movendo para a direita
                // Colidiu com o lado esquerdo da plataforma
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) { // Estava se movendo para a esquerda
                // Colidiu com o lado direito da plataforma
                player.x = platform.x + platform.width;
            }
        }
    }
    
    // --- 3. MOVIMENTO VERTICAL ---
    if (keys.up && !player.isJumping) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
    }
    player.velocityY += gravity; // Aplica a gravidade
    player.y += player.velocityY; // Aplica o movimento vertical
    
    // --- 4. VERIFICAÇÃO DE COLISÃO VERTICAL ---
    let onGround = false;
    for (const platform of platforms) {
        // Checa novamente se os retângulos estão se sobrepondo
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // Se houve colisão, corrige a posição Y
            if (player.velocityY > 0) { // Estava caindo
                // Colidiu com o topo da plataforma
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                onGround = true;
            } else if (player.velocityY < 0) { // Estava subindo (pulando)
                // Colidiu com a base da plataforma
                player.y = platform.y + platform.height;
                player.velocityY = 0; // Para o pulo para não atravessar
            }
        }
    }
    
    // Se, após checar todas as plataformas, o jogador não estiver no chão, ele está pulando/caindo.
    if (!onGround) {
        player.isJumping = true;
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath(); // Inicia um novo caminho de desenho
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius); // Canto superior direito e largura 
    ctx.arcTo(x + width, y + height, x, y + height, radius); // Canto inferior direito e largura
    ctx.arcTo(x, y + height, x, y, radius); // Canto ingferior esquerdo
    ctx.arcTo(x, y, x + width, y, radius); // Canto superior direito
    ctx.closePath(); // Fecha o caminho
}

function draw() {
    // Limpa a tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o jogador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Desenha as plataformas
    for (const platform of platforms) {
        ctx.fillStyle = platform.color;
        roundRect(ctx, platform.x, platform.y, platform.width, platform.height, 10);
        ctx.fill();
    }
    //document.getElementById("out").textContent = player.velocityY;
}

// --- O GAME LOOP ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Chama a si mesma para o próximo quadro
}

// Inicia o jogo!
gameLoop();
