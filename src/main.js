const {Blockchain, Transaction} = require('./blockchain');
const EC = require ('elliptic').ec;

const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('bf175e2424263ca7c38163084eac966b59e7c5afeed4b1945c8e2d1aca7e5aff');
const myWalletAddress = myKey.getPublic('hex');

let activityToken = new Blockchain();

const tx1 = new Transaction(myWalletAddress, '>Public Key Goes Here<', 50);
tx1.signTransaction(myKey);

activityToken.addTransaction(tx1);



console.log('\n Starting miner..');
activityToken.minePendingTransactions(myWalletAddress);

console.log('\n Balance of nathan is:', activityToken.getBalanceOfAddress(myWalletAddress));


activityToken.getContentReward();
// console.log("Is chain valid?", activityToken.isChainValid());

