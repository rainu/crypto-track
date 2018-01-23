require('../rest_api/test_helper');
const assert = require('assert');
const txFinder = require('../../src/report/tx_finder');
const Wallet = require('../../src/model/wallet');
const WalletFactory = require('../../src/model/wallet_factory');
const Transaction = require('../../src/model/transaction');
const Account = require('../../src/model/account');
const Trade = require('../../src/model/trade');
const TradeType = require('../../src/model/trade_type');

describe('Tax transaction finder', () => {

  it(`1) buy coin from exchange
  2) transfer to wallet
  2.1) hold it
  3) transfer it back to exchange
  4) sell the coin`, (done) => {
    let wallet = {
      fiat: WalletFactory.compensation('rainu'),
      exchange: WalletFactory.exchange('bitcoin_de'),
      btc: new Wallet({address: 'btc123456789'}),
    };
    let account = new Account({username: 'rainu', wallets: [wallet.fiat, wallet.exchange, wallet.btc]});
    let transactions = [
      new Transaction({from: wallet.fiat.address, date: new Date('2000-01-01'), amount: 100E+2, currency: 'EUR'}),
      new Transaction({to: wallet.exchange.address, date: new Date('2000-01-01'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({from: wallet.exchange.address, to: wallet.btc.address, date: new Date('2000-01-02'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({from: wallet.btc.address, to: wallet.exchange.address, date: new Date('2000-06-01'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({from: wallet.exchange.address, date: new Date('2000-06-01'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({to: wallet.fiat.address, date: new Date('2000-06-01'), amount: 200E+2, currency: 'EUR'}),
    ];
    let trades = [
      new Trade({in: transactions[0], out: transactions[1], tradeType: TradeType.BUY}),
      new Trade({in: transactions[4], out: transactions[5], tradeType: TradeType.SELL}),
    ];
    let promises = [
        account.save(), wallet.fiat.save(), wallet.exchange.save(), wallet.btc.save(),
    ];
    for(let tx of transactions) {
      promises.push(tx.save());
    }
    for(let trade of trades) {
      promises.push(trade.save());
    }

    Promise.all(promises).then(() => {
      txFinder(account.username).then((result) => {
        assert.equal(result['BTC'].in.length, 1);
        assert.equal(result['BTC'].in[0].date.toISOString(), transactions[0].date.toISOString());
        assert.equal(result['BTC'].in[0].amount, 1);
        assert.equal(result['BTC'].in[0].exchangeRatio, 100);

        assert.equal(result['BTC'].out.length, 1);
        assert.equal(result['BTC'].out[0].date.toISOString(), transactions[5].date.toISOString());
        assert.equal(result['BTC'].out[0].amount, 1);
        assert.equal(result['BTC'].out[0].exchangeRatio, 200);

        done();
      }, (err) => {
        assert.fail(err);
        done();
      });
    });
  });

  it(`1) buy coin from exchange
  2) transfer to wallet
  3) buy something with coin`, (done) => {
    let wallet = {
      fiat: WalletFactory.compensation('rainu'),
      exchange: WalletFactory.exchange('bitcoin_de'),
      btc: new Wallet({address: 'btc123456789'}),
    };
    let account = new Account({username: 'rainu', wallets: [wallet.fiat, wallet.exchange, wallet.btc]});
    let transactions = [
      new Transaction({from: wallet.fiat.address, date: new Date('2000-01-01'), amount: 100E+2, currency: 'EUR'}),
      new Transaction({to: wallet.exchange.address, date: new Date('2000-01-01'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({from: wallet.exchange.address, to: wallet.btc.address, date: new Date('2000-01-02'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({from: wallet.btc.address, date: new Date('2000-06-01'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({to: wallet.fiat.address, date: new Date('2000-06-01'), amount: 200E+2, currency: 'EUR'}),
    ];
    let trades = [
      new Trade({in: transactions[0], out: transactions[1], tradeType: TradeType.BUY}),
      new Trade({in: transactions[3], out: transactions[4], tradeType: TradeType.SPEND}),
    ];
    let promises = [
        account.save(), wallet.fiat.save(), wallet.exchange.save(), wallet.btc.save(),
    ];
    for(let tx of transactions) {
      promises.push(tx.save());
    }
    for(let trade of trades) {
      promises.push(trade.save());
    }

    Promise.all(promises).then(() => {
      txFinder(account.username).then((result) => {
        assert.equal(result['BTC'].in.length, 1);
        assert.equal(result['BTC'].in[0].date.toISOString(), transactions[0].date.toISOString());
        assert.equal(result['BTC'].in[0].amount, 1);
        assert.equal(result['BTC'].in[0].exchangeRatio, 100);

        assert.equal(result['BTC'].out.length, 1);
        assert.equal(result['BTC'].out[0].date.toISOString(), transactions[4].date.toISOString());
        assert.equal(result['BTC'].out[0].amount, 1);
        assert.equal(result['BTC'].out[0].exchangeRatio, 200);

        done();
      }, (err) => {
        assert.fail(err);
        done();
      });
    });
  });

  it(`1) buy coin from exchange
  2) transfer to wallet
  3) exchange to other coin
  4) transfer other coin to exchange
  5) sell other coin`, (done) => {
    let wallet = {
      fiat: WalletFactory.compensation('rainu'),
      exchange: WalletFactory.exchange('bitcoin_de'),
      btc: new Wallet({address: 'btc123456789'}),
      eth: new Wallet({address: 'eth123456789'}),
    };
    let account = new Account({username: 'rainu', wallets: [wallet.fiat, wallet.exchange, wallet.btc, wallet.eth]});
    let transactions = [
      new Transaction({from: wallet.fiat.address, date: new Date('2000-01-01'), amount: 100E+2, currency: 'EUR'}),
      new Transaction({to: wallet.exchange.address, date: new Date('2000-01-01'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({from: wallet.exchange.address, to: wallet.btc.address, date: new Date('2000-01-02'), amount: 1E+8, currency: 'BTC'}),

      new Transaction({from: wallet.btc.address, date: new Date('2000-01-02'), amount: 1E+8, currency: 'BTC'}),
      new Transaction({to: wallet.eth.address, date: new Date('2000-01-02'), amount: 10E+18, currency: 'ETH'}),

      new Transaction({from: wallet.eth.address, date: new Date('2000-06-01'), amount: 10E+18, currency: 'ETH'}),
      new Transaction({to: wallet.fiat.address, date: new Date('2000-06-01'), amount: 200E+2, currency: 'EUR'}),
    ];
    let trades = [
      new Trade({in: transactions[0], out: transactions[1], tradeType: TradeType.BUY}),
      new Trade({in: transactions[3], out: transactions[4], tradeType: TradeType.EXCHANGE,
        inValue: { amount: 150, currency: 'EUR' }, outValue: { amount: 150, currency: 'EUR' }}),
      new Trade({in: transactions[5], out: transactions[6], tradeType: TradeType.SELL}),
    ];
    let promises = [
        account.save(), wallet.fiat.save(), wallet.exchange.save(), wallet.eth.save(), wallet.btc.save(),
    ];
    for(let tx of transactions) {
      promises.push(tx.save());
    }
    for(let trade of trades) {
      promises.push(trade.save());
    }

    Promise.all(promises).then(() => {
      txFinder(account.username).then((result) => {
        assert.equal(result['BTC'].in[0].date.toISOString(), transactions[0].date.toISOString());
        assert.equal(result['BTC'].in[0].amount, 1);
        assert.equal(result['BTC'].in[0].exchangeRatio, 100);
        assert.equal(result['ETH'].in[0].date.toISOString(), transactions[4].date.toISOString());
        assert.equal(result['ETH'].in[0].amount, 10);
        assert.equal(result['ETH'].in[0].exchangeRatio, 15);


        assert.equal(result['BTC'].out[0].date.toISOString(), transactions[3].date.toISOString());
        assert.equal(result['BTC'].out[0].amount, 1);
        assert.equal(result['BTC'].out[0].exchangeRatio, 150);
        assert.equal(result['ETH'].out[0].date.toISOString(), transactions[6].date.toISOString());
        assert.equal(result['ETH'].out[0].amount, 10);
        assert.equal(result['ETH'].out[0].exchangeRatio, 20);

        done();
      }, (err) => {
        assert.fail(err);
        done();
      });
    });
  });
});