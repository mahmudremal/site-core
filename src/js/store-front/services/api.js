import axios from 'axios';
import Cookies from 'js-cookie';
import { site_url } from '@functions';
// import { get, set } from 'idb-keyval';
import { setupCache, buildStorage } from 'axios-cache-interceptor';

// const indexedDbStorage = buildStorage({
//   async find(key) {
//     const value = await get(key);
//     if (!value) return;
//     try {
//       return JSON.parse(value);
//     } catch {
//       return value;
//     }
//   },
//   set: (key, value) => Promise.resolve(set(key, JSON.stringify(value))),
//   remove: (key) => Promise.resolve(del(key)),
// });

const api = setupCache(
  axios.create({
    baseURL: site_url('/wp-json/sitecore/v1/ecommerce'),
  }),
  {
    ttl: 5 * 60 * 1000,
    memoryCache: true,
    // update: 'merge',
    // storage: indexedDbStorage,
    // storage: buildStorage(localStorage),
    debug: console.log, // () => {},
  }
);

// const api = axios.create({baseURL: site_url('/wp-json/sitecore/v1/ecommerce')});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('x-visitor-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
