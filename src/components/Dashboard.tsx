import { useState, useEffect } from 'react';
import { Activity, Server, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { hostsApi, servicesApi, alertsApi, monitoringApi } from '../lib/api';
import { Host, Service, Alert } from '../types/monitoring';
import HostList from './HostList';
import AlertPanel from './AlertPanel';
import StatsCard from './StatsCard';

export default function Dashboard() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [hostsRes, servicesRes, alertsRes] = await Promise.all([
        hostsApi.getAll(),
        servicesApi.getAll(),
        alertsApi.getAll(false)
      ]);

      setHosts(hostsRes.data);
      setServices(servicesRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await monitoringApi.runCheck();
      await fetchData();
    } catch (error) {
      console.error('Error running manual check:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const stats = {
    totalHosts: hosts.length,
    hostsUp: hosts.filter(h => h.status === 'up').length,
    hostsDown: hosts.filter(h => h.status === 'down').length,
    totalServices: services.length,
    servicesOk: services.filter(s => s.status === 'ok').length,
    servicesCritical: services.filter(s => s.status === 'critical').length,
    servicesWarning: services.filter(s => s.status === 'warning').length,
    activeAlerts: alerts.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Activity className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Network Monitor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Checking...' : 'Check Now'}</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Live Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Hosts"
            value={stats.totalHosts}
            icon={Server}
            subtitle={`${stats.hostsUp} up, ${stats.hostsDown} down`}
            color="blue"
          />
          <StatsCard
            title="Healthy Services"
            value={stats.servicesOk}
            icon={CheckCircle}
            subtitle={`of ${stats.totalServices} total`}
            color="green"
          />
          <StatsCard
            title="Critical Issues"
            value={stats.servicesCritical}
            icon={AlertTriangle}
            subtitle={`${stats.servicesWarning} warnings`}
            color="red"
          />
          <StatsCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon={AlertTriangle}
            subtitle="Needs attention"
            color="yellow"
          />
        </div>

        {alerts.length > 0 && (
          <div className="mb-8">
            <AlertPanel alerts={alerts} onAcknowledge={fetchData} />
          </div>
        )}

        <HostList hosts={hosts} services={services} onUpdate={fetchData} />
      </main>
    </div>
  );
}
