import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Box,
  Camera,
  Check,
  Cloud,
  Database,
  HardDrive,
  Laptop,
  LucideIcon,
  Phone,
  Plug,
  Printer,
  Radio,
  Router,
  Server,
  ServerRack,
  Shield,
  Smartphone,
  Switch,
  Tablet,
  Wifi,
} from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IconOption {
  value: string;
  label: string;
  Icon: LucideIcon;
  keywords: string[];
  category: string;
}

export interface IconCategory {
  id: string;
  label: string;
  icons: IconOption[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    id: 'connectivity',
    label: 'Connectivity',
    icons: [
      { value: 'router', label: 'Router', Icon: Router, keywords: ['gateway', 'edge'], category: 'connectivity' },
      { value: 'switch', label: 'Switch', Icon: Switch, keywords: ['layer2', 'lan'], category: 'connectivity' },
      { value: 'wifi-router', label: 'WiFi Router', Icon: Wifi, keywords: ['wireless', 'access point'], category: 'connectivity' },
      { value: 'radio-tower', label: 'Radio Tower', Icon: Radio, keywords: ['wireless bridge', 'ptp'], category: 'connectivity' },
    ],
  },
  {
    id: 'compute',
    label: 'Compute & Cloud',
    icons: [
      { value: 'server', label: 'Server', Icon: Server, keywords: ['bare metal', 'compute'], category: 'compute' },
      { value: 'rack', label: 'Rack', Icon: ServerRack, keywords: ['colocation', 'rack'], category: 'compute' },
      { value: 'cloud', label: 'Cloud', Icon: Cloud, keywords: ['virtual', 'service'], category: 'compute' },
      { value: 'box', label: 'Appliance', Icon: Box, keywords: ['appliance', 'hub'], category: 'compute' },
    ],
  },
  {
    id: 'storage',
    label: 'Storage & Services',
    icons: [
      { value: 'database', label: 'Database', Icon: Database, keywords: ['sql', 'data'], category: 'storage' },
      { value: 'nas', label: 'NAS', Icon: HardDrive, keywords: ['storage', 'backup'], category: 'storage' },
      { value: 'printer', label: 'Printer', Icon: Printer, keywords: ['print', 'peripheral'], category: 'storage' },
      { value: 'camera', label: 'Camera', Icon: Camera, keywords: ['surveillance', 'cctv'], category: 'storage' },
    ],
  },
  {
    id: 'security',
    label: 'Security & Voice',
    icons: [
      { value: 'firewall', label: 'Firewall', Icon: Shield, keywords: ['security', 'gateway'], category: 'security' },
      { value: 'ipphone', label: 'IP Phone', Icon: Phone, keywords: ['voice', 'sip'], category: 'security' },
      { value: 'punchdevice', label: 'Punch Device', Icon: Plug, keywords: ['patch', 'punch'], category: 'security' },
      { value: 'other', label: 'Generic', Icon: Server, keywords: ['other', 'generic'], category: 'security' },
    ],
  },
  {
    id: 'endpoints',
    label: 'User Endpoints',
    icons: [
      { value: 'laptop', label: 'Laptop', Icon: Laptop, keywords: ['endpoint', 'workstation'], category: 'endpoints' },
      { value: 'tablet', label: 'Tablet', Icon: Tablet, keywords: ['mobile', 'user'], category: 'endpoints' },
      { value: 'mobile', label: 'Mobile Phone', Icon: Smartphone, keywords: ['handset', 'user'], category: 'endpoints' },
    ],
  },
];

export const ICON_OPTIONS = ICON_CATEGORIES.flatMap(category => category.icons);

export const IconPicker = ({ value, onChange, open, onOpenChange }: IconPickerProps) => {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    const term = search.toLowerCase();

    return ICON_OPTIONS.filter(icon => {
      const matchesCategory = category === 'all' || icon.category === category;
      const matchesSearch =
        term === '' ||
        icon.label.toLowerCase().includes(term) ||
        icon.value.toLowerCase().includes(term) ||
        icon.keywords.some(keyword => keyword.includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const categoryLabelMap = useMemo(
    () => Object.fromEntries(ICON_CATEGORIES.map(item => [item.id, item.label])),
    [],
  );

  const handleSelect = (iconValue: string) => {
    onChange(iconValue);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select a device icon</DialogTitle>
          <DialogDescription>
            Browse open-source Lucide icons by category or search for a specific device type.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="icon-search">Search icons</Label>
            <Input
              id="icon-search"
              placeholder="Search by name or use-case"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon-category">Icon category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="icon-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {ICON_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="mt-2 h-80 pr-2">
          {filteredIcons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No icons match your search.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filteredIcons.map(icon => (
                <Button
                  key={icon.value}
                  variant={value === icon.value ? 'default' : 'outline'}
                  className="h-auto justify-start p-3 text-left"
                  onClick={() => handleSelect(icon.value)}
                >
                  <div className="flex w-full items-center gap-3">
                    <icon.Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium capitalize leading-tight">{icon.label}</div>
                      <div className="text-xs text-muted-foreground">{categoryLabelMap[icon.category]}</div>
                    </div>
                    {value === icon.value && <Check className="h-4 w-4" />}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
