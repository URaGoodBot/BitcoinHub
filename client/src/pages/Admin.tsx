import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface LegislationUpload {
  bills: any[];
  summary: string;
  nextMajorEvent: string;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadData, setUploadData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check current legislation data
  const { data: currentData, isLoading } = useQuery({
    queryKey: ['/api/legislation'],
    enabled: isAuthenticated
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper authentication
    if (password === 'HodlMyBeer21Admin') {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Validate JSON format
      const parsedData = JSON.parse(uploadData);
      
      // Basic validation
      if (!parsedData.bills || !Array.isArray(parsedData.bills)) {
        throw new Error('Invalid format: bills array required');
      }

      // Upload to server
      await apiRequest('/api/legislation/admin-upload', {
        method: 'POST',
        body: JSON.stringify({
          password: password,
          data: parsedData
        })
      });

      // Refresh the data
      await queryClient.invalidateQueries({ queryKey: ['/api/legislation'] });

      toast({
        title: "Upload Successful",
        description: `Updated ${parsedData.bills.length} bills`,
      });

      setUploadData('');
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || 'Invalid JSON format',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const refreshData = useMutation({
    mutationFn: () => apiRequest('/api/legislation/refresh', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legislation'] });
      toast({
        title: "Data Refreshed",
        description: "Legislation data updated from Grok AI",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed", 
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Enter password to access legislation data management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legislation Admin Panel</h1>
          <p className="text-muted-foreground">Update cryptocurrency legislation data</p>
        </div>
        <Button
          onClick={() => refreshData.mutate()}
          disabled={refreshData.isPending}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshData.isPending ? 'animate-spin' : ''}`} />
          Refresh from Grok
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Current Data
            </CardTitle>
            <CardDescription>Currently displayed legislation information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading current data...</div>
            ) : currentData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Bills: {currentData.bills?.length || 0}</h4>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(currentData.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Summary:</h4>
                  <p className="text-sm">{currentData.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Next Major Event:</h4>
                  <p className="text-sm">{currentData.nextMajorEvent}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Upload New Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload New Data
            </CardTitle>
            <CardDescription>Upload JSON data to update legislation information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="upload-data">JSON Data</Label>
                <Textarea
                  id="upload-data"
                  value={uploadData}
                  onChange={(e) => setUploadData(e.target.value)}
                  placeholder='{"bills": [...], "summary": "...", "nextMajorEvent": "..."}'
                  className="min-h-[200px] font-mono text-sm"
                  required
                />
              </div>
              <Button type="submit" disabled={isUploading || !uploadData.trim()}>
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Data
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Data Format Help */}
      <Card>
        <CardHeader>
          <CardTitle>Data Format Reference</CardTitle>
          <CardDescription>Expected JSON structure for legislation data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload data must include a "bills" array with bill objects containing: billName, billNumber, description, currentStatus, nextSteps, passageChance, whatsNext, lastAction, sponsor, category, priority
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}