import axios from './../backend.js';

const getCourse = (coin, currency, callback) => {
  const symbol = coin.toUpperCase() + currency.toUpperCase();

  axios.get(`/course/${symbol}`).then(res => callback(res.data));
};

export {
  getCourse,
}