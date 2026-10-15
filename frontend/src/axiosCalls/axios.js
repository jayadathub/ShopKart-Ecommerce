import axios from 'axios';

// Axios instance preconfigured with base backend URL and credentials support for cookies
const axiosInstance = axios.create({
   baseURL: 'http://localhost:8082',
   withCredentials: true,
   headers: {
     "Content-Type": "application/json"
   }
});

export default axiosInstance;