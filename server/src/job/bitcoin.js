"use strict";

const log = require('../log');
const request = require('./request_repeater');
const Transaction = require('../model/transaction');

const addrEndpoint = 'https://api.blockcypher.com/v1/btc/main/addrs/';
const txEndpoint = 'https://api.blockcypher.com/v1/btc/main/txs/';

const transform = (address, tx, isInput) => {
  let rTransaction = {
    externalId: tx.hash.toLowerCase(),
    date: tx.received,
    amount: 0,
    fee: 0,
    description: 'Automatically imported at ' + new Date().toISOString(),
    currency: 'BTC',
  };

  if(isInput) {
    //input is easy: the value is 1:1 in the output where the address is mine
    rTransaction.to = address;

    for(let txOut of tx.outputs) {
      if(txOut.addresses[0] === address) {
        rTransaction.amount = txOut.value;
        break;
      }
    }
  } else {
    //output is tricky: the value is the input where the address is NOT mine
    rTransaction.from = address;
    rTransaction.fee = tx.fees;

    for(let txIn of tx.outputs) {
      if(txIn.addresses[0] !== address) {
        rTransaction.amount = txIn.value;
        break;
      }
    }
  }

  return new Transaction(rTransaction);
};

const existTransaction = (transactions, txId) => {
  txId = txId.toLowerCase();

  for(let curTx of transactions) {
    if(curTx.externalId === txId) {
      return true;
    }
  }

  return false;
};

const handleTransaction = (address, txHash, importIn, importOut) => {
  return new Promise((resolve, reject) => {
    //we have to search the transaction info
    request(txEndpoint + txHash).then((result) => {
      let transaction = JSON.parse(result.body);
      let isIn = false;
      let isOut = false;

      outer: for(let txIn of transaction.inputs) {
        for(let addr of txIn.addresses) {
          if(addr === address) {
            isIn = true;
            break outer;
          }
        }
      }

      outer: for(let txOut of transaction.outputs) {
        for(let addr of txOut.addresses) {
          if(addr === address) {
            isOut = true;
            break outer;
          }
        }
      }

      //if the tx contains my address in input AND output: this is a outgoing
      //if the tx contains my address only in output: this is a incoming
      if(isIn && isOut) {
        isIn = false;
        isOut = true;
      } else {
        isIn = true;
        isOut = false;
      }

      //if we dont want to import incoming tx and the current tx is an incoming one
      if(!importIn && isIn) {
        resolve();
        return;
      }

      //if we dont want to import outgoing tx and the current tx is an outgoing one
      if(!importOut && isOut) {
        resolve();
        return;
      }

      //we have to transform the transaction
      //and save them after into our database
      transform(address, transaction, isIn).save((err, savedTx) => {
        if(err) {
          log.warn('Could not save the transaction!', err);
          reject();
        }else{
          resolve();
        }
      });
    }, (err) => {
      reject(err);
    });
  });
};

const doJob = (address, importIn, importOut) => {
  return new Promise((resolve, reject) => {

    //first of all we need a transaction list that we have already imported
    Transaction.find({ $or:[ {'from':address}, {'to':address} ]}).then((persistedTx) => {

      //now we can look into the blockchain...
      //first we search the address...
      request(addrEndpoint + address).then((result) => {
        let info = JSON.parse(result.body);
        let promises = new Array(info.txrefs.length);
        let txHashes = new Set();

        //in that address-info we can find all transactions
        //foreach transaction...
        for(let tx of info.txrefs) {
          txHashes.add(tx.tx_hash);
        }
        for(let txHash of txHashes) {
          if(existTransaction(persistedTx, txHash)) {
            //we do know already this transaction
            continue;
          }

          promises.push(handleTransaction(address, txHash, importIn, importOut));
        }

        Promise.all(promises).then(() => {
          resolve();
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    }, (err) => {
      reject(err);
    });
  });
};

module.exports = doJob;