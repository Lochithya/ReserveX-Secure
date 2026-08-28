import axios from 'axios';

// Create an axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Make sure this matches your Spring Boot port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// THIS WAS MISSING: The default export
export default api;
