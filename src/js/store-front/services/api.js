import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://core.agency.local/wp-json/sitecore/v1/ecommerce',
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('x-visitor-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;