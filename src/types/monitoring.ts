export type HostStatus = 'up' | 'down' | 'warning' | 'unknown';
export type ServiceStatus = 'ok' | 'warning' | 'critical' | 'unknown';
export type CheckType = 'ping' | 'http' | 'https' | 'tcp' | 'custom';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type DeviceType = 'server' | 'switch' | 'router' | 'firewall' | 'docker' | 'cloud';

export interface Host {
  id: string;
  name: string;
  ip_address: string;
  description?: string;
  device_type?: DeviceType;
  status: HostStatus;
  last_check?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  host_id: string;
  name: string;
  description?: string;
  check_type: CheckType;
  check_interval: number;
  status: ServiceStatus;
  last_check?: string;
  last_status_change?: string;
  response_time?: number;
  created_at: string;
  updated_at: string;
}

export interface MonitoringHistory {
  id: string;
  service_id: string;
  status: ServiceStatus;
  response_time?: number;
  message?: string;
  checked_at: string;
}

export interface Alert {
  id: string;
  service_id: string;
  severity: AlertSeverity;
  message: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  created_at: string;
}

export interface HostWithServices extends Host {
  services: Service[];
}
