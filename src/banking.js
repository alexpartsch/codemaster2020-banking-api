const {JsonDB} = require('node-json-db');
const {Config} = require('node-json-db/dist/lib/JsonDBConfig');
const {nanoid} = require('nanoid');

class BankingService {

    constructor() {
        this.db = new JsonDB(new Config("banking", true, false, '/'));
    }

    openAccount(accountHolderName, initialBalance, overdraftFacility) {
        const newAccount = {
            id: nanoid(),
            name: accountHolderName,
            balance: initialBalance,
            overdraftFacility: overdraftFacility,
            opened: new Date()
        };
        this.db.push(`/accounts/${newAccount.id}`, newAccount);
        return newAccount;
    }

    listAccounts() {
        return Object.values(this.db.getData('/accounts/'));
    }

    getAccount(accountId) {
        return this.db.getData(`/accounts/${accountId}`);
    }

    withdraw(accountId, amount) {
        return this.deposit(accountId, -amount);
    }

    deposit(accountId, amount) {
        const account = this.getAccount(accountId);
        const newAmount = account.balance + amount;
        if(newAmount < account.overdraftFacility) {
            return false;
        }
        account.balance = newAmount;
        this.db.push(`/accounts/${accountId}`, account);
        const transactionId = nanoid();
        this.db.push(`/transactions/${accountId}[]`, {
            id: transactionId,
            accountId: accountId,
            amount,
            occurred: new Date()
        });
        return true;
    }

    listDeposits(accountId) {
        return this.db.getData(`/transactions/${accountId}`);
    }
}

module.exports.BankingService = BankingService;