import axios from 'axios';

// Setup baseURL
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

export default instance;