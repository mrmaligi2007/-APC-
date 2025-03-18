import React from 'react';
import { useDeviceStore } from '@/hooks/useDeviceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Loader2, Plus, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DevicesPage() {
  const { devices, activeDevice, isLoading, error, deleteDevice, setActiveDevice } = useDeviceStore();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-red-500 mb-4">Error loading devices: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async (deviceId: string) => {
    try {
      await deleteDevice(deviceId);
      toast({
        title: "Device deleted",
        description: "The device has been successfully removed."
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete device. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Devices</h1>
        <Link href="/devices/manage">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card key={device.id} className={`relative ${device.id === activeDevice?.id ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{device.name}</span>
                {device.id === activeDevice?.id && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Unit: {device.unitNumber}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveDevice(device.id)}
                    disabled={device.id === activeDevice?.id}
                  >
                    Set Active
                  </Button>
                  <Link href={`/devices/manage?id=${device.id}`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(device.id)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <Card className="mt-8">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No devices added yet</p>
            <Link href="/devices/manage">
              <Button>Add Your First Device</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
