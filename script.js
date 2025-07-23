const balanceEl = document.getElementById('balance');
const betInput = document.getElementById('betInput');
const playBtn = document.getElementById('playBtn');
const multiplierEl = document.getElementById('multiplier');
const messageEl = document.getElementById('message');
const spinSound = document.getElementById('spinSound');

let balance = 1000;

function updateBalance() {
  balanceEl.textContent = balance.toFixed(2);
}

function showMessage(msg) {
  messageEl.textContent = msg;
  setTimeout(() => {
    messageEl.textContent = '';
  }, 3000);
}

function playGame() {
  let bet = parseFloat(betInput.value);
  if (isNaN(bet) || bet < 3) {
    showMessage('Please enter a bet of at least 3 TON!');
    return;
  }
  if (bet > balance) {
    showMessage('Not enough balance! Add more funds.');
    return;
  }

  balance -= bet;
  updateBalance();

  // Play spin sound
  spinSound.currentTime = 0;
  spinSound.play();

  // Animate multiplier from 1.00x to random between 1.0 and 5.0
  let start = 1.00;
  let end = (Math.random() * 4 + 1).toFixed(2);
  let duration = 3000; // 3 seconds
  let frameRate = 30;
  let totalFrames = (duration / 1000) * frameRate;
  let frame = 0;

  let animation = setInterval(() => {
    frame++;
    let progress = frame / totalFrames;
    let currentMultiplier = (start + (end - start) * progress).toFixed(2);
    multiplierEl.textContent = currentMultiplier + 'x';

    if (frame >= totalFrames) {
      clearInterval(animation);

      let multiplierNum = parseFloat(end);
      let winnings = bet * multiplierNum;

      balance += winnings;
      updateBalance();

      showMessage(`You won ${winnings.toFixed(2)} TON!`);
    }
  }, 1000 / frameRate);
}

playBtn.addEventListener('click', playGame);

updateBalance();
