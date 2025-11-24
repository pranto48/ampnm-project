import { AlertTriangle, Check } from 'lucide-react';
import { Alert } from '../types/monitoring';
import { getAlertColor } from '../utils/statusHelpers';
import { alertsApi } from '../lib/api';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: () => void;
}

export default function AlertPanel({ alerts, onAcknowledge }: AlertPanelProps) {
  const handleAcknowledge = async (alertId: string) => {
    try {
      await alertsApi.acknowledge(alertId);
      onAcknowledge();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
        </div>
        <span className="text-sm text-gray-500">{alerts.length} unacknowledged</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 rounded-r-lg p-4 ${getAlertColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-semibold uppercase">{alert.severity}</span>
                  <span className="text-xs opacity-75">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
              <button
                onClick={() => handleAcknowledge(alert.id)}
                className="ml-4 p-1 hover:bg-white/50 rounded transition-colors"
                title="Acknowledge alert"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
