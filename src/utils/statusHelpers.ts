import { HostStatus, ServiceStatus, AlertSeverity } from '../types/monitoring';

export const getStatusColor = (status: HostStatus | ServiceStatus): string => {
  switch (status) {
    case 'up':
    case 'ok':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'down':
    case 'critical':
      return 'bg-red-500';
    case 'unknown':
    default:
      return 'bg-gray-500';
  }
};

export const getStatusTextColor = (status: HostStatus | ServiceStatus): string => {
  switch (status) {
    case 'up':
    case 'ok':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'down':
    case 'critical':
      return 'text-red-600';
    case 'unknown':
    default:
      return 'text-gray-600';
  }
};

export const getAlertColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 border-red-500 text-red-800';
    case 'warning':
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    case 'info':
    default:
      return 'bg-blue-100 border-blue-500 text-blue-800';
  }
};

export const formatResponseTime = (ms?: number): string => {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatLastCheck = (timestamp?: string): string => {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
};
