import axios from './../backend.js';

const getCourse = (coin, currency, callback) => {
  const symbol = coin.toUpperCase() + currency.toUpperCase();

  axios.get(`/course/ticker/${symbol}`).then(res => callback(res.data));
};

const getHistoricalCourse = (coin, currency, callback) => {
  const symbol = coin.toUpperCase() + currency.toUpperCase();

  axios.get(`/course/historical/${symbol}`).then(res => callback(res.data));
};

export {
  getCourse, getHistoricalCourse,
}