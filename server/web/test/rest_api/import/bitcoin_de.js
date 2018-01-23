"use strict";

require('../test_helper');
const assert = require('assert');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const request = require('request');
const DBService = require('../../../src/db_service');
const TradeType = require('../../../src/model/trade_type');

describe('Import Endpoint', () => {
  const username = 'rainu';

  beforeEach((done) => {
    request.post({
      url: global.baseUri + '/api/account',
      form: {username: username}
    }, (err, resp, account) => {
      request.post({
        url: global.baseUri + '/api/account/rainu/wallet/exchange/bitcoin_de',
        form: {}
      }, (err, resp, body) => {
        request.get(global.baseUri + resp.headers.location, (err, resp, body) => {
          done();
        });
      });
    });
  });

  let coins = [
      { name: 'btc', symbol: 'BTC', coinFactor: 1 },
      { name: 'bch', symbol: 'BCH', coinFactor: 1 },
      { name: 'eth', symbol: 'ETH', coinFactor: 10000000000 }
  ];
  
  for(let coin of coins) {
    it(`import ${coin.name}-csv from bitcoin.de`, (done) => {
      fs.createReadStream(`${__dirname}/bitcoin_de_${coin.name}.csv`)
        .pipe(request.put(global.baseUri + `/api/account/${username}/import/csv/bitcoin_de`))
        .on('response', (response) => {
          assert.equal(response.statusCode, HttpStatus.CREATED);

          DBService.getCompleteAccount(username).then((result) => {
            let allTx = {};
            for(let wallet of result.wallets){
              for(let tx of wallet.inTransactions){
                allTx[tx._id.toString()] = tx;
              }
              for(let tx of wallet.outTransactions){
                allTx[tx._id.toString()] = tx;
              }
            }

            result.trades.sort((t1, t2) => {
              let tx1 = allTx[t1.in.toString()];
              let tx2 = allTx[t2.in.toString()];

              return tx1.date - tx2.date;
            });

            let trade = result.trades[0];
            assert.equal(trade.tradeType, TradeType.GIFT);
            assert.equal(allTx[trade.in.toString()].date.toISOString(), '2000-01-01T20:00:42.000Z');
            assert.equal(allTx[trade.in.toString()].from, '_COMPENSATION_FIAT_rainu');
            assert.equal(allTx[trade.in.toString()].amount, 0);
            assert.equal(allTx[trade.in.toString()].currency, 'EUR');
            assert.equal(allTx[trade.out.toString()].date.toISOString(), '2000-01-01T20:00:42.000Z');
            assert.equal(allTx[trade.out.toString()].to, '_EXCHANGE_bitcoin_de_rainu');
            assert.equal(allTx[trade.out.toString()].amount, 100000 * coin.coinFactor);
            assert.equal(allTx[trade.out.toString()].currency, coin.symbol);

            trade = result.trades[1];
            assert.equal(trade.tradeType, TradeType.BUY);
            assert.equal(allTx[trade.in.toString()].externalId, 'ABC0123');
            assert.equal(allTx[trade.in.toString()].date.toISOString(), '2000-02-01T09:00:06.000Z');
            assert.equal(allTx[trade.in.toString()].from, '_COMPENSATION_FIAT_rainu');
            assert.equal(allTx[trade.in.toString()].amount, 27303);
            assert.equal(allTx[trade.in.toString()].fee,      137);
            assert.equal(allTx[trade.in.toString()].currency, 'EUR');
            assert.equal(allTx[trade.out.toString()].externalId, 'ABC0123');
            assert.equal(allTx[trade.out.toString()].date.toISOString(), '2000-02-01T09:00:06.000Z');
            assert.equal(allTx[trade.out.toString()].to, '_EXCHANGE_bitcoin_de_rainu');
            assert.equal(allTx[trade.out.toString()].amount, 99000000 * coin.coinFactor);
            assert.equal(allTx[trade.out.toString()].fee,     1000000 * coin.coinFactor);
            assert.equal(allTx[trade.out.toString()].currency, coin.symbol);

            trade = result.trades[2];
            assert.equal(trade.tradeType, TradeType.SELL);
            assert.equal(allTx[trade.in.toString()].externalId, 'ABC456');
            assert.equal(allTx[trade.in.toString()].date.toISOString(), '2000-03-01T22:12:02.000Z');
            assert.equal(allTx[trade.in.toString()].from, '_EXCHANGE_bitcoin_de_rainu');
            assert.equal(allTx[trade.in.toString()].amount, 98109000 * coin.coinFactor);
            assert.equal(allTx[trade.in.toString()].fee,      991000 * coin.coinFactor);
            assert.equal(allTx[trade.in.toString()].currency, coin.symbol);
            assert.equal(allTx[trade.out.toString()].externalId, 'ABC456');
            assert.equal(allTx[trade.out.toString()].date.toISOString(), '2000-03-01T22:12:02.000Z');
            assert.equal(allTx[trade.out.toString()].to, '_COMPENSATION_FIAT_rainu');
            assert.equal(allTx[trade.out.toString()].amount, 36484);
            assert.equal(allTx[trade.out.toString()].fee,      183);
            assert.equal(allTx[trade.out.toString()].currency, 'EUR');

            trade = result.trades[3];
            assert.equal(trade.tradeType, TradeType.GIFT);
            assert.equal(allTx[trade.in.toString()].date.toISOString(), '2000-04-01T02:05:03.000Z');
            assert.equal(allTx[trade.in.toString()].from, '_COMPENSATION_FIAT_rainu');
            assert.equal(allTx[trade.in.toString()].amount, 0);
            assert.equal(allTx[trade.in.toString()].fee,    0);
            assert.equal(allTx[trade.in.toString()].currency, 'EUR');
            assert.equal(allTx[trade.out.toString()].date.toISOString(), '2000-04-01T02:05:03.000Z');
            assert.equal(allTx[trade.out.toString()].to, '_EXCHANGE_bitcoin_de_rainu');
            assert.equal(allTx[trade.out.toString()].amount, 11973 * coin.coinFactor);
            assert.equal(allTx[trade.out.toString()].fee,        0);
            assert.equal(allTx[trade.out.toString()].currency, coin.symbol);

            let inTransferFound = false;
            let outTransferFound = false;
            let feeFound = false;
            for(let txId of Object.keys(allTx)){
              //summer-time - two hour different to utc
              if(allTx[txId].date.toISOString() === '2000-04-02T18:02:52.000Z'){
                //transfer
                assert.equal(allTx[txId].externalId, '9aac178439998a3ab1857287a41a03b4d3645c262bb3a9489955f735dfb8703b');
                assert.equal(allTx[txId].from, '_EXCHANGE_bitcoin_de_rainu');
                assert.equal(allTx[txId].amount, 15716112 * coin.coinFactor);
                assert.equal(allTx[txId].fee,           0);
                assert.equal(allTx[txId].currency, coin.symbol);

                inTransferFound = true;
              }else if(allTx[txId].date.toISOString() === '2000-05-01T14:22:04.000Z'){
                //transfer
                assert.equal(allTx[txId].externalId, '29a62d86060f4df06ad700858a9b1966c4138652f9719c49123eb5a75add2483');
                assert.equal(allTx[txId].to, '_EXCHANGE_bitcoin_de_rainu');
                assert.equal(allTx[txId].amount, 198382594 * coin.coinFactor);
                assert.equal(allTx[txId].fee,            0);
                assert.equal(allTx[txId].currency, coin.symbol);

                outTransferFound = true;
              }else if(allTx[txId].date.toISOString() === '2000-04-03T18:02:52.000Z'){
                //network fee
                assert.equal(allTx[txId].externalId, '9aac178439998a3ab1857287a41a03b4d3645c262bb3a9489955f735dfb8703b');
                assert.equal(allTx[txId].from, '_EXCHANGE_bitcoin_de_rainu');
                assert.equal(allTx[txId].amount, 35098 * coin.coinFactor);
                assert.equal(allTx[txId].fee,        0);
                assert.equal(allTx[txId].currency, coin.symbol);

                feeFound = true;
              }
            }

            assert(inTransferFound);
            assert(outTransferFound);
            assert(feeFound);
            done();
          }, (err) => {
            assert.fail();
            done();
          });
        });
    });
  }
});