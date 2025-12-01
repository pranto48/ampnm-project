import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { hostsApi, servicesApi } from '../lib/api';
import { CheckType, DeviceType } from '../types/monitoring';

interface AddHostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ServiceInput {
  name: string;
  check_type: CheckType;
  check_interval: number;
  description: string;
}

export default function AddHostModal({ onClose, onSuccess }: AddHostModalProps) {
  const [hostName, setHostName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [description, setDescription] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('server');
  const [services, setServices] = useState<ServiceInput[]>([
    { name: 'PING', check_type: 'ping', check_interval: 60, description: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addService = () => {
    setServices([...services, { name: '', check_type: 'http', check_interval: 60, description: '' }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceInput, value: string | number) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const hostRes = await hostsApi.create({
        name: hostName,
        ip_address: ipAddress,
        description: description || null,
        device_type: deviceType
      });

      const hostId = hostRes.data.id;

      if (services.length > 0) {
        await Promise.all(
          services.map(service =>
            servicesApi.create({
              host_id: hostId,
              name: service.name,
              check_type: service.check_type,
              check_interval: service.check_interval,
              description: service.description || null
            })
          )
        );
      }

      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorWithResponse = err as { response?: { data?: { error?: string } }; message?: string };
        setError(errorWithResponse.response?.data?.error || errorWithResponse.message || 'Failed to add host');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add host');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add New Host</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Host Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Host Name *
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="web-server-01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Address / Hostname *
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="192.168.1.100 or example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Type
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="server">Server</option>
                <option value="switch">Switch</option>
                <option value="router">Router</option>
                <option value="firewall">Firewall</option>
                <option value="docker">Docker / Container</option>
                <option value="cloud">Cloud Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Production web server"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Services to Monitor</h3>
              <button
                type="button"
                onClick={addService}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            {services.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Service {index + 1}</h4>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="HTTP"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Check Type
                    </label>
                    <select
                      value={service.check_type}
                      onChange={(e) => updateService(index, 'check_type', e.target.value as CheckType)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ping">PING</option>
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="tcp">TCP</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Check Interval (seconds)
                    </label>
                    <input
                      type="number"
                      value={service.check_interval}
                      onChange={(e) => updateService(index, 'check_interval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Host'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
