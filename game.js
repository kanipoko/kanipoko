// ゲームメインロジック

class BookkeepingPuzzleGame {
    constructor() {
        this.engine = new BookkeepingEngine();
        this.score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.currentTransaction = null;
        this.difficulty = 1;
        this.correctAnswers = 0;
        this.timeLimit = 15000; // 15秒
        this.timer = null;

        // 取引パターン
        this.transactionPatterns = [
            {
                description: '商品を現金で¥{amount}仕入れた',
                correctEntry: { debit: '商品', credit: '現金' },
                difficulty: 1,
                minAmount: 50000,
                maxAmount: 200000
            },
            {
                description: '商品を¥{amount}で現金販売した（原価¥{cost}）',
                correctEntry: { debit: '現金', credit: '売上' },
                difficulty: 1,
                minAmount: 100000,
                maxAmount: 300000,
                hasCost: true
            },
            {
                description: '商品を掛けで¥{amount}販売した',
                correctEntry: { debit: '売掛金', credit: '売上' },
                difficulty: 2,
                minAmount: 150000,
                maxAmount: 400000
            },
            {
                description: '売掛金¥{amount}を現金で回収した',
                correctEntry: { debit: '現金', credit: '売掛金' },
                difficulty: 2,
                minAmount: 100000,
                maxAmount: 300000
            },
            {
                description: '商品を掛けで¥{amount}仕入れた',
                correctEntry: { debit: '商品', credit: '買掛金' },
                difficulty: 2,
                minAmount: 80000,
                maxAmount: 250000
            },
            {
                description: '買掛金¥{amount}を現金で支払った',
                correctEntry: { debit: '買掛金', credit: '現金' },
                difficulty: 2,
                minAmount: 80000,
                maxAmount: 250000
            },
            {
                description: '銀行から¥{amount}を借り入れた',
                correctEntry: { debit: '現金', credit: '借入金' },
                difficulty: 2,
                minAmount: 500000,
                maxAmount: 2000000
            },
            {
                description: '給料¥{amount}を現金で支払った',
                correctEntry: { debit: '給料', credit: '現金' },
                difficulty: 1,
                minAmount: 200000,
                maxAmount: 500000
            },
            {
                description: '家賃¥{amount}を現金で支払った',
                correctEntry: { debit: '地代家賃', credit: '現金' },
                difficulty: 1,
                minAmount: 100000,
                maxAmount: 300000
            },
            {
                description: '建物¥{amount}を現金で購入した',
                correctEntry: { debit: '建物', credit: '現金' },
                difficulty: 2,
                minAmount: 3000000,
                maxAmount: 8000000
            }
        ];

        this.initializeUI();
    }

