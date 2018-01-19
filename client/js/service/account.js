import axios from './../backend.js';

const getAccount = (accountname, callback) => {
  axios.get(`/account/${accountname}`).then(res => callback(res.data));
};

export default getAccount;