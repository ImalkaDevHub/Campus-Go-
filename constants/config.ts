import { Platform } from 'react-native';

// Local Development (Active for now to fix local testing issues)
const LOCAL_IP = '192.168.1.23'; 
export const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080/api' 
  : `http://${LOCAL_IP}:8080/api`;

// Production URL (Main Deployment - Commented out for local testing)
// export const API_BASE_URL = 'https://csbm-university-management-system.onrender.com/api';

export const ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  COURSES: `${API_BASE_URL}/courses`,
  WORKSHOPS: `${API_BASE_URL}/workshops`,
  APPLICATIONS: `${API_BASE_URL}/applications`,
  ANALYTICS: `${API_BASE_URL}/analytics`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
};

console.log('[CONFIG] API URL:', API_BASE_URL);

export default { API_BASE_URL, ENDPOINTS };
