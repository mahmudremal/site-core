import { notify } from './functions';
const cacheStore = new Map();
const configStore = new Map();
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;


function request(url, options = {}) {
    const cacheKey = url + JSON.stringify(options);
    const now = Date.now();
    let allowCache = true;

    if (options?.method == 'POST' || options?.['Cache-Control'] == 'no-cache' || options?.['Pragma'] == 'no-cache') {
        allowCache = false;
    }

    // Check cache
    if (allowCache) {
        const cached = cacheStore.get(cacheKey);
        if (cached && now - cached.timestamp < cached.ttl) {
            return Promise.resolve(cached.data);
        }
    }

    // Inject global config headers if needed
    const headers = {
        ...(options.headers || {}),
        ...(
            configStore.has('_nonce') ? {
                'X-Nonce': configStore.get('_nonce')
            } : {}
        ),
    };
    
    if (configStore.has('Authorization')) {
        headers.Authorization = `Bearer ${configStore.get('Authorization')}`;
    }

    const finalOptions = {...options, headers};

    
    // return axios({
    //     method: finalOptions.method || 'get', url,
    //     ...finalOptions, // includes headers, data, etc.
    // })
    // .then(response => {
    //     const data = response.data;
    //     cacheStore.set(cacheKey, {
    //         data, timestamp: now, ttl: options.cacheTTL || DEFAULT_CACHE_TTL,
    //     });
    //     return data;
    // })

    return fetch(url, finalOptions)
    .then(response => {
        if (!response.ok) {
            const error = new Error(`HTTP error ${response.status}`);
            error.response = response;throw error;
        }
        const total = response.headers.get('x-wp-total');
        const totalPages = response.headers.get('x-wp-totalpages');
        return response.json().then(data => (total && totalPages) ? ({list: data, total, totalPages}) : data);
    })
    .then(data => {
        if (allowCache) {
            cacheStore.set(cacheKey, {
                data,
                timestamp: now,
                ttl: options.cacheTTL || DEFAULT_CACHE_TTL,
            });
        }
        return data;
    })
    .catch(async error => {
        const status = error.response?.status;

        if (error.response) {
            switch (status) {
                // case 401:
                //     console.log("Ah it's 401 error", status);
                //     if (request?.setAuth) {
                //         request.setAuth(prev => true);
                //     }
                //     break;
                default:
                    try {
                        const errorBody = await error.response.json();
                        error.response = errorBody;
                        if (errorBody?.code == 'expired_token') {
                            if (request?.setAuth) {request.setAuth(prev => true);}
                        }
                        if (errorBody?.message) {
                            notify.error(ejson.message);
                        }
                        console.log(`Error ${status}:`, errorBody);
                    } catch (err) {
                        try {
                            const errorBody = await error.response.text();
                            error.response = errorBody;
                            if (errorBody?.message) {
                                notify.error(ejson.message);
                            }
                        } catch (err2) {}
                    }
                    throw error;
                    break;
            }
        } else {
            console.log("Network or other error:", error.message);
        }
    });
}
// === Cache API ===
request.cache = {
    clear: () => cacheStore.clear(),
    remove: (key) => {
        for (let k of cacheStore.keys()) {
            if (k.includes(key)) cacheStore.delete(k);
        }
    },
    add: (key, data, ttl = DEFAULT_CACHE_TTL) => {
        cacheStore.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    },
    get: (key) => {
        const cached = cacheStore.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        return null;
    },
};
// === Global Config Setter ===
request.set = (key, value) => {
    configStore.set(key, value);
};
request.getConfig = (key) => configStore.get(key);


request.error_notify = (err, __= t => t) => {
    const error = err?.response?.data?.message??err?.response?.message??err?.message??__('Something went wrong!');
    notify.error(error);// console.log(error);
}


export default request;

// // Set global config (e.g., nonce)
// request.set('_nonce', 'abc123');

// // Make a request (automatically caches it for 30 mins)
// request('https://api.example.com/data')
//     .then(data => console.log(data))
//     .catch(console.error);

// // Clear all cache
// request.cache.clear();

// // Remove specific cache key
// request.cache.remove('https://api.example.com/data');

// // Manually add something to the cache
// request.cache.add('customKey', { foo: 'bar' });

// // Get from cache manually
// const data = request.cache.get('customKey');


