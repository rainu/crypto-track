"use strict";

const log = require('./log');
const Wallet = require('./model/wallet');
const Account = require('./model/account');
const Trade = require('./model/trade');

/**
 * Get all data for given account
 *
 * @param username The username of account
 * @returns {Promise<any>} where result contains all data:
 * <ul>
 *   <li><b>account</b> - account data</li>
 *   <li><b>wallets</b> - all wallets (inclusive in/out transactions) for the account</li>
 *   <li><b>trades</b> - all trades for the account</li>
 * </ul>
 */
const getCompleteAccount = (username) => {
  return new Promise((resolve, reject) => {
    //first we have to find all wallets for the user
    Account.findOne({username: username}).then(
        (account) => {
          //in the wallets we can join th transactions
          Wallet.find({_id: { $in: account.wallets }}).populate('outTransactions').populate('inTransactions').then(
              (wallets) => {
                //now we have the wallets (and transactions) and we can find the trades
                //but first we need to extract all transaction ids
                let txIds = new Set();

                for(let wallet of wallets) {
                  for(let tx of wallet.outTransactions) {
                    txIds.add(tx._id);
                  }
                  for(let tx of wallet.inTransactions) {
                    txIds.add(tx._id);
                  }
                }
                const atxIds = [...txIds];

                Trade.find({
                  $or: [{'in': { $in: atxIds }}, {'out': { $in: atxIds }}]
                }).then(
                    (trades) => {
                      //now we have gather all information for account
                      resolve({
                        account: account,
                        wallets: wallets,
                        trades: trades,
                      });
                    },
                    (err) => {
                      log.error(`Could not find trades for account ${username}`, err);
                      reject(err);
                    }
                );
              },
              (err) => {
                log.error(`Could not find wallets for account ${username}`, err);
                reject(err);
              }
          );
        },
        (err) => {
          log.error(`Could not find account by name ${username}`, err);
          reject(err);
        }
    );
  });
};

module.exports = {
  getCompleteAccount: getCompleteAccount,
};