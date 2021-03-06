const SHA384 = require('crypto-js/sha384');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Transaction {
    constructor(fromAddress, toAddress, amount, ) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA384(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error("You cannot sign transactions for other wallets!");
        }


        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;
        if (!this.signature || this.signature.length === 0) {
            throw new Error(" No signature in this transaction! ");
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, prevHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.contentReward=0;
    }

    calculateHash() {
        return SHA384(this.index + this.prevHash + this.timestamp + JSON.stringify(this.activityLevel) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block mined: ' + this.hash);
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;

    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.categoryMultiplier = 2;
        this.rewardFeedback = 5;
        this.upVote = 0;
        
    }

    createGenBlock() {
        return new Block('19/12/2018', 'Genesis Block', '10', 'no');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

   

    calcReward() {
        this.contentReward = this.rewardFeedback*this.categoryMultiplier;
        return this.contentReward;

    }

    getContentReward() {
        console.log('Content reward pending to Nathan is: ' + this.calcReward()); 
    }

    minePendingTransactions(miningRewardAddress) {
        
            const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
            this.pendingTransactions.push(rewardTx);

            let block = new Block(Date.now(), this.pendingTransactions);
            block.mineBlock(this.difficulty);

            console.log('Block mined successfully !');
            this.chain.push(block);

            this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
        }
    

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error("Transaction must include from and to address");
        }
        if (!transaction.isValid()) {
            throw new Error("Cannot add invalid transaction to chain");
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }



    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return 'Blockchain tampered with : ' + false;
            }
            if (currentBlock.prevHash !== previousBlock.hash) {
                return 'Blockchain tampered with : ' + false;
            }
        }
        return true;
    }
}



module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;