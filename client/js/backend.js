import axios from 'axios'

import { store } from './store.js';

const instance = axios.create({
  baseURL: '/api/'
});

const HEADER_CALL_ID = "X-Custom-Call-ID";

const reqInterceptor = instance.interceptors.request.use(config => {
  const callId = store.getters['call/nextCallId'];
  config.headers[HEADER_CALL_ID] = callId;

  store.commit('call/startCall', {
    id: callId,
    url: config.url,
  });
  return config;
});

const resInterceptor = instance.interceptors.response.use(res => {
  const callId = res.config.headers[HEADER_CALL_ID];
  store.commit('call/stopCall', { id: callId });

  return res;
}, error => {
  const callId = error.config.headers[HEADER_CALL_ID];
  store.commit('call/stopCall', { id: callId });
});

export default instance