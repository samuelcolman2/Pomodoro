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
// Novos elementos para os modos
const focusModeButton = document.getElementById('focus-mode');
const restModeButton = document.getElementById('rest-mode');

// --- Variáveis de Estado ---
let timer; // ID do setInterval
let totalSeconds; // Tempo total em segundos para o modo atual
let secondsLeft; // Segundos restantes
let isRunning = false; // Flag para controlar se o timer está rodando
let endTime = null; // Horário absoluto em que o timer acaba

// Novas variáveis de estado para controlar os modos e durações
let currentMode = 'focus'; // Pode ser 'focus' ou 'rest'
let focusDuration = 40 * 60; // Duração do foco em segundos
let restDuration = 10 * 60;  // Duração do descanso em segundos

// --- Funções ---

/**
 * Atualiza o display do tempo no formato MM:SS.
 */
function updateDisplay() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Lida com o que acontece quando o tempo de um modo acaba.
 */
function handleTimerEnd() {
    clearInterval(timer);
    isRunning = false;
    alarmSound.play();

    if (currentMode === 'focus') {
        statusDisplay.textContent = 'Foco finalizado! Iniciando descanso...';
        switchMode('rest');
        // Atraso pequeno para o usuário ler a mensagem antes do timer começar
    } else {
        statusDisplay.textContent = 'Descanso finalizado!';
        switchMode('focus');
        // Não inicia o próximo foco automaticamente, deixa o usuário começar quando estiver pronto.
    }
}

/**
 * Inicia ou pausa o timer.
 */
function toggleTimer() {
    if (isRunning) {
        // Pausar
        clearInterval(timer);
        isRunning = false;
        startPauseButton.textContent = 'Iniciar';
        statusDisplay.textContent = 'Pausado';
    } else {
        // Iniciar
        if (!secondsLeft || secondsLeft <= 0) {
            totalSeconds = (currentMode === 'focus') ? focusDuration : restDuration;
            secondsLeft = totalSeconds;
        }

        endTime = Date.now() + secondsLeft * 1000;
        isRunning = true;
        startPauseButton.textContent = 'Pausar';
        statusDisplay.textContent = currentMode === 'focus' ? 'Foco...' : 'Descanso...';

        timer = setInterval(() => {
            secondsLeft = Math.max(Math.round((endTime - Date.now()) / 1000), 0);
            updateDisplay();

            if (secondsLeft <= 0) {
                handleTimerEnd();
            }
        }, 1000);
    }
}

/**
 * Define o tempo (em minutos) para o modo atualmente ativo.
 */
function setTimer() {
    if (isRunning) {
        toggleTimer(); // Pausa antes de redefinir
    }
    const minutes = parseInt(durationInput.value, 10);
    if (minutes > 0 && minutes <= 999) { // Adicionado um limite
        if (currentMode === 'focus') {
            focusDuration = minutes * 60;
        } else {
            restDuration = minutes * 60;
        }
        resetTimer();
        statusDisplay.textContent = 'Pronto para iniciar';
    } else {
        // Em vez de alert(), usamos o status para feedback
        statusDisplay.textContent = "Insira um valor válido.";
    }
}

/**
 * Reseta o timer para o início, baseado no modo atual.
 */
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    totalSeconds = (currentMode === 'focus') ? focusDuration : restDuration;
    secondsLeft = totalSeconds;
    updateDisplay();
    startPauseButton.textContent = 'Iniciar';
    statusDisplay.textContent = 'Pronto';
    endTime = null;
}

/**
 * Alterna a interface e o estado entre os modos 'focus' e 'rest'.
 * @param {string} newMode - O modo para o qual alternar ('focus' ou 'rest').
 */
function switchMode(newMode) {
    if (isRunning) {
        resetTimer();
    }
    currentMode = newMode;

    if (currentMode === 'focus') {
        focusModeButton.classList.add('active');
        restModeButton.classList.remove('active');
        durationInput.value = focusDuration / 60;
    } else { // 'rest'
        restModeButton.classList.add('active');
        focusModeButton.classList.remove('active');
        durationInput.value = restDuration / 60;
    }
    resetTimer(); // Garante que o display seja atualizado para o novo modo
}

/**
 * Alterna entre tema claro e escuro.
 */
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
focusModeButton.addEventListener('click', () => switchMode('focus'));
restModeButton.addEventListener('click', () => switchMode('rest'));

// --- Inicialização ---
function initialize() {
    // Define a duração inicial do foco com base no valor do input
    focusDuration = parseInt(durationInput.value, 10) * 60;
    // Define uma duração padrão para o descanso
    restDuration = 10 * 60;
    totalSeconds = focusDuration;
    secondsLeft = totalSeconds;
    updateDisplay();
}

initialize();
