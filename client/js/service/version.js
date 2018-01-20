import axios from './../backend.js';

const getVersion = (callback) => {
  axios.get(`/version`).then(res => callback(res.data));
};

export {
  getVersion,
};