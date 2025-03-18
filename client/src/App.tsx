import React from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from "@/lib/DataContext";
import DevicesPage from "@/pages/devices";
import DeviceManagePage from "@/pages/devices/manage";
import BackupPage from "@/pages/devices/backup";
import NotFound from "@/pages/not-found";

function Router() {
  console.log('Router component mounted'); // Debug log
  return (
    <Switch>
      <Route path="/" component={DevicesPage} />
      <Route path="/devices" component={DevicesPage} />
      <Route path="/devices/manage" component={DeviceManagePage} />
      <Route path="/devices/backup" component={BackupPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  console.log('App component mounting'); // Debug log
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8">
              <Router />
            </div>
          </div>
          <Toaster />
        </DataProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}