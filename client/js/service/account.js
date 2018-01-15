const getAccount = (accountname, callback) => {
  $.ajax({
    url: `/api/account/${accountname}`,
  }).then((account) => {
    callback(account);
  });
};

export {
   getAccount,
}