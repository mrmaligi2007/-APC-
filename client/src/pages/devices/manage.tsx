import React from 'react';
import { useLocation } from 'wouter';
import { useDeviceStore } from '@/hooks/useDeviceStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertDeviceSchema } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ManageDevicePage() {
  const [, navigate] = useLocation();
  const { devices, isLoading, addDevice, updateDevice } = useDeviceStore();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const deviceId = searchParams.get('id');

  const existingDevice = deviceId ? devices.find(d => d.id === deviceId) : null;

  const form = useForm({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: existingDevice || {
      name: '',
      unitNumber: '',
      password: '',
      relaySettings: JSON.stringify({
        accessControl: 'AUT',
        latchTime: '000'
      })
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (existingDevice) {
        await updateDevice(existingDevice.id, data);
        toast({
          title: "Success",
          description: "Device updated successfully"
        });
      } else {
        await addDevice(data);
        toast({
          title: "Success",
          description: "New device added successfully"
        });
      }
      navigate('/devices');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save device. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{existingDevice ? 'Edit Device' : 'Add New Device'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Gate Controller" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  {existingDevice ? 'Update Device' : 'Add Device'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/devices')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
