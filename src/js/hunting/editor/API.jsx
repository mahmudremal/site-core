import axios from 'axios';

const api = axios.create({
  baseURL: 'https://core.agency.local/wp-json/sitecore/v1/',
});

export default api;
