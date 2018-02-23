"use strict";

require('../test_helper');
const HttpStatus = require('http-status-codes');
const DBService = require('../../../src/db_service');
const TradeType = require('../../../src/model/trade_type');
const Transaction = require('../../../src/model/transaction');
const Trade = require('../../../src/model/trade');
const request = require('request');
const assert = require('assert');

describe('Import backup', () => {
  const username = 'rainu';

  it(`import a account backup into the db`, (done) => {
    request.post({
      url: global.baseUri + '/api/backup',
      form: {
        username: username,
        wallets: {
          '0x123456789': {
            description: 'My BitcoinWallet'
          },
          '_COMPENSATION_FIAT_rainu': {
            description: 'Compensation account for fiat currencies.',
          },
          '_EXCHANGE_bitcoin_de_rainu': {
            description: 'Exchange wallet for bitcoin_de',
          },
        },
        transactions: {
          '#1': {
            externalId: '0x963852741',
            date: '2010-01-01T00:00:00Z',
            from: '0x123456789',
            currency: 'BTC',
            description: 'Test-Transaction',
            amount: 1,
            fee: 0.001
          },
          '#2': {
            date: '2010-06-01T00:00:00Z',
            from: '_EXCHANGE_bitcoin_de_rainu',
            currency: 'BTC',
            description: 'BTC SELL',
            amount: 1,
          },
          '#3': {
            date: '2010-06-01T00:00:00Z',
            to: '_COMPENSATION_FIAT_rainu',
            currency: 'EUR',
            description: 'BTC SELL',
            amount: 1000,
            fee: 0.55
          }
        },
        trades: [{
          in: '#2',
          out: '#3',
          type: TradeType.SELL,
          description: 'BTC SELL'
        }]
      }
    }, (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.CREATED, resp.statusCode);

      DBService.getCompleteAccount(username).then((data) => {
        assert.equal(3, data.wallets.length);
        assert.equal('0x123456789', data.wallets[0].address);
        assert.equal('My BitcoinWallet', data.wallets[0].description);
        assert.equal('_COMPENSATION_FIAT_rainu', data.wallets[1].address);
        assert.equal('Compensation account for fiat currencies.', data.wallets[1].description);
        assert.equal('_EXCHANGE_bitcoin_de_rainu', data.wallets[2].address);
        assert.equal('Exchange wallet for bitcoin_de', data.wallets[2].description);

        let btcWallet = data.wallets[0];
        assert.equal(1, btcWallet.outTransactions.length);
        assert.equal('0x963852741', btcWallet.outTransactions[0].externalId);
        assert.equal(new Date('2010-01-01T00:00:00Z').toUTCString(), btcWallet.outTransactions[0].date.toUTCString());
        assert.equal('BTC', btcWallet.outTransactions[0].currency);
        assert.equal('Test-Transaction', btcWallet.outTransactions[0].description);
        assert.equal(1, btcWallet.outTransactions[0].amount);
        assert.equal(0.001, btcWallet.outTransactions[0].fee);

        let compWallet = data.wallets[1];
        assert.equal(1, compWallet.inTransactions.length);
        assert.equal(new Date('2010-06-01T00:00:00Z').toUTCString(), compWallet.inTransactions[0].date.toUTCString());
        assert.equal('EUR', compWallet.inTransactions[0].currency);
        assert.equal('BTC SELL', compWallet.inTransactions[0].description);
        assert.equal(1000, compWallet.inTransactions[0].amount);
        assert.equal(0.55, compWallet.inTransactions[0].fee);

        let exchangeWallet = data.wallets[2];
        assert.equal(1, exchangeWallet.outTransactions.length);
        assert.equal(new Date('2010-06-01T00:00:00Z').toUTCString(), exchangeWallet.outTransactions[0].date.toUTCString());
        assert.equal('BTC', exchangeWallet.outTransactions[0].currency);
        assert.equal('BTC SELL', exchangeWallet.outTransactions[0].description);
        assert.equal(1, exchangeWallet.outTransactions[0].amount);

        assert.equal(1, data.trades.length);
        assert.equal(exchangeWallet.outTransactions[0]._id.toString(), data.trades[0].in.toString());
        assert.equal(compWallet.inTransactions[0]._id.toString(), data.trades[0].out.toString());
        assert.equal(TradeType.SELL, data.trades[0].tradeType);

        done();
      }, (err) => {
        assert.fail();
        done();
      });
    });
  });

  it('override whole account', (done) => {
    request.post({
      url: global.baseUri + '/api/account',
      form: {username: username}
    }, (err, resp, account) => {
      request.post({
        url: global.baseUri + `/api/account/${username}/wallet/exchange/bitcoin_de`,
        form: {}
      }, (err, resp, body) => {
        request.get(global.baseUri + resp.headers.location, (err, resp, body) => {
          let transactions = [new Transaction({
            date: new Date('2010-06-01T00:00:00Z'),
            from: '_EXCHANGE_bitcoin_de_rainu',
            currency: 'BTC',
            description: 'BTC SELL',
            amount: 1,
          }), new Transaction({
            date: new Date('2010-06-01T00:00:00Z'),
            to: '_COMPENSATION_FIAT_rainu',
            currency: 'EUR',
            description: 'BTC SELL',
            amount: 1000,
            fee: 0.55
          })];

          let promises = [];
          for(let tx of transactions) {
            promises.push(tx.save());
          }
          promises.push(new Trade({
            in: transactions[0]._id,
            out: transactions[1]._id,
            tradeType: TradeType.SELL,
            description: 'BTC SELL'
          }).save());

          Promise.all(promises).then(() => {
            request.put({
              url: global.baseUri + '/api/backup/' + username,
              form: {
                username: username,
                wallets: {
                  '0x123456789': {
                    description: 'My BitcoinWallet'
                  },
                  '_COMPENSATION_FIAT_rainu': {
                    description: 'Compensation account for fiat currencies.',
                  },
                  '_EXCHANGE_bitcoin_de_rainu': {
                    description: 'Exchange wallet for bitcoin_de',
                  },
                },
                transactions: {
                  '#1': {
                    externalId: '0x963852741',
                    date: '2010-01-01T00:00:00Z',
                    from: '0x123456789',
                    currency: 'BTC',
                    description: 'Test-Transaction',
                    amount: 1,
                    fee: 0.001
                  },
                  '#2': {
                    date: '2010-06-01T00:00:00Z',
                    from: '_EXCHANGE_bitcoin_de_rainu',
                    currency: 'BTC',
                    description: 'BTC SELL',
                    amount: 1,
                  },
                  '#3': {
                    date: '2010-06-01T00:00:00Z',
                    to: '_COMPENSATION_FIAT_rainu',
                    currency: 'EUR',
                    description: 'BTC SELL',
                    amount: 1000,
                    fee: 0.55
                  }
                },
                trades: [{
                  in: '#2',
                  out: '#3',
                  type: TradeType.SELL,
                  description: 'BTC SELL'
                }]
              }
            }, (err, resp, body) => {
              assert(!err);
              assert.equal(HttpStatus.CREATED, resp.statusCode);

              DBService.getCompleteAccount(username).then((data) => {
                assert.equal(3, data.wallets.length);
                assert.equal('0x123456789', data.wallets[0].address);
                assert.equal('My BitcoinWallet', data.wallets[0].description);
                assert.equal('_COMPENSATION_FIAT_rainu', data.wallets[1].address);
                assert.equal('Compensation account for fiat currencies.', data.wallets[1].description);
                assert.equal('_EXCHANGE_bitcoin_de_rainu', data.wallets[2].address);
                assert.equal('Exchange wallet for bitcoin_de', data.wallets[2].description);

                let btcWallet = data.wallets[0];
                assert.equal(1, btcWallet.outTransactions.length);
                assert.equal('0x963852741', btcWallet.outTransactions[0].externalId);
                assert.equal(new Date('2010-01-01T00:00:00Z').toUTCString(), btcWallet.outTransactions[0].date.toUTCString());
                assert.equal('BTC', btcWallet.outTransactions[0].currency);
                assert.equal('Test-Transaction', btcWallet.outTransactions[0].description);
                assert.equal(1, btcWallet.outTransactions[0].amount);
                assert.equal(0.001, btcWallet.outTransactions[0].fee);

                let compWallet = data.wallets[1];
                assert.equal(1, compWallet.inTransactions.length);
                assert.equal(new Date('2010-06-01T00:00:00Z').toUTCString(), compWallet.inTransactions[0].date.toUTCString());
                assert.equal('EUR', compWallet.inTransactions[0].currency);
                assert.equal('BTC SELL', compWallet.inTransactions[0].description);
                assert.equal(1000, compWallet.inTransactions[0].amount);
                assert.equal(0.55, compWallet.inTransactions[0].fee);

                let exchangeWallet = data.wallets[2];
                assert.equal(1, exchangeWallet.outTransactions.length);
                assert.equal(new Date('2010-06-01T00:00:00Z').toUTCString(), exchangeWallet.outTransactions[0].date.toUTCString());
                assert.equal('BTC', exchangeWallet.outTransactions[0].currency);
                assert.equal('BTC SELL', exchangeWallet.outTransactions[0].description);
                assert.equal(1, exchangeWallet.outTransactions[0].amount);

                assert.equal(1, data.trades.length);
                assert.equal(exchangeWallet.outTransactions[0]._id.toString(), data.trades[0].in.toString());
                assert.equal(compWallet.inTransactions[0]._id.toString(), data.trades[0].out.toString());
                assert.equal(TradeType.SELL, data.trades[0].tradeType);

                done();
              }, (err) => {
                assert.fail();
                done();
              });
            })
          }, (err) => {
            assert.fail();
            done();
          });
        });
      });
    });
  });

  it('export a account backup from the db', (done) => {
    request.post({
      url: global.baseUri + '/api/account',
      form: {username: username}
    }, (err, resp, account) => {
      request.post({
        url: global.baseUri + `/api/account/${username}/wallet/exchange/bitcoin_de`,
        form: {}
      }, (err, resp, body) => {
        request.get(global.baseUri + resp.headers.location, (err, resp, body) => {
          let transactions = [new Transaction({
            date: new Date('2010-06-01T00:00:00Z'),
            from: '_EXCHANGE_bitcoin_de_rainu',
            currency: 'BTC',
            description: 'BTC SELL',
            amount: 1,
          }), new Transaction({
            date: new Date('2010-06-01T00:00:00Z'),
            to: '_COMPENSATION_FIAT_rainu',
            currency: 'EUR',
            description: 'BTC SELL',
            amount: 1000,
            fee: 0.55
          })];

          let promises = [];
          for(let tx of transactions) {
            promises.push(tx.save());
          }
          promises.push(new Trade({
            in: transactions[0]._id,
            out: transactions[1]._id,
            tradeType: TradeType.SELL,
            description: 'BTC SELL'
          }).save());

          Promise.all(promises).then(() => {
            request.get(global.baseUri + `/api/backup/${username}`, (err, resp, body) => {
              assert(!err);
              assert.equal(HttpStatus.OK, resp.statusCode);

              let result = JSON.parse(body);
              assert.equal(username, result.username);

              assert.equal(2, Object.keys(result.wallets).length);
              assert(result.wallets['_COMPENSATION_FIAT_rainu']);
              assert(result.wallets['_EXCHANGE_bitcoin_de_rainu']);

              let inTx = result.transactions[transactions[1]._id.toString()];
              assert.equal('2010-06-01T00:00:00.000Z', inTx.date);
              assert.equal('EUR', inTx.currency);
              assert.equal('BTC SELL', inTx.description);
              assert.equal(1000, inTx.amount);
              assert.equal(0.55, inTx.fee);

              let outTx = result.transactions[transactions[0]._id.toString()];
              assert.equal('2010-06-01T00:00:00.000Z', outTx.date);
              assert.equal('BTC', outTx.currency);
              assert.equal('BTC SELL', outTx.description);
              assert.equal(1, outTx.amount);

              assert.equal(1, result.trades.length);
              assert.equal(transactions[0]._id.toString(), result.trades[0].in);
              assert.equal(transactions[1]._id.toString(), result.trades[0].out);
              assert.equal('BTC SELL', result.trades[0].description);
              assert.equal(TradeType.SELL, result.trades[0].type);

              done();
            });
          }, (err) => {
            assert.fail();
            done();
          });
        });
      });
    });
  });

  it('invalid data should cause a bad-request', (done) => {
    request.put({
      url: global.baseUri + '/api/backup/' + username,
      form: {}
    }, (err, resp, body) => {
      assert(!err);
      assert.equal(HttpStatus.BAD_REQUEST, resp.statusCode);

      done();
    });
  });

});