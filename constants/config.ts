import { Platform } from 'react-native';

// Production URL (Main Deployment)
export const API_BASE_URL = 'https://csbm-university-management-system.onrender.com/api';

// Local URL (Disabled)
// const LOCAL_IP = '192.168.1.23'; 
// export const API_BASE_URL = Platform.OS === 'web' 
//   ? 'http://localhost:8080/api' 
//   : `http://${LOCAL_IP}:8080/api`;

console.log('[CONFIG] API URL:', API_BASE_URL);

export default API_BASE_URL;
