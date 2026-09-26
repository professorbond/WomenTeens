import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getTrip = (id) => api.get(`/trips/${id}`);
export const runAudit = (data) => api.post('/audit', data);
export const saveMonitor = (data) => api.post('/monitor', data);
export const checkin = (tripId) => api.post(`/monitor/checkin/${tripId}`);

export default api;
