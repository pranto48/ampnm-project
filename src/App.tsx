import { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import Dashboard from './components/Dashboard';
import NetworkTopology from './components/NetworkTopology';
import { hostsApi, servicesApi, licenseApi, windowsAgentApi } from './lib/api';
import { Host, Service, HostWithServices, WindowsMetricSummary } from './types/monitoring';

const LICENSE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

interface LicenseStatus {
  activated: boolean;
  customer_name?: string;
  max_hosts?: number;
  expiry_date?: string;
  expired?: boolean;
  status?: string;
  checked_at: string;
}

const LICENSE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

interface LicenseStatus {
  activated: boolean;
  customer_name?: string;
  max_hosts?: number;
  expiry_date?: string;
  expired?: boolean;
  status?: string;
  checked_at: string;
}

function App() {
  const [view, setView] = useState<'dashboard' | 'topology'>('dashboard');
  const [hostsWithServices, setHostsWithServices] = useState<HostWithServices[]>([]);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);

  useEffect(() => {
    if (view === 'topology') {
      fetchHostsWithServices();
    }
  }, [view]);

  useEffect(() => {
    const checkLicense = async () => {
      try {
        const response = await licenseApi.getStatus();
        setLicenseStatus({ ...response.data, checked_at: new Date().toISOString() });
      } catch (error) {
        console.error('Error checking license status:', error);
        setLicenseStatus({ activated: false, expired: false, checked_at: new Date().toISOString() });
      }
    };

    checkLicense();
    const interval = setInterval(checkLicense, LICENSE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const fetchHostsWithServices = async () => {
    try {
      const [hostsRes, servicesRes, windowsMetricsRes] = await Promise.all([
        hostsApi.getAll(),
        servicesApi.getAll(),
        windowsAgentApi.getLatestMetrics().catch(() => ({ data: [] })),
      ]);

      const windowsMetrics: WindowsMetricSummary[] = windowsMetricsRes?.data || [];
      const metricsByName = new Map(
        windowsMetrics
          .filter((metric) => metric.host_name)
          .map((metric) => [metric.host_name.toLowerCase(), metric])
      );
      const metricsByIp = new Map(
        windowsMetrics
          .filter((metric) => metric.host_ip)
          .map((metric) => [String(metric.host_ip), metric])
      );

      if (hostsRes.data && servicesRes.data) {
        const matchedMetrics = new Set<string>();

        const hostsWithServicesData: HostWithServices[] = hostsRes.data.map((host: Host) => {
          const normalizedName = host.name.toLowerCase();
          const metricMatch =
            metricsByName.get(normalizedName) || (host.ip_address && metricsByIp.get(host.ip_address));

          if (metricMatch) {
            matchedMetrics.add(metricMatch.host_name.toLowerCase());
          }

          const servicesForHost = servicesRes.data.filter(
            (service: Service) => service.host_id === host.id
          );

          const statusFromMetrics: Host['status'] | undefined = metricMatch
            ? metricMatch.stale
              ? 'warning'
              : 'up'
            : undefined;

          return {
            ...host,
            status: statusFromMetrics || host.status,
            services: servicesForHost,
            windows_metric: metricMatch,
          };
        });

        const virtualHosts: HostWithServices[] = windowsMetrics
          .filter((metric) => metric.host_name && !matchedMetrics.has(metric.host_name.toLowerCase()))
          .map((metric) => {
            const created = metric.created_at || new Date().toISOString();
            const status: Host['status'] = metric.stale ? 'warning' : 'up';

            return {
              id: `agent-${metric.host_name}`,
              name: metric.host_name,
              ip_address: metric.host_ip || 'N/A',
              description: 'Windows agent (virtual host)',
              device_type: 'server',
              status,
              last_check: metric.created_at,
              created_at: created,
              updated_at: created,
              services: [],
              windows_metric: metric,
            };
          });

        setHostsWithServices([...hostsWithServicesData, ...virtualHosts]);
      }
    } catch (error) {
      console.error('Error fetching hosts with services:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 py-3">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('topology')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'topology'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Topology</span>
            </button>
          </div>
        </div>
      </nav>

      {licenseStatus && (
        <div
          className={`border-b ${
            licenseStatus.activated && !licenseStatus.expired
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm flex items-center justify-between">
            <div>
              {licenseStatus.activated ? (
                <span>
                  License {licenseStatus.expired ? 'expired' : 'active'}
                  {licenseStatus.customer_name ? ` · ${licenseStatus.customer_name}` : ''}
                  {licenseStatus.max_hosts ? ` · ${licenseStatus.max_hosts} hosts` : ''}
                  {licenseStatus.expiry_date ? ` · Expires ${licenseStatus.expiry_date}` : ''}
                </span>
              ) : (
                <span>License is not activated</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Last checked {new Date(licenseStatus.checked_at).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {view === 'dashboard' ? (
        <Dashboard />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NetworkTopology hosts={hostsWithServices} />
        </div>
      )}
    </div>
  );
}

export default App;
