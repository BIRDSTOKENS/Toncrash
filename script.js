const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const multiplierDisplay = document.getElementById("multiplier");
const balanceDisplay = document.getElementById("balance");
const gameStatus = document.getElementById("game-status");

const betInput = document.getElementById("bet-input");
const startButton = document.getElementById("start-button");
const cashoutButton = document.getElementById("cashout-button");

let balance = 100; // starting balance
let bet = 0;
let multiplier = 1;
let crashed = false;
let gameRunning = false;
let crashPoint = 0;
let animationId;

// For animation scaling pulse
let scale = 1;
let pulseDirection = 1;

// Audio context for beep sounds
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playBeep(freq = 440, duration = 150, volume = 0.1) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

  oscillator.start();

  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function playCrashSound() {
  playBeep(150, 300, 0.2);
}

function playCashoutSound() {
  playBeep(600, 120, 0.15);
  setTimeout(() => playBeep(800, 120, 0.15), 150);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = crashed ? "red" : "#0f0";
  ctx.font = `bold ${70 * scale}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(multiplier.toFixed(2) + "x", canvas.width / 2, canvas.height / 2);
}

function getRandomCrashPoint() {
  let r = Math.random();
  return Math.max(1.2, 1 / (1 - r));
}

function startGame() {
  bet = parseFloat(betInput.value);

  if (isNaN(bet) || bet < 3) {
    gameStatus.textContent = "Minimum bet is 3 TON. Please add more balance.";
    return;
  }

  if (bet > balance) {
    gameStatus.textContent = "Insufficient balance.";
    return;
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  multiplier = 1;
  crashed = false;
  gameRunning = true;
  crashPoint = getRandomCrashPoint();

  balance -= bet;
  updateBalance();

  gameStatus.textContent = "Game started! Good luck!";
  startButton.disabled = true;
  betInput.disabled = true;
  cashoutButton.disabled = false;
  multiplierDisplay.classList.remove("crashed");

  scale = 1;
  pulseDirection = 1;

  animate();
}

function animate() {
  if (!gameRunning) return;

  multiplier *= 1.007;

  scale += pulseDirection * 0.007;
  if (scale >= 1.1) pulseDirection = -1;
  if (scale <= 1) pulseDirection = 1;

  if (multiplier >= crashPoint) {
    crashed = true;
    gameRunning = false;
    multiplier = crashPoint;

    multiplierDisplay.classList.add("crashed");
    multiplierDisplay.style.transform = "scale(1)";

    gameStatus.textContent = `Crashed at ${multiplier.toFixed(2)}x! You lost your bet.`;
    playCrashSound();

    cashoutButton.disabled = true;
    startButton.disabled = false;
    betInput.disabled = false;
    multiplierDisplay.textContent = multiplier.toFixed(2) + "x";
    draw();
    return;
  }

  multiplierDisplay.textContent = multiplier.toFixed(2) + "x";
  multiplierDisplay.style.transform = `scale(${scale.toFixed(2)})`;

  draw();

  animationId = requestAnimationFrame(animate);
}

function cashOut() {
  if (!gameRunning || crashed) return;

  gameRunning = false;
  cancelAnimationFrame(animationId);

  const winnings = bet * multiplier;
  balance += winnings;

  updateBalance();

  gameStatus.textContent = `You cashed out at ${multiplier.toFixed(2)}x! Winnings: ${winnings.toFixed(2)} TON`;
  playCashoutSound();

  cashoutButton.disabled = true;
  startButton.disabled = false;
  betInput.disabled = false;

  multiplierDisplay.classList.remove("crashed");
  multiplierDisplay.style.transform = "scale(1)";
}

function updateBalance() {
  balanceDisplay.textContent = `Balance: ${balance.toFixed(2)} TON`;
}

startButton.addEventListener("click", startGame);
cashoutButton.addEventListener("click", cashOut);

updateBalance();
multiplierDisplay.textContent = "1.00x";
draw();
