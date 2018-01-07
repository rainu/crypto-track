"use strict";

const log = require('../log');
const parse = require('csv-parse');
const moment = require('moment');
const Transaction = require('../model/transaction');
const Trade = require('../model/trade');
const TradeType = require('../model/trade_type');

const DATE = 'Datum';
const TYPE = 'Typ';
const CURRENCY = 'Währungen';
const REFERENCE = 'Referenz';
const COURSE = 'Kurs';
const AMOUNT = 'Zu- / Abgang';
const EUR_AFTER_FEE = "EUR nach Gebühr";
const EUR_BEFORE_FEE = "EUR vor Gebühr";


const COIN_AFTER_FEE = "_COIN_ nach Gebühr";
const COIN_BEFORE_FEE = "_COIN_ vor Gebühr";
const BTC_AFTER_FEE = "BTC nach Gebühr";
const BTC_BEFORE_FEE = "BTC vor Gebühr";
const BCH_AFTER_FEE = "BCH nach Gebühr";
const BCH_BEFORE_FEE = "BCH vor Gebühr";
const ETH_AFTER_FEE = "ETH nach Gebühr";
const ETH_BEFORE_FEE = "ETH vor Gebühr";

const TYPE_BUY = 'Kauf';
const TYPE_SELL = 'Verkauf';
const TYPE_OUT_TRANSFER = 'Auszahlung';
const TYPE_IN_TRANSFER = 'Einzahlung';
const TYPE_NETWORK_FEE = 'Netzwerk-Gebühr';

const fiat = (amount) => {
  return Math.round(amount * 100); //change euro to cent
};

const btc = (amount) => {
  return Math.round(amount * 100000000); //change bitcoin to satoshi
};

const eth = (amount) => {
  return Math.round(amount * 1000000000000000000); //change ethereum to Wei
};

const normalize = (record) => {
  //bitcoin.de saves the date in german date zone

  //so in winter-time we are +1 hour different to utc
  let date = moment(record[DATE] + ' +0100', "YYYY-MM-DD HH:mm:ss Z");
  if(date.isDST()) {
    //but in summer-time we are +2 hour different to utc
    date = moment(record[DATE] + ' +0200', "YYYY-MM-DD HH:mm:ss Z");
  }

  record[DATE] = date.toString();
  record[AMOUNT] = Math.abs(record[AMOUNT]);
  record[EUR_AFTER_FEE] = fiat(record[EUR_AFTER_FEE]);
  record[EUR_BEFORE_FEE] = fiat(record[EUR_BEFORE_FEE]);
  let amount = 0;

  //each coin have a different column-name
  //and each coin have a different exchange ratio
  if(record.hasOwnProperty(BTC_AFTER_FEE)){
    record[COIN_AFTER_FEE] = btc(record[BTC_AFTER_FEE]);
    amount = btc(record[AMOUNT]);
  }
  if(record.hasOwnProperty(BTC_BEFORE_FEE)) {
    record[COIN_BEFORE_FEE] = btc(record[BTC_BEFORE_FEE]);
    amount = btc(record[AMOUNT]);
  }
  if(record.hasOwnProperty(BCH_AFTER_FEE)) {
    record[COIN_AFTER_FEE] = btc(record[BCH_AFTER_FEE]);
    amount = btc(record[AMOUNT]);
  }
  if(record.hasOwnProperty(BCH_BEFORE_FEE)) {
    record[COIN_BEFORE_FEE] = btc(record[BCH_BEFORE_FEE]);
    amount = btc(record[AMOUNT]);
  }
  if(record.hasOwnProperty(ETH_AFTER_FEE)) {
    record[COIN_AFTER_FEE] = eth(record[ETH_AFTER_FEE]);
    amount = eth(record[AMOUNT]);
  }
  if(record.hasOwnProperty(ETH_BEFORE_FEE)) {
    record[COIN_BEFORE_FEE] = eth(record[ETH_BEFORE_FEE]);
    amount = eth(record[AMOUNT]);
  }

  record[AMOUNT] = amount;

  return record;
};

