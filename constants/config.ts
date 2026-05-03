import { Platform } from 'react-native';

// 1. On your computer, open CMD and type 'ipconfig'. 
// 2. Find your "IPv4 Address" (e.g., 192.168.1.105) and put it here:
const DEV_IP = '192.168.1.102'; 

export const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080/api' 
  : `http://${DEV_IP}:8080/api`;

export const ENDPOINTS = {
  COURSES: `${API_BASE_URL}/courses`,
  AUTH: `${API_BASE_URL}/auth`,
  USER: `${API_BASE_URL}/users/profile`,
  APPLICATIONS: `${API_BASE_URL}/applications`,
  MY_APPLICATIONS: `${API_BASE_URL}/applications/my`,
  APPLICATION_DETAIL: (id: string) => `${API_BASE_URL}/applications/${id}`,
  SCHEDULE: `${API_BASE_URL}/schedule/weekly`,
  ASSIGNMENTS: `${API_BASE_URL}/assignments/upcoming`,
};
