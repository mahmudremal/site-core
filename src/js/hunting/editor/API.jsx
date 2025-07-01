import axios from 'axios';

export const rest_url = `${window?.siteCoreConfig?.rest_url??`https://${location.host}/wp-json/sitecore/v1`}/`;
const api = axios.create({
  baseURL: rest_url,
});

export default api;
