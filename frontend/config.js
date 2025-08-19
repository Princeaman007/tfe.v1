// config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000'
  },
  production: {
    API_BASE_URL: 'https://tfe-v1.onrender.com'  // Remplacez par votre vraie URL
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;