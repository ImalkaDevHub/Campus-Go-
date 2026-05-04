
// STEP 1: Find your IPv4 Address by running 'ipconfig' in CMD
// STEP 2: Make sure Windows Firewall allows port 8080
// STEP 3: Replace the IP below with your current IPv4
const DEV_IP = '192.168.1.23'; 

export const API_BASE_URL = `http://${DEV_IP}:8080/api`;

console.log('[CONFIG] API URL:', API_BASE_URL);

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