    initializeUI() {
        document.getElementById('start-button').addEventListener('click', () => this.start());
        document.getElementById('pause-button').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-button').addEventListener('click', () => this.restart());

        this.updateUI();
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.correctAnswers = 0;
        this.difficulty = 1;

        document.getElementById('start-button').disabled = true;
        document.getElementById('pause-button').disabled = false;

        this.nextTransaction();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-button').textContent = this.isPaused ? '再開' : '一時停止';

        if (!this.isPaused && this.currentTransaction) {
            this.startTimer();
        } else if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    nextTransaction() {
        if (!this.isRunning || this.isPaused) return;

        // 難易度に応じて取引を選択
        const availablePatterns = this.transactionPatterns.filter(p => p.difficulty <= this.difficulty);
        const pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

        // 金額を生成
        const amount = Math.floor(Math.random() * (pattern.maxAmount - pattern.minAmount + 1)) + pattern.minAmount;
        const roundedAmount = Math.round(amount / 10000) * 10000; // 1万円単位に丸める

        let cost = 0;
        if (pattern.hasCost) {
            cost = Math.floor(roundedAmount * 0.6); // 原価率60%
        }

        this.currentTransaction = {
            pattern: pattern,
            amount: roundedAmount,
            cost: cost,
            description: pattern.description.replace('{amount}', roundedAmount.toLocaleString()).replace('{cost}', cost.toLocaleString())
        };

        this.displayTransaction();
        this.generateChoices();
        this.startTimer();
    }

    displayTransaction() {
        document.getElementById('current-transaction').innerHTML = `
            <p class="transaction-text">${this.currentTransaction.description}</p>
        `;
    }

    generateChoices() {
        const correctEntry = this.currentTransaction.pattern.correctEntry;
        const choices = [correctEntry];

        // 不正解の選択肢を生成
        const allAccounts = Object.keys(this.engine.accounts);
        const wrongChoices = new Set();

        while (wrongChoices.size < 3) {
            const debit = allAccounts[Math.floor(Math.random() * allAccounts.length)];
            const credit = allAccounts[Math.floor(Math.random() * allAccounts.length)];

            if (debit !== credit) {
                const choice = { debit, credit };
                const choiceStr = JSON.stringify(choice);
                const correctStr = JSON.stringify(correctEntry);

                if (choiceStr !== correctStr) {
                    wrongChoices.add(choiceStr);
                }
            }
        }

        Array.from(wrongChoices).forEach(str => {
            choices.push(JSON.parse(str));
        });

        // シャッフル
        choices.sort(() => Math.random() - 0.5);

        // 表示
        const choicesContainer = document.getElementById('entry-choices');
        choicesContainer.innerHTML = '';

        choices.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'choice-card';
            card.innerHTML = `
                <div class="entry-side">
                    <h4>借方</h4>
                    <div class="entry-item">
                        <span>${choice.debit}</span>
                        <span>¥${this.currentTransaction.amount.toLocaleString()}</span>
                    </div>
                </div>
                <div class="entry-side">
                    <h4>貸方</h4>
                    <div class="entry-item">
                        <span>${choice.credit}</span>
                        <span>¥${this.currentTransaction.amount.toLocaleString()}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => this.selectChoice(choice, card));
            choicesContainer.appendChild(card);
        });
    }

    selectChoice(choice, cardElement) {
        if (!this.isRunning || this.isPaused) return;

        clearTimeout(this.timer);

        const correctEntry = this.currentTransaction.pattern.correctEntry;
        const isCorrect = choice.debit === correctEntry.debit && choice.credit === correctEntry.credit;

        if (isCorrect) {
            cardElement.classList.add('correct');
            this.handleCorrectAnswer();
        } else {
            cardElement.classList.add('incorrect');
            this.handleWrongAnswer();
        }

        // 少し待ってから次の取引へ
        setTimeout(() => {
            if (this.isRunning) {
                this.nextTransaction();
            }
        }, 1000);
    }

    handleCorrectAnswer() {
        const amount = this.currentTransaction.amount;
        const pattern = this.currentTransaction.pattern;

        try {
            // 仕訳を記帳
            this.engine.postEntry(
                pattern.correctEntry.debit,
                amount,
                pattern.correctEntry.credit,
                amount
            );

            // 売上原価の処理
            if (pattern.hasCost && this.currentTransaction.cost > 0) {
                this.engine.postEntry('仕入', this.currentTransaction.cost, '商品', this.currentTransaction.cost);
            }

            this.correctAnswers++;
            this.score += 100 * this.difficulty;

            // 難易度を上げる
            if (this.correctAnswers % 5 === 0 && this.difficulty < 3) {
                this.difficulty++;
                this.timeLimit = Math.max(10000, this.timeLimit - 1000);
            }

            this.updateUI();
            this.checkGameOver();
        } catch (error) {
            console.error('仕訳記帳エラー:', error);
        }
    }

    handleWrongAnswer() {
        this.score = Math.max(0, this.score - 50);
        this.updateUI();
    }

    startTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.handleTimeout();
            }
        }, this.timeLimit);
    }

    handleTimeout() {
        this.gameOver('時間切れです！');
    }

    checkGameOver() {
        if (this.engine.isBankrupt()) {
            this.gameOver('債務超過になりました！');
        } else if (this.engine.isCashOut()) {
            this.gameOver('現金がマイナスになりました！');
        }
    }

    gameOver(reason) {
        this.isRunning = false;
        clearTimeout(this.timer);

        document.getElementById('game-over-reason').textContent = reason;
        document.getElementById('final-score').textContent = this.score.toLocaleString();
        document.getElementById('game-over-modal').classList.remove('hidden');

        document.getElementById('start-button').disabled = false;
        document.getElementById('pause-button').disabled = true;
    }

    restart() {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.engine = new BookkeepingEngine();
        this.start();
    }

    updateUI() {
        // ステータス更新
        document.getElementById('cash').textContent = `¥${this.engine.getCashBalance().toLocaleString()}`;
        document.getElementById('total-assets').textContent = `¥${this.engine.getTotalAssets().toLocaleString()}`;
        document.getElementById('equity-ratio').textContent = `${this.engine.getEquityRatio().toFixed(1)}%`;
        document.getElementById('score').textContent = this.score.toLocaleString();

        // バランスシート更新
        const bs = this.engine.getBalanceSheet();

        // 資産
        const assetsList = document.getElementById('assets-list');
        assetsList.innerHTML = '';
        Object.entries(bs.assets).forEach(([name, balance]) => {
            const item = document.createElement('div');
            item.className = 'account-item';
            item.innerHTML = `<span>${name}</span><span>¥${balance.toLocaleString()}</span>`;
            assetsList.appendChild(item);
        });
        document.getElementById('bs-total-assets').textContent = `¥${this.engine.getTotalAssets().toLocaleString()}`;

        // 負債
        const liabilitiesList = document.getElementById('liabilities-list');
        liabilitiesList.innerHTML = '';
        if (Object.keys(bs.liabilities).length === 0) {
            liabilitiesList.innerHTML = '<div class="account-item empty"><span>-</span><span>¥0</span></div>';
        } else {
            Object.entries(bs.liabilities).forEach(([name, balance]) => {
                const item = document.createElement('div');
                item.className = 'account-item';
                item.innerHTML = `<span>${name}</span><span>¥${balance.toLocaleString()}</span>`;
                liabilitiesList.appendChild(item);
            });
        }

        // 純資産
        const equityList = document.getElementById('equity-list');
        equityList.innerHTML = '';
        Object.entries(bs.equity).forEach(([name, balance]) => {
            const item = document.createElement('div');
            item.className = 'account-item';
            item.innerHTML = `<span>${name}</span><span>¥${balance.toLocaleString()}</span>`;
            equityList.appendChild(item);
        });

        const totalLiabilitiesEquity = this.engine.getTotalLiabilities() + this.engine.getTotalEquity();
        document.getElementById('bs-total-liabilities-equity').textContent = `¥${totalLiabilitiesEquity.toLocaleString()}`;
    }
}

// ゲーム初期化
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new BookkeepingPuzzleGame();
});
