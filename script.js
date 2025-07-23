const balanceEl = document.getElementById('balance');
const betInput = document.getElementById('betInput');
const startBtn = document.getElementById('startBtn');
const multiplierEl = document.getElementById('multiplier');
const messageEl = document.getElementById('message');
const sound = document.getElementById('multiplierSound');

let balance = 10.0;
let gameRunning = false;

function setMessage(text, type = '') {
  messageEl.textContent = text;
  messageEl.className = 'message'; // reset
  if (type) messageEl.classList.add(type);
}

function playSound() {
  sound.currentTime = 0;
  sound.play();
}

function formatMult(n) {
  return n.toFixed(2) + 'x';
}

startBtn.addEventListener('click', () => {
  if (gameRunning) return;

  const bet = parseFloat(betInput.value);
  if (isNaN(bet)) {
    setMessage('Please enter a valid bet amount.', 'error');
    return;
  }
  if (bet < 3) {
    setMessage('Minimum bet is 3 TON.', 'error');
    return;
  }
  if (bet > balance) {
    setMessage('Insufficient balance! Please add more TON.', 'error');
    return;
  }

  // Start game
  setMessage('');
  gameRunning = true;
  startBtn.disabled = true;
  betInput.disabled = true;

  balance -= bet;
  balanceEl.textContent = balance.toFixed(2);

  let multiplier = 1.0;
  multiplierEl.textContent = formatMult(multiplier);
  multiplierEl.style.color = '#0ff';

  // Play sound every 300ms during multiplier increase
  const soundInterval = setInterval(playSound, 300);

  // Increase multiplier every 100ms randomly
  const multiplierInterval = setInterval(() => {
    multiplier += Math.random() * 0.1 + 0.01; // smoother growth
    multiplierEl.textContent = formatMult(multiplier);

    // Change multiplier color glow based on multiplier value
    if (multiplier < 2) {
      multiplierEl.style.color = '#0ff';
      multiplierEl.style.textShadow =
        '0 0 15px #0ff, 0 0 30px #0ff, 0 0 45px #0ff';
    } else if (multiplier < 4) {
      multiplierEl.style.color = '#ff0';
      multiplierEl.style.textShadow =
        '0 0 15px #ff0, 0 0 30px #ff0, 0 0 45px #ff0';
    } else {
      multiplierEl.style.color = '#f80';
      multiplierEl.style.textShadow =
        '0 0 15px #f80, 0 0 30px #f80, 0 0 45px #f80';
    }
  }, 100);

  // Random crash time between 3 and 8 seconds
  const crashTime = 3000 + Math.random() * 5000;

  setTimeout(() => {
    clearInterval(multiplierInterval);
    clearInterval(soundInterval);

    // The final multiplier at crash
    const crashMultiplier = multiplier;

    multiplierEl.textContent = formatMult(crashMultiplier) + ' (CRASH!)';

    // User loses bet (already deducted)

    setMessage(
      `Crash at ${formatMult(crashMultiplier)}. You lost your bet of ${bet.toFixed(
        2
      )} TON.`,
      'error'
    );

    gameRunning = false;
    startBtn.disabled = false;
    betInput.disabled = false;
  }, crashTime);
});
