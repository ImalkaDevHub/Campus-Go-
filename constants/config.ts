// Use your local IP address so physical devices can connect to the local server
export const API_BASE_URL = 'http://192.168.1.102:8080/api';

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
