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
let timer; // ID do setInterval
let totalSeconds; // Tempo total em segundos
let secondsLeft; // Segundos restantes
let isRunning = false; // Flag para controlar se o timer está rodando
let endTime = null; // Horário absoluto em que o timer acaba

// --- Funções ---

// Atualiza o display no formato MM:SS
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
            resetTimer();
        }

        // Define o horário absoluto de término
        endTime = Date.now() + secondsLeft * 1000;

        isRunning = true;
        startPauseButton.textContent = 'Pausar';
        statusDisplay.textContent = 'Contando...';

        timer = setInterval(() => {
            // Calcula quanto tempo realmente falta
            secondsLeft = Math.max(Math.round((endTime - Date.now()) / 1000), 0);
            updateDisplay();

            if (secondsLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                startPauseButton.textContent = 'Iniciar';
                statusDisplay.textContent = 'Tempo esgotado!';
                alarmSound.play();
            }
        }, 1000);
    }
}

// Define o tempo inicial baseado no input
function setTimer() {
    if (isRunning) {
        toggleTimer(); // Pausa antes de redefinir
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

// Reseta o timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    secondsLeft = totalSeconds;
    updateDisplay();
    startPauseButton.textContent = 'Iniciar';
    statusDisplay.textContent = 'Pronto';
    endTime = null;
}

// Alterna entre tema claro e escuro
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

// --- Event Listeners ---
startPauseButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
setButton.addEventListener('click', setTimer);
themeToggleButton.addEventListener('click', toggleTheme);

// --- Inicialização ---
function initialize() {
    totalSeconds = parseInt(durationInput.value, 10) * 60;
    secondsLeft = totalSeconds;
    updateDisplay();
}

initialize();
