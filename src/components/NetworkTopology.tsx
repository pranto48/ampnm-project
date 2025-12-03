import { useEffect, useState } from 'react';
import { Server, Router, Network, Boxes, Shield, Cloud, LucideIcon, Gauge } from 'lucide-react';
import { HostWithServices, DeviceType } from '../types/monitoring';

interface NetworkTopologyProps {
  hosts: HostWithServices[];
}

const deviceIcons: Record<DeviceType, LucideIcon> = {
  server: Server,
  switch: Network,
  router: Router,
  firewall: Shield,
  docker: Boxes,
  cloud: Cloud
};

const getDeviceIcon = (type?: DeviceType) => deviceIcons[type || 'server'] || Server;

export default function NetworkTopology({ hosts }: NetworkTopologyProps) {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const newPositions = new Map<string, { x: number; y: number}>();
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    hosts.forEach((host, index) => {
      const angle = (index / hosts.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      newPositions.set(host.id, { x, y });
    });

    setPositions(newPositions);
  }, [hosts]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Network Topology</h2>

      <div className="relative bg-gray-50 rounded-lg" style={{ height: '600px' }}>
        <svg width="100%" height="100%" className="absolute inset-0">
          <circle
            cx="50%"
            cy="50%"
            r="8"
            fill="#3B82F6"
            className="drop-shadow-md"
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="-15"
            className="text-xs font-semibold fill-gray-700"
          >
            Network Core
          </text>

          {hosts.map((host) => {
            const pos = positions.get(host.id);
            if (!pos) return null;

            return (
              <g key={host.id}>
                <line
                  x1="50%"
                  y1="50%"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="#D1D5DB"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
              </g>
            );
          })}

          {hosts.map((host) => {
            const pos = positions.get(host.id);
            if (!pos) return null;

            const DeviceIcon = getDeviceIcon(host.device_type as DeviceType);
            const metric = host.windows_metric;

            const statusColors = {
              up: '#10B981',
              down: '#EF4444',
              warning: '#F59E0B',
              unknown: '#6B7280'
            };

            const nodeStatus = metric ? (metric.stale ? 'warning' : 'up') : host.status;

            const formatPercent = (value?: number | null) =>
              typeof value === 'number' ? `${Math.round(value)}%` : '—';

            const formatDisk = (free?: number | null, total?: number | null) => {
              if (typeof free === 'number' && typeof total === 'number') {
                return `${Math.round(free)} / ${Math.round(total)} GB`;
              }
              return '—';
            };

            const formatThroughput = (value?: number | null) => {
              if (typeof value === 'number') {
                return `${Math.round(value)} Mbps`;
              }
              return '—';
            };

            return (
              <g key={host.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="30"
                  fill="white"
                  stroke={statusColors[nodeStatus]}
                  strokeWidth="3"
                  className="drop-shadow-md"
                />
                <foreignObject
                  x={pos.x - 15}
                  y={pos.y - 15}
                  width="30"
                  height="30"
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <DeviceIcon className="w-6 h-6 text-gray-700" />
                  </div>
                </foreignObject>
                <text
                  x={pos.x}
                  y={pos.y + 45}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-900"
                >
                  {host.name}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 58}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {host.ip_address}
                </text>

                {metric && (
                  <>
                    <text
                      x={pos.x}
                      y={pos.y + 71}
                      textAnchor="middle"
                      className="text-[11px] fill-gray-700"
                    >
                      CPU {formatPercent(metric.cpu_percent)} · RAM {formatPercent(metric.memory_percent)}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 84}
                      textAnchor="middle"
                      className="text-[11px] fill-gray-700"
                    >
                      Disk {formatDisk(metric.disk_free_gb, metric.disk_total_gb)} · Net {formatThroughput(metric.network_in_mbps)} / {formatThroughput(metric.network_out_mbps)}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 97}
                      textAnchor="middle"
                      className="text-[11px] fill-gray-600"
                    >
                      {metric.stale ? 'Agent stale' : `Updated ${new Date(metric.created_at).toLocaleTimeString()}`}
                    </text>
                  </>
                )}

                {host.services.map((service, idx) => {
                  const serviceAngle = (idx / host.services.length) * 2 * Math.PI;
                  const serviceRadius = 50;
                  const sx = pos.x + serviceRadius * Math.cos(serviceAngle);
                  const sy = pos.y + serviceRadius * Math.sin(serviceAngle);

                  const serviceColors = {
                    ok: '#10B981',
                    warning: '#F59E0B',
                    critical: '#EF4444',
                    unknown: '#6B7280'
                  };

                  return (
                    <g key={service.id}>
                      <line
                        x1={pos.x}
                        y1={pos.y}
                        x2={sx}
                        y2={sy}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                      <circle
                        cx={sx}
                        cy={sy}
                        r="6"
                        fill={serviceColors[service.status]}
                        className="drop-shadow"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Up / OK</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-600">Warning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">Down / Critical</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span className="text-gray-600">Unknown</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-gray-700" />
          <span>Server</span>
        </div>
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-gray-700" />
          <span>Switch</span>
        </div>
        <div className="flex items-center space-x-2">
          <Router className="w-4 h-4 text-gray-700" />
          <span>Router</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-gray-700" />
          <span>Firewall</span>
        </div>
        <div className="flex items-center space-x-2">
          <Boxes className="w-4 h-4 text-gray-700" />
          <span>Docker</span>
        </div>
        <div className="flex items-center space-x-2">
          <Cloud className="w-4 h-4 text-gray-700" />
          <span>Cloud</span>
        </div>
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-gray-700" />
          <span>Windows agent metrics</span>
        </div>
      </div>
    </div>
  );
}
