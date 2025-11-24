import { useState, useEffect } from 'react';
import { Network } from 'lucide-react';
import Dashboard from './components/Dashboard';
import NetworkTopology from './components/NetworkTopology';
import { hostsApi, servicesApi } from './lib/api';
import { Host, Service, HostWithServices } from './types/monitoring';

function App() {
  const [view, setView] = useState<'dashboard' | 'topology'>('dashboard');
  const [hostsWithServices, setHostsWithServices] = useState<HostWithServices[]>([]);

  useEffect(() => {
    if (view === 'topology') {
      fetchHostsWithServices();
    }
  }, [view]);

  const fetchHostsWithServices = async () => {
    try {
      const [hostsRes, servicesRes] = await Promise.all([
        hostsApi.getAll(),
        servicesApi.getAll()
      ]);

      if (hostsRes.data && servicesRes.data) {
        const hostsWithServicesData: HostWithServices[] = hostsRes.data.map((host: Host) => ({
          ...host,
          services: servicesRes.data.filter((service: Service) => service.host_id === host.id)
        }));
        setHostsWithServices(hostsWithServicesData);
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
