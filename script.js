class CrashGame {
    constructor() {
        this.balance = parseFloat(localStorage.getItem('balance')) || 100;
        this.currentMultiplier = 1.00;
        this.isGameRunning = false;
        this.isBetPlaced = false;
        this.crashPoint = 0;
        this.gameStartTime = 0;
        this.animationId = null;
        this.soundEnabled = true;
        this.betAmount = 0;

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
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseFloat(btn.getAttribute('data-amount'));
                this.placeBet(amount);
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

    playSound(soundName) {
        if (!this.soundEnabled) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (soundName) {
            case 'start':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
                break;
            case 'cashout':
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
                break;
            case 'crash':
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.3);
                break;
        }

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
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

    placeBet(amount) {
        if (this.balance < amount) {
            alert('Insufficient balance! Please deposit TON to play.');
            return;
        }

        if (this.isGameRunning) {
            alert('Wait for the current round to finish');
            return;
        }

        this.isBetPlaced = true;
        this.betAmount = amount;
        this.balance -= amount;
        this.updateBalance();
        this.gameStatusEl.textContent = `Bet placed: ${amount} TON`;
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

        setTimeout(() => {
            document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = false);
        }, 1000);
    }

    updateBalance() {
        this.balanceEl.textContent = `Balance: ${this.balance.toFixed(2)} TON`;
        localStorage.setItem('balance', this.balance.toFixed(2));
    }

    startGameLoop() {
        setTimeout(() => {
            this.startRound();
        }, 7000);
    }

    startRound() {
        this.isGameRunning = true;
        this.currentMultiplier = 1.00;
        const roll = Math.random();

        if (roll < 0.1) {
            this.crashPoint = 100;
        } else if (roll < 0.4) {
            this.crashPoint = 2 + Math.random() * 8;
        } else {
            this.crashPoint = 1 + Math.random() * 0.5;
        }

        this.gameStartTime = Date.now();
        this.gameStatusEl.textContent = 'Game is running!';
        this.multiplierEl.classList.remove('crashed');

        if (this.isBetPlaced) {
            this.cashoutButton.disabled = false;
        }

        document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = true);
        this.playSound('start');
        this.animateGame();
    }

    animateGame() {
        const duration = 20000;

        const draw = () => {
            const elapsed = (Date.now() - this.gameStartTime) / 1000;
            this.currentMultiplier = 1 + Math.pow(elapsed, 2) / 10;
            this.multiplierEl.textContent = `${this.currentMultiplier.toFixed(2)}x`;

            const width = this.canvas.width / window.devicePixelRatio;
            const height = this.canvas.height / window.devicePixelRatio;

            this.ctx.clearRect(0, 0, width, height);
            this.ctx.beginPath();
            this.ctx.moveTo(0, height);
            this.ctx.lineTo(width, height - this.currentMultiplier * 10);
            this.ctx.strokeStyle = '#0f0';
            this.ctx.stroke();

            if (this.currentMultiplier >= this.crashPoint) {
                cancelAnimationFrame(this.animationId);
                this.endRound();
            } else {
                this.animationId = requestAnimationFrame(draw);
            }
        };

        this.animationId = requestAnimationFrame(draw);
    }

    endRound() {
        this.isGameRunning = false;
        this.multiplierEl.textContent = `💥 ${this.crashPoint.toFixed(2)}x`;
        this.multiplierEl.classList.add('crashed');
        this.gameStatusEl.textContent = `Crashed at ${this.crashPoint.toFixed(2)}x`;

        if (this.isBetPlaced) {
            this.isBetPlaced = false;
            this.cashoutButton.disabled = true;
            this.playSound('crash');
        }

        const prevHistory = Array.from(this.crashHistory.children).map(item => parseFloat(item.textContent));
        prevHistory.unshift(this.crashPoint);
        if (prevHistory.length > 10) prevHistory.pop();
        this.updateCrashHistory(prevHistory);

        setTimeout(() => {
            this.startGameLoop();
        }, 7000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CrashGame();
});
