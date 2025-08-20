import '../styles/globals.css';
import { useEffect } from 'react';
import axios from 'axios';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Set up axios defaults
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Set up axios interceptors for authentication
    axios.interceptors.request.use(
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
    
    // Handle 401 responses (unauthorized)
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }, []);
  
  return <Component {...pageProps} />;
}

export default MyApp;

