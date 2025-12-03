import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const hostsApi = {
  getAll: () => api.get('/hosts'),
  create: (data: any) => api.post('/hosts', data),
  delete: (id: string) => api.delete(`/hosts/${id}`),
};

export const servicesApi = {
  getAll: () => api.get('/services'),
  create: (data: any) => api.post('/services', data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

export const alertsApi = {
  getAll: (acknowledged = false) => api.get(`/alerts?acknowledged=${acknowledged}`),
  acknowledge: (id: string) => api.put(`/alerts/${id}/acknowledge`),
};

export const monitoringApi = {
  getHistory: (serviceId: string) => api.get(`/monitoring-history/${serviceId}`),
  runCheck: () => api.post('/monitor/run'),
};

export const licenseApi = {
  activate: (licenseKey: string, machineId: string) =>
    api.post('/license/activate', { license_key: licenseKey, machine_id: machineId }),
  getStatus: () => api.get('/license/status'),
};

export const systemApi = {
  getInfo: () => api.get('/system/info'),
};

export const windowsAgentApi = {
  getLatestMetrics: (staleMinutes = 15) =>
    api.get(`/windows-metrics/latest?staleMinutes=${staleMinutes}`),
};

export default api;
