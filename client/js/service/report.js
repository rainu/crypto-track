const getReport = (accountname, callback) => {
  $.ajax({
    url: `/api/report/${accountname}`,
  }).then((data) => {
    for (let entry of data) {
      entry.sellDate = moment(entry.sellDate);
      entry.buyDate = moment(entry.buyDate);

      callback(entry);
    }
  });
};

const getAccount = (accountname, callback) => {
  $.ajax({
    url: `/api/account/${accountname}`,
  }).then((account) => {
    callback(account);
  });
};

const getFullWallet = (id, callback) => {
  $.ajax({
    url: `/api/wallet/${wallet._id}/full`,
  }).then((fullWallet) => {
    callback(fullWallet);
  });
};

export {
  getReport, getAccount, getFullWallet,
}