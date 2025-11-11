// 簿記エンジン

class BookkeepingEngine {
    constructor() {
        // 勘定科目の種類
        this.accountTypes = {
            ASSET: 'asset',
            LIABILITY: 'liability',
            EQUITY: 'equity',
            REVENUE: 'revenue',
            EXPENSE: 'expense'
        };

        // 勘定科目マスター
        this.accounts = {
            // 資産
            '現金': { type: this.accountTypes.ASSET, balance: 1000000 },
            '売掛金': { type: this.accountTypes.ASSET, balance: 0 },
            '商品': { type: this.accountTypes.ASSET, balance: 0 },
            '建物': { type: this.accountTypes.ASSET, balance: 0 },
            '機械装置': { type: this.accountTypes.ASSET, balance: 0 },

            // 負債
            '買掛金': { type: this.accountTypes.LIABILITY, balance: 0 },
            '借入金': { type: this.accountTypes.LIABILITY, balance: 0 },
            '未払金': { type: this.accountTypes.LIABILITY, balance: 0 },

            // 純資産
            '資本金': { type: this.accountTypes.EQUITY, balance: 1000000 },
            '繰越利益剰余金': { type: this.accountTypes.EQUITY, balance: 0 },

            // 収益
            '売上': { type: this.accountTypes.REVENUE, balance: 0 },
            '受取利息': { type: this.accountTypes.REVENUE, balance: 0 },

            // 費用
            '仕入': { type: this.accountTypes.EXPENSE, balance: 0 },
            '給料': { type: this.accountTypes.EXPENSE, balance: 0 },
            '地代家賃': { type: this.accountTypes.EXPENSE, balance: 0 },
            '支払利息': { type: this.accountTypes.EXPENSE, balance: 0 }
        };

        this.journalEntries = [];
        this.turnCount = 0;
    }

    // 仕訳を記帳
    postEntry(debitAccount, debitAmount, creditAccount, creditAmount) {
        if (debitAmount !== creditAmount) {
            throw new Error('借方と貸方の金額が一致しません');
        }

        // 借方の処理
        this.updateAccount(debitAccount, debitAmount, 'debit');

        // 貸方の処理
        this.updateAccount(creditAccount, creditAmount, 'credit');

        // 仕訳帳に記録
        this.journalEntries.push({
            turn: this.turnCount,
            debit: { account: debitAccount, amount: debitAmount },
            credit: { account: creditAccount, amount: creditAmount },
            timestamp: new Date()
        });

        this.turnCount++;
    }

    // 勘定科目の残高を更新
    updateAccount(accountName, amount, side) {
        const account = this.accounts[accountName];
        if (!account) {
            throw new Error(`勘定科目 ${accountName} が見つかりません`);
        }

        const type = account.type;

        // 資産・費用は借方で増加、貸方で減少
        if (type === this.accountTypes.ASSET || type === this.accountTypes.EXPENSE) {
            if (side === 'debit') {
                account.balance += amount;
            } else {
                account.balance -= amount;
            }
        }
        // 負債・資本・収益は貸方で増加、借方で減少
        else {
            if (side === 'credit') {
                account.balance += amount;
            } else {
                account.balance -= amount;
            }
        }
    }

    // 総資産を計算
    getTotalAssets() {
        return Object.entries(this.accounts)
            .filter(([_, account]) => account.type === this.accountTypes.ASSET)
            .reduce((sum, [_, account]) => sum + account.balance, 0);
    }

    // 総負債を計算
    getTotalLiabilities() {
        return Object.entries(this.accounts)
            .filter(([_, account]) => account.type === this.accountTypes.LIABILITY)
            .reduce((sum, [_, account]) => sum + account.balance, 0);
    }

    // 純資産を計算（資本 + 当期純利益）
    getTotalEquity() {
        const equity = Object.entries(this.accounts)
            .filter(([_, account]) => account.type === this.accountTypes.EQUITY)
            .reduce((sum, [_, account]) => sum + account.balance, 0);

        const netIncome = this.getNetIncome();
        return equity + netIncome;
    }

    // 当期純利益を計算（収益 - 費用）
    getNetIncome() {
        const revenue = Object.entries(this.accounts)
            .filter(([_, account]) => account.type === this.accountTypes.REVENUE)
            .reduce((sum, [_, account]) => sum + account.balance, 0);

        const expenses = Object.entries(this.accounts)
            .filter(([_, account]) => account.type === this.accountTypes.EXPENSE)
            .reduce((sum, [_, account]) => sum + account.balance, 0);

        return revenue - expenses;
    }

    // 自己資本比率を計算
    getEquityRatio() {
        const totalAssets = this.getTotalAssets();
        if (totalAssets === 0) return 0;
        return (this.getTotalEquity() / totalAssets) * 100;
    }

    // 現金残高を取得
    getCashBalance() {
        return this.accounts['現金'].balance;
    }

    // バランスシートを取得
    getBalanceSheet() {
        const assets = {};
        const liabilities = {};
        const equity = {};

        Object.entries(this.accounts).forEach(([name, account]) => {
            if (account.balance !== 0 || name === '現金' || name === '資本金') {
                if (account.type === this.accountTypes.ASSET) {
                    assets[name] = account.balance;
                } else if (account.type === this.accountTypes.LIABILITY) {
                    liabilities[name] = account.balance;
                } else if (account.type === this.accountTypes.EQUITY) {
                    equity[name] = account.balance;
                }
            }
        });

        // 当期純利益を純資産に追加
        const netIncome = this.getNetIncome();
        if (netIncome !== 0) {
            equity['当期純利益'] = netIncome;
        }

        return { assets, liabilities, equity };
    }

    // 債務超過チェック
    isBankrupt() {
        return this.getTotalEquity() <= 0;
    }

    // 資金ショートチェック
    isCashOut() {
        return this.getCashBalance() < 0;
    }
}
