"use strict";

const Account = require('../model/account');
const Wallet = require('../model/wallet');
const Transaction = require('../model/transaction');
const Trade = require('../model/trade');
const DBService = require('../db_service');
const log = require('../log');

/*
  SCHEMA:

  {
    username: <username>,
    wallets: {
      <walletAddress1>: {
        description: <description>,
      },
      <walletAddressN>: { ... }
    },
    transactions: {
      <id1>: {
        externalId: <externalId>,
        date: '2010-01-01T00:00:00Z',
        from: <address>,
        to: <address>,
        currency: <currency>,
        description: <description>,
        amount: <amount>,
        fee: <fee>,
      },
      <idN>: { ... }
    },
    trades: [
      {
        in: <txId>,
        out: <txId>,
        type: <type>,
        description: <description>,
      },
      { ... }
    ]
  }

 */

/**
 * Import a whole account data.
 *
 * @param accountData
 * @return {Promise<any>}
 */
let doImport = (accountData) => {
  return new Promise((resolve, reject) => {
    //first of all we need to import all the wallets
    let dbWallets = {};
    let dbPromises = [];

    //then we need to import the account
    let dbAccount = new Account({ username: accountData.username });

    if(accountData.wallets) for(let walletAddress of Object.keys(accountData.wallets)) {
      let curWallet = accountData.wallets[walletAddress];
      dbWallets[walletAddress] = new Wallet({
        address: walletAddress,
        description: curWallet.description,
      });
      dbPromises.push(dbWallets[walletAddress].save());

      //... and mapping between wallets
      dbAccount.wallets.push(dbWallets[walletAddress]);
    }
    dbPromises.push(dbAccount.save());

    Promise.all(dbPromises).then(() => {
      //then all transactions
      let dbTransactions = {};
      dbPromises = [];
      if(accountData.transactions) for(let txId of Object.keys(accountData.transactions)) {
        let curTx = accountData.transactions[txId];
        dbTransactions[txId] = new Transaction({
          externalId: curTx.externalId,
          date: new Date(curTx.date),
          from: curTx.from,
          to: curTx.to,
          currency: curTx.currency,
          description: curTx.description,
          amount: curTx.amount,
          fee: curTx.fee,
        });
        dbPromises.push(dbTransactions[txId].save());
      }

      Promise.all(dbPromises).then(() => {
        //the last one: map transactions to trades
        dbPromises = [];

        if(accountData.trades) for(let trade of accountData.trades) {
          let dbTrade = new Trade({
            in: dbTransactions[trade.in]._id,
            out: dbTransactions[trade.out]._id,
            description: trade.description,
            tradeType: trade.type,
          });
          dbPromises.push(dbTrade.save());
        }

        Promise.all(dbPromises).then(() => {
          resolve();
        }, (err) => {
          log.error('Could not import trades!', err);
          reject(err);
        });
      }, (err) => {
        log.error('Could not import transactions!', err);
        reject(err);
      });
    }, (err) => {
      log.error('Could not import wallets or account!', err);
      reject(err);
    });
  });
};

/**
 * Export all data related to the given account. This
 * exportdata can also be used for importing the whole
 * account data.
 *
 * @param accountName the name of the account to export
 * @return {Promise<any>} the promise where resolve gives you the whole account data
 */
let doExport = (accountName) => {
  return new Promise((resolve, reject) => {
    DBService.getCompleteAccount(accountName).then((data) => {
      let result = {
        username: accountName,
        wallets: {},
        transactions: {},
        trades: []
      };

      for(let wallet of data.wallets){
        result.wallets[wallet.address] = {
          description: wallet.description,
        };

        for(let tx of [...wallet.inTransactions, ...wallet.outTransactions]) {
          result.transactions[tx._id.toString()] = {
            externalId: tx.externalId,
            date: tx.date.toISOString(),
            from: tx.from,
            to: tx.to,
            currency: tx.currency,
            description: tx.description,
            amount: tx.amount,
            fee: tx.fee,
          }
        }
      }

      for(let trade of data.trades) {
        result.trades.push({
          in: trade.in.toString(),
          out: trade.out.toString(),
          type: trade.tradeType,
          description: trade.description,
        });
      }

      resolve(result);
    }, (err) => {
      log.error('Could not get account information!', err);
      reject(err);
    })
  });
};

module.exports = {
  import: doImport,
  export: doExport
};