Great! Here's the updated ✅ **`script.js`** with the following changes you requested:

* 🎯 Multiple bet buttons (0.1, 10, 20, 300 TON)
* 💾 Balance is saved using `localStorage` and restored on refresh
* 🎲 Crash probabilities:

  * 10% chance to crash at **x100**
  * 30% chance to crash at **x2 or more**
  * 60% chance to crash below **x1.5**

---

## ✅ `script.js`

```javascript
class CrashGame {
    constructor() {
        this.balance = parseFloat(localStorage.getItem("ton_balance")) || 100; // Default balance
        this.currentMultiplier = 1.00;
        this.isGameRunning = false;
        this.isBetPlaced = false;
        this.crashPoint = 0;
        this.gameStartTime = 0;
        this.animationId = null;
        this.soundEnabled = true;
        this.betAmount = 0.1;

        this.initializeElements();
        this.initializeEventListeners();
        this.generateFakeUsers();
        this.generateCrashHistory();
        this.updateBalance();
        this.startGameLoop();
    }

    initializeElements() {
        this.multiplierEl = document.getElementById('multiplier');
        this.balanceEl = document.getElementById('balance');
        this.cashoutButton = document.getElementById('cashout-button');
        this.gameStatusEl = document.getElementById('game-status');
        this.soundToggle = document.getElementById('sound-toggle');
        this.copyWalletBtn = document.getElementById('copy-wallet');
        this.withdrawBtn = document.getElementById('withdraw-button');
        this.withdrawInput = document.getElementById('withdraw-input');
        this.userList = document.getElementById('user-list');
        this.crashHistory = document.getElementById('crash-history');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.betButtons = document.querySelectorAll('.bet-btn');

        this.setupCanvas();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    initializeEventListeners() {
        this.betButtons.forEach(button => {
            button.disabled = false;
            button.addEventListener('click', () => {
                this.betAmount = parseFloat(button.dataset.amount);
                this.placeBet();
            });
        });

        this.cashoutButton.addEventListener('click', () => this.cashOut());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.copyWalletBtn.addEventListener('click', () => this.copyWallet());
        this.withdrawBtn.addEventListener('click', () => this.withdraw());
        window.addEventListener('resize', () => this.setupCanvas());
    }

    generateFakeUsers() {
        const users = [];
        for (let i = 0; i < 20; i++) {
            const id = Math.floor(100000 + Math.random() * 900000);
            users.push(`🧑 ID_${id}`);
        }

        this.userList.innerHTML = users.map(user =>
            `<div class="user-item">${user}</div>`
        ).join('');

        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * users.length);
            const newId = Math.floor(100000 + Math.random() * 900000);
            users[randomIndex] = `🧑 ID_${newId}`;

            this.userList.innerHTML = users.map(user =>
                `<div class="user-item">${user}</div>`
            ).join('');
        }, 5000);
    }

    generateCrashHistory() {
        const history = [];
        for (let i = 0; i < 10; i++) {
            const crash = (1 + Math.random() * 9).toFixed(2);
            history.push(parseFloat(crash));
        }
        this.updateCrashHistory(history);
    }

    updateCrashHistory(history) {
        this.crashHistory.innerHTML = history.map(crash => {
            let className = 'low';
            if (crash >= 2 && crash < 5) className = 'medium';
            if (crash >= 5) className = 'high';
            return `<span class="crash-item ${className}">${crash}x</span>`;
        }).join('');
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    copyWallet() {
        const walletAddress = document.getElementById('wallet-address').textContent;
        navigator.clipboard.writeText(walletAddress).then(() => {
            this.copyWalletBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                this.copyWalletBtn.textContent = '📋 Copy Wallet';
            }, 2000);
        });
    }

    withdraw() {
        const address = this.withdrawInput.value.trim();
        if (!address) {
            alert('Please enter a valid TON wallet address');
            return;
        }

        if (this.balance <= 0) {
            alert('Insufficient balance for withdrawal');
            return;
        }

        alert('Withdrawal functionality is not available in demo mode');
    }

    placeBet() {
        if (this.balance < this.betAmount) {
            alert('Insufficient balance! Please deposit TON to play.');
            return;
        }

        if (this.isGameRunning) {
            alert('Wait for the current round to finish');
            return;
        }

        this.isBetPlaced = true;
        this.balance -= this.betAmount;
        this.updateBalance();
        this.disableAllBetButtons(true);
        this.gameStatusEl.textContent = `Bet placed (${this.betAmount} TON)! Waiting for round...`;
    }

    cashOut() {
        if (!this.isBetPlaced || !this.isGameRunning) return;
        const winAmount = this.betAmount * this.currentMultiplier;
        this.balance += winAmount;
        this.updateBalance();
        this.isBetPlaced = false;
        this.cashoutButton.disabled = true;
        this.gameStatusEl.textContent = `Cashed out at ${this.currentMultiplier.toFixed(2)}x! Won ${winAmount.toFixed(2)} TON`;
        this.playSound('cashout');
        this.disableAllBetButtons(false);
    }

    disableAllBetButtons(state) {
        this.betButtons.forEach(btn => btn.disabled = state);
    }

    updateBalance() {
        this.balanceEl.textContent = `Balance: ${this.balance.toFixed(2)} TON`;
        localStorage.setItem("ton_balance", this.balance.toFixed(2));
    }

    startGameLoop() {
        setTimeout(() => this.startRound(), 5000);
    }

    startRound() {
        this.isGameRunning = true;
        this.currentMultiplier = 1.00;
        this.crashPoint = this.getCrashPoint();
        this.gameStartTime = Date.now();
        this.gameStatusEl.textContent = 'Game is running!';
        this.multiplierEl.classList.remove('crashed');

        if (this.isBetPlaced) {
            this.cashoutButton.disabled = false;
        }

        this.playSound('start');
        this.runGame();
    }

    getCrashPoint() {
        const r = Math.random();
        if (r < 0.10) return 100;      // 10% chance
        if (r < 0.40) return 2 + Math.random() * 8; // 30% chance (2x to 10x)
        return 1 + Math.random() * 0.49; // 60% chance (< 1.5x)
    }

    runGame() {
        const now = Date.now();
        const elapsed = (now - this.gameStartTime) / 1000;
        const baseSpeed = 0.1;
        const accelerationFactor = 1 + (elapsed * 0.1);
        this.currentMultiplier = 1 + (elapsed * baseSpeed * accelerationFactor);

        if (this.currentMultiplier >= this.crashPoint) {
            this.crash();
            return;
        }

        this.updateDisplay();
        this.drawChart();
        this.animationId = requestAnimationFrame(() => this.runGame());
    }

    crash() {
        this.isGameRunning = false;
        this.currentMultiplier = this.crashPoint;
        this.multiplierEl.classList.add('crashed');
        this.gameStatusEl.textContent = `💥 CRASHED at ${this.crashPoint.toFixed(2)}x`;

        if (this.isBetPlaced) {
            this.isBetPlaced = false;
            this.gameStatusEl.textContent += ' — You lost your bet!';
        }

        this.cashoutButton.disabled = true;
        this.disableAllBetButtons(false);
        this.playSound('crash');
        this.updateDisplay();
        this.drawChart();

        const historyItems = Array.from(this.crashHistory.children);
        const crashes = historyItems.map(item => parseFloat(item.textContent.replace('x', '')));
        crashes.unshift(this.crashPoint);
        if (crashes.length > 10) crashes.pop();
        this.updateCrashHistory(crashes);

        setTimeout(() => {
            this.gameStatusEl.textContent = 'Next round starting...';
            setTimeout(() => this.startRound(), 
```
