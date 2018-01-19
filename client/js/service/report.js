import axios from './../backend.js';

const getReport = (accountname, callback) => {
  axios.get(`/report/${accountname}`).then(res => {
    for (let entry of res.data) {
      entry.sellDate = moment(entry.sellDate);
      entry.buyDate = moment(entry.buyDate);

      callback(entry);
    }
  });
};

export default getReport;