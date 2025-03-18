import React, { useState } from 'react';
import { BackupService } from '@/lib/BackupService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BackupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const backup = await BackupService.createBackup();
      
      // Create and download backup file
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gsm-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup created",
        description: "Your backup file has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "Failed to create backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!backupFile) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const backupData = e.target?.result as string;
        await BackupService.restoreFromBackup(backupData);
        
        toast({
          title: "Restore successful",
          description: "Your data has been restored from backup"
        });
        
        // Reload the page to reflect restored data
        window.location.reload();
      };
      reader.readAsText(backupFile);
    } catch (error) {
      toast({
        title: "Restore failed",
        description: error instanceof Error ? error.message : "Failed to restore from backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Backup includes all your devices, users, and settings. Keep your backup file secure.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create Backup</h3>
              <Button
                onClick={handleBackup}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  "Creating backup..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Backup
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Restore from Backup</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Button
                  onClick={handleRestore}
                  disabled={!backupFile || isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    "Restoring..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Restore
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
