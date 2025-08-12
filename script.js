// --- Seleção dos Elementos do DOM ---
const timeDisplay = document.getElementById('time-display');
const statusDisplay = document.getElementById('status-display');
const durationInput = document.getElementById('duration-input');
const setButton = document.getElementById('set-button');
const startPauseButton = document.getElementById('start-pause-button');
const resetButton = document.getElementById('reset-button');
const themeToggleButton = document.getElementById('theme-toggle');
const alarmSound = document.getElementById('alarm-sound');
const htmlElement = document.documentElement;

// --- Variáveis de Estado ---
let timer; // Armazena o ID do setInterval para podermos pará-lo
let totalSeconds; // Tempo total definido em segundos
let secondsLeft; // Segundos restantes
let isRunning = false; // Flag para controlar se o timer está rodando

// --- Funções ---

// Atualiza o display do tempo no formato MM:SS
function updateDisplay() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Inicia ou pausa o timer
function toggleTimer() {
    if (isRunning) {
        // Pausar
        clearInterval(timer);
        isRunning = false;
        startPauseButton.textContent = 'Iniciar';
        statusDisplay.textContent = 'Pausado';
    } else {
        // Iniciar
        if (secondsLeft <= 0) {
            resetTimer(); // Se o tempo acabou, reseta antes de começar
        }
        isRunning = true;
        startPauseButton.textContent = 'Pausar';
        statusDisplay.textContent = 'Contando...';
        
        timer = setInterval(() => {
            secondsLeft--;
            updateDisplay();

            if (secondsLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                startPauseButton.textContent = 'Iniciar';
                statusDisplay.textContent = 'Tempo esgotado!';
                alarmSound.play(); // Toca o som do alarme
            }
        }, 1000); // Executa a cada 1 segundo
    }
}

// Define o tempo inicial com base no input
function setTimer() {
    // Para o timer se estiver rodando
    if (isRunning) {
        toggleTimer();
    }
    const minutes = parseInt(durationInput.value, 10);
    if (minutes > 0) {
        totalSeconds = minutes * 60;
        resetTimer();
        statusDisplay.textContent = 'Pronto para iniciar';
    } else {
        alert("Por favor, insira um valor maior que zero.");
    }
}

// Reseta o timer para o valor inicial definido
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    secondsLeft = totalSeconds;
    updateDisplay();
    startPauseButton.textContent = 'Iniciar';
    statusDisplay.textContent = 'Pronto';
}

// Alterna entre o tema claro e escuro
function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'light');
        themeToggleButton.textContent = '🌙';
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggleButton.textContent = '☀️';
    }
}


// --- Event Listeners (Ouvintes de Eventos) ---
startPauseButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
setButton.addEventListener('click', setTimer);
themeToggleButton.addEventListener('click', toggleTheme);


// --- Inicialização ---
// Define o estado inicial quando a página carrega
function initialize() {
    totalSeconds = parseInt(durationInput.value, 10) * 60;
    secondsLeft = totalSeconds;
    updateDisplay();
}

// Chama a função de inicialização
initialize();