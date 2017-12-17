"use strict";

const log = require('../log');
const request = require('./request_repeater');
const Transaction = require('../model/transaction');

const addrEndpoint = 'https://api.blockcypher.com/v1/eth/main/addrs/';
const txEndpoint = 'https://api.blockcypher.com/v1/eth/main/txs/';

const transform = (tx) => {
  return new Transaction({
    externalId: tx.hash.toLowerCase(),
    date: tx.received,
    from: ('0x' + tx.outputs[0].addresses[0]).toLowerCase(),
    to: ('0x' + tx.inputs[0].addresses[0]).toLowerCase(),
    fee: tx.fees,
    amount: tx.total,
    description: 'Automatically imported at ' + new Date().toISOString(),
    currency: 'ETH',
  });
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

const handleTransaction = (txHash) => {
  return new Promise((_resolve, _reject) => {
    //we have to search the transaction info
    request(txEndpoint + txHash).then((result) => {

      //we have to transform the transaction
      //and save them after into our database
      transform(JSON.parse(result.body)).save((err, savedTx) => {
        if(err) {
          log.warn('Could not save transaction!', err);
          _reject();
        }else{
          _resolve();
        }
      });
    }, (err) => {
      _reject(err);
    });
  });
};

const doJob = (address, importIn, importOut) => {
  address = address.toLowerCase();

  return new Promise((resolve, reject) => {

    //first of all we need a transaction list that we have already imported
    Transaction.find({ $or:[ {'from':address}, {'to':address} ]}).then((persistedTx) => {

      //now we can look into the blockchain...
      //first we search the address...
      request(addrEndpoint + address).then((result) => {
        let info = JSON.parse(result.body);
        let promises = new Array(info.txrefs.length);

        //in that address-info we can find all transactions
        //foreach transaction...
        for(let tx of info.txrefs) {
          if(existTransaction(persistedTx, tx.tx_hash)) {
            //we do know already this transaction
            continue;
          }

          if(importIn && tx.tx_input_n == 0) {
            //if we want to import incoming tx and the current tx is an incoming one
            promises.push(handleTransaction(tx.tx_hash));
          } else if (importOut && tx.tx_input_n == -1){
            //if we want to import outgoing tx and the current tx is an outgoing one
            promises.push(handleTransaction(tx.tx_hash));
          }
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