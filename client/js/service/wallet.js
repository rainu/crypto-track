const getTxMappings = (wallet) => {
  let coinMapping = {};
  let knownIds = {};

  for(let tx of wallet.transactions){
    if(knownIds[tx._id]) continue;
    else knownIds[tx._id] = true;

    if(!coinMapping.hasOwnProperty(tx.currency)) {
      coinMapping[tx.currency] = [];
    }
    coinMapping[tx.currency].push(tx);
  }

  return coinMapping;
};

const getBalances = (wallet) => {
  let balances = {};
  const txMapping = getTxMappings(wallet);

  for(let coin of Object.keys(txMapping)) {
    let coinTx = txMapping[coin];
    balances[coin] = 0;

    for(let tx of coinTx) {
      if(wallet.address === tx.from) {
        balances[coin] -= tx.amount;
        balances[coin] -= tx.fee ? tx.fee : 0;
      }else {
        balances[coin] += tx.amount;
      }
    }
  }

  return balances;
};

const getCoins = (wallet) => {
  let symbols = [];
  for(let coin of Object.keys(wallet.balances)) {
    if(coin.toUpperCase() === 'EUR') continue;

    symbols.push(coin);
  }
  return symbols;
};

const getFullWallet = (id, callback) => {
  $.ajax({
    url: `/api/wallet/${id}/full`,
  }).then((fullWallet) => {
    fullWallet.balances = getBalances(fullWallet);
    fullWallet.coins = getCoins(fullWallet);

    callback(fullWallet);
  });
};

export {
  getFullWallet,
}