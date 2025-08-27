let cobra = [{ x: 10, y: 10 }];
let comida = null;
let comidaEspecial = null;
let direcao = 'DIREITA';
let proximoDirecao = 'DIREITA';
let velocidade = 150;
let pontos = 0;
let recorde = localStorage.getItem('recorde') || 0;
let intervalo;
let pausado = false;
let fimDeJogo = false;
let timerComidaEspecial = null;

const iniciarBtn = document.getElementById('iniciarBtn');
const pausarBtn = document.getElementById('pausarBtn');
const reiniciarBtn = document.getElementById('reiniciarBtn');
const gameOver = document.getElementById('gameOver');
const pontosElement = document.getElementById('score');
const recordeElement = document.getElementById('highScore');
const pontosFinaisElement = document.getElementById('finalScore');

function iniciar() {
    recordeElement.textContent = recorde;

    iniciarBtn.addEventListener('click', iniciarJogo);
    pausarBtn.addEventListener('click', alternarPausa);
    reiniciarBtn.addEventListener('click', reiniciarJogo);
}

function iniciarJogo() {
    if (intervalo) {
        clearInterval(intervalo);
    }

    cobra = [{ x: 10, y: 10 }];
    proximoDirecao = 'DIREITA';
    pontos = 0;
    pontosElement.textContent = pontos;
    fimDeJogo = false;
    pausado = false;
    gameOver.style.display = 'none';

    comida = gerarComida();
    if (comidaEspecial) {
        clearTimeout(timerComidaEspecial);
        comidaEspecial = null;
    }

    iniciarBtn.disabled = true;
    pausarBtn.disabled = false;

    intervalo = setInterval(loopJogo, velocidade);
}

function loopJogo() {
    if (fimDeJogo || pausado) return;

    direcao = proximoDirecao;
    moverCobra();
    criarTabuleiro();
}

function criarTabuleiro() {
    const tabuleiro = document.getElementById('gameBoard');
    tabuleiro.innerHTML = "";

    // Desenha a cobra
    cobra.forEach((segmento, index) => {
        const elemento = document.createElement('div');
        elemento.style.gridRowStart = segmento.y;
        elemento.style.gridColumnStart = segmento.x;
        elemento.classList.add(index === 0 ? 'snake-head' : 'snake');
        tabuleiro.appendChild(elemento);
    });

    // Desenha comida normal
    if (comida) {
        const elementoComida = document.createElement('div');
        elementoComida.style.gridRowStart = comida.y;
        elementoComida.style.gridColumnStart = comida.x;
        elementoComida.classList.add('food');
        tabuleiro.appendChild(elementoComida);
    }

    // Desenha comida especial
    if (comidaEspecial) {
        const elementoEspecial = document.createElement('div');
        elementoEspecial.style.gridRowStart = comidaEspecial.y;
        elementoEspecial.style.gridColumnStart = comidaEspecial.x;
        elementoEspecial.classList.add('special-food');
        tabuleiro.appendChild(elementoEspecial);
    }
}

function gerarComida() {
    let novaComida;
    while (!novaComida || posicaoOcupada(novaComida)) {
        novaComida = {
            x: Math.floor(Math.random() * 20) + 1,
            y: Math.floor(Math.random() * 20) + 1
        };
    }

    // 20% de chance de aparecer comida especial
    if (Math.random() < 0.2 && !comidaEspecial) {
        gerarComidaEspecial();
    }

    return novaComida;
}

function gerarComidaEspecial() {
    let novaComida;

    while (!novaComida || posicaoOcupada(novaComida)) {
        novaComida = {
            x: Math.floor(Math.random() * 20) + 1,
            y: Math.floor(Math.random() * 20) + 1
        };
    }

    comidaEspecial = novaComida;

    timerComidaEspecial = setTimeout(() => {
        comidaEspecial = null;
        criarTabuleiro();
    }, 5000);
}

function posicaoOcupada(posicao) {
    const ocupadoPelaCobra = cobra.some(segmento => segmento.x === posicao.x && segmento.y === posicao.y);
    const ocupadoPelaComida = comida ? (posicao.x === comida.x && posicao.y === comida.y) : false;
    const ocupadoPelaComidaEspecial = comidaEspecial ? (posicao.x === comidaEspecial.x && posicao.y === comidaEspecial.y) : false;

    return ocupadoPelaCobra || ocupadoPelaComida || ocupadoPelaComidaEspecial;
}

function mudarDirecao(event) {
    const tecla = event.key;

    if (tecla === "ArrowUp" && direcao !== "BAIXO") {
        proximoDirecao = "CIMA";
    } else if (tecla === "ArrowDown" && direcao !== "CIMA") {
        proximoDirecao = "BAIXO";
    } else if (tecla === "ArrowLeft" && direcao !== "DIREITA") {
        proximoDirecao = "ESQUERDA";
    } else if (tecla === "ArrowRight" && direcao !== "ESQUERDA") {
        proximoDirecao = "DIREITA";
    } else if (tecla === ' ') {
        alternarPausa();
    }
}

function moverCobra() {
    const cabeca = { ...cobra[0] };

    switch (direcao) {
        case 'CIMA': cabeca.y--; break;
        case 'BAIXO': cabeca.y++; break;
        case 'ESQUERDA': cabeca.x--; break;
        case 'DIREITA': cabeca.x++; break;
    }

    if (verificarColisao(cabeca)) {
        fimDeJogoFuncao();
        return;
    }

    cobra.unshift(cabeca);

    if (comida && cabeca.x === comida.x && cabeca.y === comida.y) {
        pontos += 10;
        atualizarPontos();
        comida = gerarComida();
    } else if (comidaEspecial && cabeca.x === comidaEspecial.x && cabeca.y === comidaEspecial.y) {
        pontos += 30;
        atualizarPontos();
        clearTimeout(timerComidaEspecial);
        comidaEspecial = null;
    } else {
        cobra.pop();
    }
}

function atualizarPontos() {
    pontosElement.textContent = pontos;
}

function verificarColisao(cabeca) {
    if (cabeca.x < 1 || cabeca.x > 20 || cabeca.y < 1 || cabeca.y > 20) {
        return true;
    }

    for (let i = 1; i < cobra.length; i++) {
        if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
            return true;
        }
    }

    return false;
}

function fimDeJogoFuncao() {
    clearInterval(intervalo);
    fimDeJogo = true;

    if (pontos > recorde) {
        recorde = pontos;
        localStorage.setItem('record    ', recorde);
        recordeElement.textContent = recorde;
    }

    pontosFinaisElement.textContent = pontos;
    gameOver.style.display = 'block';
    iniciarBtn.disabled = false;
    pausarBtn.disabled = true;
}

function alternarPausa() {
    pausado = !pausado;
    pausarBtn.textContent = pausado ? 'Continue' : 'Pause';
}

function reiniciarJogo() {
    gameOver.style.display = 'none';
    iniciarJogo();
}

document.addEventListener('keydown', mudarDirecao);

iniciar();
