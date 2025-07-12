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
  const [textData, setTextData] = useState('');
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

  const convertTextToJson = () => {
    if (!textData.trim()) {
      toast({
        title: "Error",
        description: "Please paste text data to convert",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse the markdown table format
      const lines = textData.split('\n').filter(line => line.trim());
      const bills = [];
      
      for (const line of lines) {
        // Parse table rows that contain bill data
        if (line.includes('|') && !line.includes('Bill Name') && !line.includes('---') && line.split('|').length >= 5) {
          const columns = line.split('|').map(col => col.trim()).filter(col => col);
          
          if (columns.length >= 5) {
            const billName = columns[0].replace(/\*\*/g, '').trim();
            const currentStatus = columns[1].trim();
            const nextSteps = columns[2].trim();
            const passageChance = parseInt(columns[3].match(/\d+/)?.[0] || '50');
            const whatsNext = columns[4].trim();
            
            if (billName && billName !== 'Bill Name') {
              bills.push({
                id: generateId(billName),
                billName: billName,
                billNumber: getBillNumber(billName),
                description: getDescription(billName),
                currentStatus: currentStatus,
                nextSteps: nextSteps,
                passageChance: passageChance,
                whatsNext: whatsNext,
                lastAction: getLastAction(currentStatus),
                sponsor: getSponsor(billName),
                category: getCategory(billName),
                priority: getPriority(passageChance)
              });
            }
          }
        }
      }
      
      const jsonData = {
        bills: bills,
        lastUpdated: new Date().toISOString(),
        summary: "Updated legislation data from text conversion. Crypto Week (July 14-18, 2025) continues with multiple House votes scheduled.",
        nextMajorEvent: "Crypto Week House votes (July 14-18, 2025) on multiple crypto bills"
      };
      
      setUploadData(JSON.stringify(jsonData, null, 2));
      toast({
        title: "Success",
        description: `Converted ${bills.length} bills to JSON format`,
      });
      
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Could not parse text data. Please check format.",
        variant: "destructive",
      });
    }
  };

  // Helper functions for data conversion
  const generateId = (billName: string) => {
    return billName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
  };

  const getBillNumber = (billName: string) => {
    if (billName.includes('GENIUS')) return 'S. 2664';
    if (billName.includes('CLARITY')) return 'H.R. 4763';
    if (billName.includes('Anti-CBDC')) return 'H.R. 5403';
    if (billName.includes('BITCOIN')) return 'S. 4912';
    if (billName.includes('H.J.Res')) return 'H.J.Res. 25';
    return 'TBD';
  };

  const getCategory = (billName: string) => {
    if (billName.includes('GENIUS') || billName.includes('stablecoin')) return 'stablecoin';
    if (billName.includes('CLARITY')) return 'regulation';
    if (billName.includes('Anti-CBDC')) return 'innovation';
    if (billName.includes('BITCOIN')) return 'innovation';
    if (billName.includes('DeFi') || billName.includes('Broker')) return 'taxation';
    return 'regulation';
  };

  const getPriority = (passageChance: number) => {
    if (passageChance >= 70) return 'high';
    if (passageChance >= 50) return 'medium';
    return 'low';
  };

  const getDescription = (billName: string) => {
    if (billName.includes('GENIUS')) return 'Comprehensive stablecoin regulatory framework establishing clear federal oversight and compliance requirements';
    if (billName.includes('CLARITY')) return 'Defines regulatory roles for SEC and CFTC over crypto assets, establishing clear jurisdictional boundaries';
    if (billName.includes('Anti-CBDC')) return 'Prohibits Federal Reserve from issuing central bank digital currency directly to individuals without Congressional authorization';
    if (billName.includes('BITCOIN')) return 'Establishes Strategic Bitcoin Reserve requiring federal government to purchase Bitcoin over five years';
    if (billName.includes('DeFi')) return 'Congressional Review Act resolution to repeal Biden-era IRS DeFi Broker Rule requiring DeFi platforms to report transactions';
    return 'Cryptocurrency-related legislation in Congress';
  };

  const getLastAction = (currentStatus: string) => {
    if (currentStatus.includes('Passed')) return 'Passed chamber with bipartisan support';
    if (currentStatus.includes('committee')) return 'Advanced through committee review';
    if (currentStatus.includes('Introduced')) return 'Introduced and referred to committee';
    return 'Legislative action pending';
  };

  const getSponsor = (billName: string) => {
    if (billName.includes('GENIUS')) return 'Sen. Bill Hagerty (R-TN) & Sen. Kirsten Gillibrand (D-NY)';
    if (billName.includes('CLARITY')) return 'Rep. Patrick McHenry (R-NC) & Rep. Glenn Thompson (R-PA)';
    if (billName.includes('Anti-CBDC')) return 'Rep. Tom Emmer (R-MN)';
    if (billName.includes('BITCOIN')) return 'Sen. Cynthia Lummis (R-WY)';
    if (billName.includes('DeFi')) return 'Rep. Mike Flood (R-NE)';
    return 'Various sponsors';
  };

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

      <div className="grid gap-6">
        {/* Text to JSON Converter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text to JSON Converter
            </CardTitle>
            <CardDescription>
              Paste your table text (like from your attached file) and convert it to JSON format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text-data">Paste Table Text Here</Label>
              <Textarea
                id="text-data"
                placeholder="Paste your markdown table text here (with | separators)..."
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
                className="min-h-[150px] text-sm"
              />
            </div>
            <Button onClick={convertTextToJson} className="w-full">
              Convert to JSON
            </Button>
          </CardContent>
        </Card>

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

          {/* Upload JSON Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload JSON Data
              </CardTitle>
              <CardDescription>Review and upload the converted JSON data</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="upload-data">JSON Data</Label>
                  <Textarea
                    id="upload-data"
                    value={uploadData}
                    onChange={(e) => setUploadData(e.target.value)}
                    placeholder="JSON data will appear here after conversion..."
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