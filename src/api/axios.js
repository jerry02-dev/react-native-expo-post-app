import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.3:8000/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;