import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { NetworkDevice } from '@/services/networkDeviceService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { IconPicker, ICON_OPTIONS } from './IconPicker';

const deviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ip_address: z.string().optional().nullable(),
  icon: z.string().min(1, 'Icon is required'),
  description: z.string().optional().nullable(),
  check_port: z.coerce.number().int().positive().optional().nullable(),
  ping_interval: z.coerce.number().int().positive().optional().nullable(),
  icon_size: z.coerce.number().int().min(20).max(100).optional().nullable(),
  name_text_size: z.coerce.number().int().min(8).max(24).optional().nullable(),
  router_api_username: z.string().optional().nullable(),
  router_api_password: z.string().optional().nullable(),
  router_api_port: z.coerce.number().int().positive().optional().nullable(),
  warning_latency_threshold: z.coerce.number().int().positive().optional().nullable(),
  warning_packetloss_threshold: z.coerce.number().int().positive().max(100).optional().nullable(),
  critical_latency_threshold: z.coerce.number().int().positive().optional().nullable(),
  critical_packetloss_threshold: z.coerce.number().int().positive().max(100).optional().nullable(),
  show_live_ping: z.boolean().default(false),
});

interface DeviceFormProps {
  initialData?: Partial<NetworkDevice>;
  onSubmit: (device: Omit<NetworkDevice, 'id' | 'position_x' | 'position_y' | 'user_id'>) => void;
  isEditing?: boolean;
}

export const DeviceForm = ({ initialData, onSubmit, isEditing = false }: DeviceFormProps) => {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const defaultIcon = useMemo(() => {
    const requestedIcon = initialData?.icon || initialData?.type;
    return ICON_OPTIONS.some(option => option.value === requestedIcon) ? requestedIcon : 'server';
  }, [initialData]);

  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: initialData?.name || '',
      ip_address: initialData?.ip_address || '',
      icon: defaultIcon,
      description: initialData?.description || '',
      check_port: initialData?.check_port || undefined,
      ping_interval: initialData?.ping_interval || undefined,
      icon_size: initialData?.icon_size || 50,
      name_text_size: initialData?.name_text_size || 14,
      router_api_username: initialData?.router_api_username || '',
      router_api_password: initialData?.router_api_password || '',
      router_api_port: initialData?.router_api_port || 8728,
      warning_latency_threshold: initialData?.warning_latency_threshold || undefined,
      warning_packetloss_threshold: initialData?.warning_packetloss_threshold || undefined,
      critical_latency_threshold: initialData?.critical_latency_threshold || undefined,
      critical_packetloss_threshold: initialData?.critical_packetloss_threshold || undefined,
      show_live_ping: initialData?.show_live_ping || false,
    },
  });

  const selectedIcon = form.watch('icon');
  const routerApiUsername = form.watch('router_api_username');
  const routerApiPassword = form.watch('router_api_password');

  const showRouterApi =
    (selectedIcon && selectedIcon.includes('router')) ||
    !!routerApiUsername ||
    !!routerApiPassword ||
    initialData?.router_api_port !== undefined;

  const handleSubmit = (values: z.infer<typeof deviceSchema>) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Device' : 'Add New Device'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the details for your network device.' : 'Add a new device to your network map.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Router" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ip_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 192.168.1.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Router in the main office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showRouterApi && (
              <Card className="bg-slate-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">MikroTik API Credentials</CardTitle>
                  <CardDescription className="text-sm">
                    Provide the RouterOS API account (from the MikroTik setup guide) so AMPNM can poll interface traffic over port 8728.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0">
                  <FormField
                    control={form.control}
                    name="router_api_username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Username</FormLabel>
                        <FormControl>
                          <Input placeholder="ampnm-monitor" {...field} />
                        </FormControl>
                        <FormDescription>Matches the RouterOS user you created for traffic monitoring.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="router_api_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="ampnmPass value" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="router_api_port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Port</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="8728"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                          />
                        </FormControl>
                        <FormDescription>Default RouterOS API port is 8728.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Icon</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIconPickerOpen(true)}
                      >
                        <span className="mr-2">Current:</span>
                        <span className="capitalize">{field.value.replace(/-/g, ' ')}</span>
                      </Button>
                      <select
                        value={field.value}
                        onChange={event => field.onChange(event.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {ICON_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FormDescription>
                        Browse the open-source icon gallery, filter by category, or use the quick router/docker galleries to see
                        multiple icon styles at once. Choosing any router icon will also reveal the MikroTik API credential inputs.
                        You can also quickly choose from the dropdown list above if the gallery dialog is not visible.
                      </FormDescription>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <IconPicker
                    value={field.value}
                    onChange={field.onChange}
                    open={iconPickerOpen}
                    onOpenChange={setIconPickerOpen}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="check_port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Port (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 80 for HTTP (leave blank for ICMP ping)"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    If set, device status is based on this port. If empty, it will use ICMP (ping).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ping_interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ping Interval (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 60 (leave blank for no auto ping)"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Size (20-100px)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_text_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name Text Size (8-24px)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 14"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-md font-medium">Status Thresholds (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warning_latency_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Latency (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 100"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warning_packetloss_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Packet Loss (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="critical_latency_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critical Latency (ms)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="critical_packetloss_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critical Packet Loss (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? null : +event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="show_live_ping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Show live ping status on map
                    </FormLabel>
                    <FormDescription>
                      Display real-time ping latency and TTL directly on the device node.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit">{isEditing ? 'Save Changes' : 'Add Device'}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
