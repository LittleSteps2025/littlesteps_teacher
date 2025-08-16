// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.147.157:5001',
  // BASE_URL: "http://10.22.161.89:5001" ,            // Replace with your server URL
  ENDPOINTS: {
    PARENT_LOGIN: '/api/parent/parent-login',
    USER_ROUTES: '/api/users', // if you have user-related routes
  }
};

// Helper function to make API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
