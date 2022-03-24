import axios from 'axios';
axios.defaults.withCredentials = true;

const request = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000, 
});

export default request;