const addBuy = (fiatAddress, importAddress, record) => {
  let inTx = new Transaction({
    externalId: record[REFERENCE],
    from: fiatAddress,
    date: record[DATE],
    amount: record[EUR_AFTER_FEE],
    fee: record[EUR_BEFORE_FEE] - record[EUR_AFTER_FEE],
    currency: record[CURRENCY].split('/')[1].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let outTx = new Transaction({
    externalId: record[REFERENCE],
    to: importAddress,
    date: record[DATE],
    amount: record[COIN_AFTER_FEE],
    fee: record[COIN_BEFORE_FEE] - record[COIN_AFTER_FEE],
    currency: record[CURRENCY].split('/')[0].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let trade = new Trade({
    in: inTx,
    out: outTx,
    tradeType: TradeType.BUY,
  });

  return Promise.all([Transaction.insertMany([inTx, outTx]), trade.save()]);
};

const addGift = (fiatAddress, importAddress, record) => {
  let inTx = new Transaction({
    from: fiatAddress,
    date: record[DATE],
    amount: 0,
    fee: 0,
    currency: 'EUR',
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let outTx = new Transaction({
    to: importAddress,
    date: record[DATE],
    amount: record[AMOUNT],
    fee: 0,
    currency: record[CURRENCY].split('/')[0].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let trade = new Trade({
    in: inTx,
    out: outTx,
    tradeType: TradeType.GIFT,
  });

  return Promise.all([Transaction.insertMany([inTx, outTx]), trade.save()]);
};

const addSell = (fiatAddress, importAddress, record) => {
  let inTx = new Transaction({
    externalId: record[REFERENCE],
    from: importAddress,
    date: record[DATE],
    amount: record[COIN_AFTER_FEE],
    fee: record[COIN_BEFORE_FEE] - record[COIN_AFTER_FEE],
    currency: record[CURRENCY].split('/')[0].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let outTx = new Transaction({
    externalId: record[REFERENCE],
    to: fiatAddress,
    date: record[DATE],
    amount: record[EUR_AFTER_FEE],
    fee: record[EUR_BEFORE_FEE] - record[EUR_AFTER_FEE],
    currency: record[CURRENCY].split('/')[1].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let trade = new Trade({
    in: inTx,
    out: outTx,
    tradeType: TradeType.SELL,
  });

  return Promise.all([Transaction.insertMany([inTx, outTx]), trade.save()]);
};

const addLost = (fiatAddress, importAddress, record) => {
  let inTx = new Transaction({
    from: importAddress,
    date: record[DATE],
    amount: record[AMOUNT],
    fee: 0,
    currency: record[CURRENCY].split('/')[0].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let outTx = new Transaction({
    to: fiatAddress,
    date: record[DATE],
    amount: 0,
    fee: 0,
    currency: 'EUR',
    description: 'Bitcoin.de - ' + record[REFERENCE],
  });
  let trade = new Trade({
    in: inTx,
    out: outTx,
    tradeType: TradeType.SELL,
  });

  return Promise.all([Transaction.insertMany([inTx, outTx]), trade.save()]);
};

const addOutTransfer = (importAddress, record) => {
  let outTx = new Transaction({
    externalId: record[REFERENCE],
    from: importAddress,
    date: record[DATE],
    amount: record[AMOUNT],
    fee: 0,
    currency: record[CURRENCY].split('/')[0].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - transfer ' + record[REFERENCE],
  });

  return outTx.save();
};

const addInTransfer = (importAddress, record) => {
  let inTx = new Transaction({
    externalId: record[REFERENCE],
    to: importAddress,
    date: record[DATE],
    amount: record[AMOUNT],
    fee: 0,
    currency: record[CURRENCY].split('/')[0].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - transfer ' + record[REFERENCE],
  });

  return inTx.save();
};

const addNetworkFee = (importAddress, record) => {
  let outTx = new Transaction({
    externalId: record[REFERENCE],
    from: importAddress,
    date: record[DATE],
    amount: record[AMOUNT],
    fee: 0,
    currency: record[CURRENCY].split('/')[0].trim(), // 'BTC / EUR'
    description: 'Bitcoin.de - network fee ' + record[REFERENCE],
  });

  return outTx.save();
};

const parseCsv = (fiatAddress, importAddress, input) => {
  return new Promise((resolve, reject) => {
    const parser = parse({delimiter: ';', auto_parse: true, columns: true, skip_empty_lines: true});
    let promises = [];
    parser.on('readable', () => {
      let record;

      while(record = parser.read()){
        if(record[AMOUNT] === 0) {
          //no amount change: skip these one
          continue;
        }

        normalize(record);

        switch(record[TYPE]){
          case TYPE_BUY:
            promises.push(addBuy(fiatAddress, importAddress, record));
            break;
          case TYPE_SELL:
            promises.push(addSell(fiatAddress, importAddress, record));
            break;
          case TYPE_OUT_TRANSFER:
            promises.push(addOutTransfer(importAddress, record));
            break;
          case TYPE_IN_TRANSFER:
            promises.push(addInTransfer(importAddress, record));
            break;
          case TYPE_NETWORK_FEE:
            promises.push(addNetworkFee(importAddress, record));
            break;
          default:
            if(record[AMOUNT] > 0) {
              promises.push(addGift(fiatAddress, importAddress, record));
            }else{
              promises.push(addLost(fiatAddress, importAddress, record));
            }
            break;
        }
      }
    });

    parser.on('finish', () => {
      //we have to wait for all db inserts
      Promise.all(promises).then(() => {
        resolve();
      }, (err) => {
        reject(err);
      });
    });
    parser.on('error', (err) => {
      log.error('Error while parsing csv!', err);
      reject();
    });

    input.pipe(parser);
  });
};

module.exports = parseCsv;