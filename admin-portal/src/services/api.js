import axios from 'axios';

// Simple in-memory cache for API requests
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Create an axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Make sure this matches your Spring Boot port
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add cache support for GET requests
        if (config.method === 'get' && config.cache !== false) {
            const cacheKey = config.url + JSON.stringify(config.params || {});
            const cached = cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                config.adapter = () => Promise.resolve({
                    data: cached.data,
                    status: 200,
                    statusText: 'OK (cached)',
                    headers: {},
                    config,
                });
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for caching
api.interceptors.response.use(
    (response) => {
        // Cache GET requests
        if (response.config.method === 'get' && response.config.cache !== false) {
            const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
            cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Function to clear cache
export const clearCache = () => {
    cache.clear();
};

// THIS WAS MISSING: The default export
export default api;
