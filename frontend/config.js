const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000'
  },
  production: {
    API_BASE_URL: 'https://tfe-v1.onrender.com'
  }
};

// Forcer production sur Render
const environment = import.meta.env.PROD || import.meta.env.MODE === 'production' || window.location.hostname.includes('onrender.com') 
  ? 'production' 
  : 'development';

export const API_BASE_URL = config[environment].API_BASE_URL;