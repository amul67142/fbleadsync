'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Shield, Key, Info, Lock, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TokenInfo {
  status: string;
  name?: string;
  id?: string;
  permissions?: { permission: string; status: string }[];
  token?: string;
  error?: string;
  capi?: {
    pixelId: string;
    hasToken: boolean;
    capiTokenMasked: string;
    testCode: string;
  };
}

export default function SettingsPage() {
  const [token, setToken] = useState('');
  const [pixelId, setPixelId] = useState('');
  const [capiToken, setCapiToken] = useState('');
  const [testCode, setTestCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [capiLoading, setCapiLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [info, setInfo] = useState<TokenInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    try {
      setFetching(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      setInfo(data);
      if (data.capi) {
        setPixelId(data.capi.pixelId || '');
        setTestCode(data.capi.testCode || '');
      }
    } catch {
      console.error('Failed to fetch token info');
    } finally {
      setFetching(false);
    }
  }

  async function handleUpdate() {
    if (!token.trim()) {
      toast({ title: "Validation Error", description: "Please enter a valid Meta Access Token", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      
      if (data.success) {
        setInfo(data.info);
        setToken('');
        toast({ title: "Configuration Updated", description: "Your Meta Access Token has been securely saved." });
      } else {
        toast({ title: "Update Failed", description: data.error || "Invalid token provided", variant: "destructive" });
      }
    } catch {
      toast({ title: "System Error", description: "Could not connect to the settings API", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCapiUpdate() {
    if (!pixelId.trim()) {
      toast({ title: "Validation Error", description: "Meta Pixel / Dataset ID is required.", variant: "destructive" });
      return;
    }

    try {
      setCapiLoading(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixelId: pixelId.trim(),
          capiToken: capiToken.trim(),
          testCode: testCode.trim()
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setInfo(data.info);
        setCapiToken('');
        toast({ title: "CAPI Configuration Saved", description: "Meta Conversions API parameters have been securely saved." });
      } else {
        toast({ title: "Update Failed", description: data.error || "Failed to save CAPI credentials", variant: "destructive" });
      }
    } catch {
      toast({ title: "System Error", description: "Could not connect to the settings API", variant: "destructive" });
    } finally {
      setCapiLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      <div className="container mx-auto p-6 max-w-6xl space-y-12">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1.5 rounded-lg">
              <Key className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">System Configuration</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Settings</h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Manage your connection to Meta Graph API and configure Conversions API (CAPI) for real-time lead optimization.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Left Column: API Configuration Forms */}
          <div className="space-y-8">
            {/* Conversions API (CAPI) Card */}
            <Card className="border-2 border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30 pb-8">
                <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Radio className="h-5 w-5 text-indigo-500" />
                  Conversions API (CAPI)
                </CardTitle>
                <CardDescription className="font-medium text-slate-400">
                  Configure server-to-server lead optimization for Meta Lead Ads.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Meta Pixel / Dataset ID</label>
                    <Input 
                      type="text" 
                      placeholder="123456789012345" 
                      value={pixelId} 
                      className="h-12 rounded-xl border-2 border-slate-100 focus:ring-indigo-500 font-sans text-sm bg-slate-50/50"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPixelId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                      <span>Conversions API Access Token</span>
                      {info?.capi?.hasToken && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase py-0.5 px-2 rounded-full border-hidden">
                          Configured
                        </Badge>
                      )}
                    </label>
                    <Input 
                      type="password" 
                      placeholder={info?.capi?.hasToken ? "••••••••••••••••" : "EAA..."} 
                      value={capiToken} 
                      className="h-12 rounded-xl border-2 border-slate-100 focus:ring-indigo-500 font-mono text-sm bg-slate-50/50"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapiToken(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 font-medium">
                      {info?.capi?.hasToken ? `Active Token: ${info.capi.capiTokenMasked}` : "Generate this in Meta Events Manager under Settings > Conversions API."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Test Event Code (Optional)</label>
                    <Input 
                      type="text" 
                      placeholder="TEST12345" 
                      value={testCode} 
                      className="h-12 rounded-xl border-2 border-slate-100 focus:ring-indigo-500 font-mono text-sm bg-slate-50/50"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestCode(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 font-medium">
                      Used to view real-time events in your Meta Events Manager &quot;Test Events&quot; console during setup.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-8">
                <Button onClick={handleCapiUpdate} disabled={capiLoading} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                  {capiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save CAPI Settings
                </Button>
              </CardFooter>
            </Card>

            {/* Token Update Card (Page Access) */}
            <Card className="border-2 border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30 pb-8">
                <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-indigo-500" />
                  Graph API (Page Access)
                </CardTitle>
                <CardDescription className="font-medium text-slate-400">Update your Meta Page Access Token securely.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Page Access Token</label>
                  <div className="relative">
                    <Input 
                      type="password" 
                      placeholder="EAA..." 
                      value={token} 
                      className="h-14 rounded-xl border-2 border-slate-100 focus:ring-indigo-500 font-mono text-sm bg-slate-50/50"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                    />
                    <div className="absolute right-4 top-4 text-slate-300">
                      <Shield className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Used to fetch lead form values upon receiving webhook triggers.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pb-8">
                <Button onClick={handleUpdate} disabled={loading} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Page Connection
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Health Status */}
          <div className="space-y-8">
            <Card className={cn(
              "border-2 rounded-3xl transition-all duration-500 overflow-hidden shadow-xl shadow-slate-200/40 bg-white",
              info?.status === 'valid' ? "border-emerald-100/50" : "border-rose-100/50"
            )}>
              <CardHeader className={cn(
                "border-b pb-8",
                info?.status === 'valid' ? "bg-emerald-50/30 border-emerald-50" : "bg-rose-50/30 border-rose-50"
              )}>
                <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800">
                  System Health
                  {fetching ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  ) : info?.status === 'valid' ? (
                    <div className="bg-emerald-500 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-white" /></div>
                  ) : (
                    <div className="bg-rose-500 p-1 rounded-full"><XCircle className="h-4 w-4 text-white" /></div>
                  )}
                </CardTitle>
                <CardDescription className="font-medium text-slate-400">Real-time status of your Meta API link.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                {fetching ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-black uppercase tracking-widest text-slate-300">Verifying Connection</p>
                  </div>
                ) : info?.status === 'valid' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account</p>
                        <p className="font-bold text-slate-900 truncate">{info.name}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta ID</p>
                        <p className="font-bold text-slate-900 truncate">{info.id}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Page Token</span>
                      <code className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600">{info.token}</code>
                    </div>

                    {/* Conversions API Health Details */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Radio className="h-3.5 w-3.5 text-indigo-500 animate-pulse" /> Conversions API Status
                      </span>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">Pixel / Dataset ID</span>
                          <span className="text-xs font-black font-mono text-slate-800">{info.capi?.pixelId || 'Not Configured'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">Server Event Sync</span>
                          {info.capi?.hasToken && info.capi?.pixelId ? (
                            <Badge className="bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider py-0.5 px-3.5 rounded-full border-hidden shadow-sm">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-wider py-0.5 px-3.5 rounded-full border-hidden shadow-sm">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {info.capi?.testCode && (
                          <div className="flex items-center justify-between border-t border-slate-200/50 pt-2.5">
                            <span className="text-[11px] font-bold text-slate-500">Test Code Active</span>
                            <code className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200/30 px-2 py-0.5 rounded-lg">
                              {info.capi.testCode}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Shield className="h-3 w-3" /> Security Permissions
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {info.permissions?.map((p) => (
                          <Badge 
                            key={p.permission} 
                            variant="secondary"
                            className={cn(
                              "text-[9px] font-black uppercase tracking-wider py-1 rounded-full px-3 border-hidden shadow-sm",
                              p.status === 'granted' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                            )}
                          >
                            {p.permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-8 w-8 text-rose-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-rose-900 uppercase tracking-tighter">Connection Failed</h3>
                      <p className="text-xs text-rose-400 font-medium px-6">{info?.error || 'Your access token is invalid or has expired.'}</p>
                    </div>
                    <Button variant="outline" className="mt-4 border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 rounded-xl" onClick={fetchInfo}>
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
