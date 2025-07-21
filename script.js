
class CrashGame {
    constructor() {
        this.balance = 0;
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
        this.startGameLoop();
    }

    initializeElements() {
        this.multiplierEl = document.getElementById('multiplier');
        this.balanceEl = document.getElementById('balance');
        this.betButton = document.getElementById('bet-button');
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
        this.betButton.addEventListener('click', () => this.placeBet());
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
        
        // Update user list every 5 seconds
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
        
        // Create audio element dynamically since we don't have actual sound files
        const audio = new Audio();
        
        // Simulate different sounds with different frequencies
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(soundName) {
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
        this.betButton.disabled = true;
        this.gameStatusEl.textContent = 'Bet placed! Waiting for next round...';
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
        
        // Re-enable bet button for next round
        setTimeout(() => {
            this.betButton.disabled = false;
        }, 1000);
    }

    updateBalance() {
        this.balanceEl.textContent = `Balance: ${this.balance.toFixed(2)} TON`;
    }

    startGameLoop() {
        // Wait 7 seconds before starting first round
        setTimeout(() => {
            this.startRound();
        }, 7000);
    }

    startRound() {
        this.isGameRunning = true;
        this.currentMultiplier = 1.00;
        this.crashPoint = 1 + Math.random() * 9; // Random crash between 1.00x and 10.00x
        this.gameStartTime = Date.now();
        
        this.gameStatusEl.textContent = 'Game is running!';
        this.multiplierEl.classList.remove('crashed');
        
        if (this.isBetPlaced) {
            this.cashoutButton.disabled = false;
        }
        
        this.playSound('start');
        this.runGame();
    }

    runGame() {
        const now = Date.now();
        const elapsed = (now - this.gameStartTime) / 1000;
        
        // Calculate multiplier based on elapsed time and crash point
        const baseSpeed = 0.1;
        const accelerationFactor = 1 + (elapsed * 0.1);
        this.currentMultiplier = 1 + (elapsed * baseSpeed * accelerationFactor);
        
        // Check if we should crash
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
        
        this.gameStatusEl.textContent = `CRASHED at ${this.crashPoint.toFixed(2)}x!`;
        
        if (this.isBetPlaced) {
            this.isBetPlaced = false;
            this.gameStatusEl.textContent += ' You lost your bet!';
        }
        
        this.cashoutButton.disabled = true;
        this.betButton.disabled = false;
        
        this.playSound('crash');
        this.updateDisplay();
        this.drawChart();
        
        // Add to crash history
        const historyItems = Array.from(this.crashHistory.children);
        const crashes = historyItems.map(item => parseFloat(item.textContent.replace('x', '')));
        crashes.unshift(this.crashPoint);
        if (crashes.length > 10) crashes.pop();
        
        this.updateCrashHistory(crashes);
        
        // Start next round after 7 seconds
        setTimeout(() => {
            this.gameStatusEl.textContent = 'Next round starting...';
            setTimeout(() => {
                this.startRound();
            }, 3000);
        }, 4000);
    }

    updateDisplay() {
        this.multiplierEl.textContent = `${this.currentMultiplier.toFixed(2)}x`;
    }

    drawChart() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            const y = (height / 10) * i;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        if (!this.isGameRunning && this.currentMultiplier === 1.00) return;
        
        // Draw curve
        ctx.strokeStyle = this.isGameRunning ? '#00ffff' : '#ff4757';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const elapsed = (Date.now() - this.gameStartTime) / 1000;
        const maxTime = 30; // Max display time
        const timeStep = elapsed / 100;
        
        for (let i = 0; i <= 100; i++) {
            const t = (i / 100) * elapsed;
            const mult = 1 + (t * 0.1 * (1 + t * 0.1));
            
            const x = (t / maxTime) * width;
            const y = height - ((mult - 1) / (this.crashPoint - 1)) * height * 0.8;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw crash point if crashed
        if (!this.isGameRunning) {
            ctx.fillStyle = '#ff4757';
            ctx.font = '16px Orbitron';
            ctx.fillText('CRASHED!', width - 100, 30);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CrashGame();
});
