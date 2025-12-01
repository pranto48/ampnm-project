import { useState } from 'react';
import { Server, Plus, ChevronDown, ChevronRight, Router, Network, Boxes, Shield, Cloud, LucideIcon } from 'lucide-react';
import { Host, Service, DeviceType } from '../types/monitoring';
import { getStatusColor, getStatusTextColor, formatLastCheck, formatResponseTime } from '../utils/statusHelpers';
import AddHostModal from './AddHostModal';

interface HostListProps {
  hosts: Host[];
  services: Service[];
  onUpdate: () => void;
}

export default function HostList({ hosts, services, onUpdate }: HostListProps) {
  const [expandedHosts, setExpandedHosts] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const deviceIcons: Record<DeviceType, LucideIcon> = {
    server: Server,
    switch: Network,
    router: Router,
    firewall: Shield,
    docker: Boxes,
    cloud: Cloud
  };

  const getDeviceIcon = (type?: DeviceType) => deviceIcons[type || 'server'] || Server;

  const toggleHost = (hostId: string) => {
    const newExpanded = new Set(expandedHosts);
    if (newExpanded.has(hostId)) {
      newExpanded.delete(hostId);
    } else {
      newExpanded.add(hostId);
    }
    setExpandedHosts(newExpanded);
  };

  const getHostServices = (hostId: string) => {
    return services.filter(s => s.host_id === hostId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Monitored Hosts</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Host</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {hosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hosts configured yet</p>
            <p className="text-sm">Add your first host to start monitoring</p>
          </div>
        ) : (
          hosts.map((host) => {
            const hostServices = getHostServices(host.id);
            const isExpanded = expandedHosts.has(host.id);
            const DeviceIcon = getDeviceIcon(host.device_type as DeviceType);

            return (
              <div key={host.id} className="hover:bg-gray-50 transition-colors">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleHost(host.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(host.status)}`}></div>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                        <DeviceIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{host.name}</h3>
                          <span className="text-sm text-gray-500">{host.ip_address}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                            {host.device_type || 'server'}
                          </span>
                        </div>
                        {host.description && (
                          <p className="text-sm text-gray-600 mt-1">{host.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-gray-500">Status: </span>
                        <span className={`font-medium ${getStatusTextColor(host.status)}`}>
                          {host.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Services: </span>
                        <span className="font-medium text-gray-900">{hostServices.length}</span>
                      </div>
                      <div className="text-gray-500">
                        {formatLastCheck(host.last_check)}
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && hostServices.length > 0 && (
                  <div className="px-4 pb-4 ml-11">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Services</h4>
                      {hostServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between bg-white rounded p-3 border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              <p className="text-xs text-gray-500">{service.check_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div>
                              <span className={`font-medium ${getStatusTextColor(service.status)}`}>
                                {service.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-gray-500">
                              {formatResponseTime(service.response_time)}
                            </div>
                            <div className="text-gray-500 w-24 text-right">
                              {formatLastCheck(service.last_check)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <AddHostModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
