const assert = require('assert');
const taxReport = require('../../src/report/tax_report');

describe('FIFO tax report', () => {

  const tx = (date, amount, fee, ratio) => {
    return {
      date: new Date(date),
      amount: amount,
      fee: fee,
      exchangeRatio: ratio
    }
  };

  const sale = (amount, buyDate, buyPrice, sellDate, sellPrice, profit, short) => {
    return {
      amount: amount,
      buyDate: new Date(buyDate),
      buyPrice: buyPrice,
      sellDate: new Date(sellDate),
      sellPrice: sellPrice,
      profit: profit,
      short: short,
    }
  };

  let cases = {
    "short: one buy satisfy one sell": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
        ],
        out: [
          tx('2000-06-01', 0.5, 0.01, 200),
        ],
      },
      expected: [
        sale(0.5, '2000-01-01', 50, '2000-06-01', 100, 50, true),
      ]
    },
    "short: one buy satisfy multiple sells": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
        ],
        out: [
          tx('2000-06-01', 0.5, 0.01, 200),
          tx('2000-06-02', 0.25, 0.01, 200),
        ],
      },
      expected: [
        sale(0.5, '2000-01-01', 50, '2000-06-01', 100, 50, true),
        sale(0.25, '2000-01-01', 25, '2000-06-02', 50, 25, true),
      ]
    },

    "long: one buy satisfy one sell": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
        ],
        out: [
          tx('2001-01-02', 0.5, 0.01, 200),
        ],
      },
      expected: [
        sale(0.5, '2000-01-01', 50, '2001-01-02', 100, 50, false),
      ]
    },
    "long: one buy satisfy multiple sells": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
        ],
        out: [
          tx('2001-01-02', 0.5, 0.01, 200),
          tx('2001-01-03', 0.25, 0.01, 200),
        ],
      },
      expected: [
        sale(0.5, '2000-01-01', 50, '2001-01-02', 100, 50, false),
        sale(0.25, '2000-01-01', 25, '2001-01-03', 50, 25, false),
      ]
    },

    "short: two buys satisfy one sell": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
          tx('2000-01-01', 1, 0.01, 100),
        ],
        out: [
          tx('2000-01-02', 1.5, 0.01, 200),
        ],
      },
      expected: [
        sale(1, '2000-01-01', 100, '2000-01-02', 200, 100, true),
        sale(0.5, '2000-01-01', 50, '2000-01-02', 100, 50, true),
      ]
    },
    "long: two buys satisfy one sell": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
          tx('2000-01-01', 1, 0.01, 100),
        ],
        out: [
          tx('2001-01-02', 1.5, 0.01, 200),
        ],
      },
      expected: [
        sale(1, '2000-01-01', 100, '2001-01-02', 200, 100, false),
        sale(0.5, '2000-01-01', 50, '2001-01-02', 100, 50, false),
      ]
    },

    "short: two buys satisfy two sells": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
          tx('2000-01-02', 1, 0.01, 100),
        ],
        out: [
          tx('2000-01-02', 1, 0.01, 200),
          tx('2000-01-03', 1, 0.01, 200),
        ],
      },
      expected: [
        sale(1, '2000-01-01', 100, '2000-01-02', 200, 100, true),
        sale(1, '2000-01-02', 100, '2000-01-03', 200, 100, true),
      ]
    },
    "long: two buys satisfy two sells": {
      tx: {
        in: [
          tx('2000-01-01', 1, 0.01, 100),
          tx('2000-01-02', 1, 0.01, 100),
        ],
        out: [
          tx('2001-01-02', 1, 0.01, 200),
          tx('2001-01-03', 1, 0.01, 200),
        ],
      },
      expected: [
        sale(1, '2000-01-01', 100, '2001-01-02', 200, 100, false),
        sale(1, '2000-01-02', 100, '2001-01-03', 200, 100, false),
      ]
    },
  };

  for(let curCaseName in cases) {
    it(curCaseName, () => {
        const curCase = cases[curCaseName];
        let report = taxReport(curCase.tx.in, curCase.tx.out);

        assert.equal(curCase.expected.length, report.length);
        for(let i = 0; i < report.length; i++) {
          assert.equal(curCase.expected[i].amount, report[i].amount);
          assert.equal(curCase.expected[i].buyDate.toISOString(), report[i].buyDate.toISOString());
          assert.equal(curCase.expected[i].buyPrice, report[i].buyPrice);
          assert.equal(curCase.expected[i].sellDate.toISOString(), report[i].sellDate.toISOString());
          assert.equal(curCase.expected[i].sellPrice, report[i].sellPrice);
          assert.equal(curCase.expected[i].profit, report[i].profit);
          assert.equal(curCase.expected[i].short, report[i].short);
        }
    });
  }
});