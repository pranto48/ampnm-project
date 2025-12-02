export type HostStatus = 'up' | 'down' | 'warning' | 'unknown';
export type ServiceStatus = 'ok' | 'warning' | 'critical' | 'unknown';
export type CheckType = 'ping' | 'http' | 'https' | 'tcp' | 'custom';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type DeviceType = 'server' | 'switch' | 'router' | 'firewall' | 'docker' | 'cloud';

export interface WindowsMetricSummary {
  host_name: string;
  host_ip?: string | null;
  cpu_percent?: number | null;
  memory_percent?: number | null;
  disk_free_gb?: number | null;
  disk_total_gb?: number | null;
  network_in_mbps?: number | null;
  network_out_mbps?: number | null;
  gpu_percent?: number | null;
  created_at: string;
  stale?: boolean;
}

export interface Host {
  id: string;
  name: string;
  ip_address: string;
  description?: string;
  device_type?: DeviceType;
  api_username?: string;
  api_password?: string;
  api_port?: number;
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
  windows_metric?: WindowsMetricSummary;
}
