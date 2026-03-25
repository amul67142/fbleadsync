'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, CheckCircle2, AlertCircle, RefreshCcw, Facebook, Upload, FileJson, User, Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

interface Page {
  id: string;
  name: string;
}

interface Form {
  id: string;
  name: string;
}

export default function SyncPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ saved: number; count: number } | null>(null);
  const { toast } = useToast();

  // CSV State
  const [manualPageName, setManualPageName] = useState('');
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state for Comboboxes
  const [openPageSelect, setOpenPageSelect] = useState(false);
  const [openFormSelect, setOpenFormSelect] = useState(false);

  const fetchPages = React.useCallback(async () => {
    try {
      setLoadingPages(true);
      const res = await fetch('/api/meta/sync?type=pages');
      const data = await res.json();
      if (Array.isArray(data)) setPages(data);
    } catch {
      toast({ title: "Error", description: "Failed to load pages", variant: "destructive" });
    } finally {
      setLoadingPages(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handlePageChange = React.useCallback(async (pageId: string) => {
    setSelectedPage(pageId);
    setSelectedForm('');
    setForms([]);
    setResult(null);

    try {
      setLoadingForms(true);
      const res = await fetch(`/api/meta/sync?type=forms&pageId=${pageId}`);
      const data = await res.json();
      if (Array.isArray(data)) setForms(data);
    } catch {
      toast({ title: "Error", description: "Failed to load forms", variant: "destructive" });
    } finally {
      setLoadingForms(false);
    }
  }, [toast]);

  async function handleSync(formIdOverride?: string) {
    const activeFormId = formIdOverride || selectedForm;
    if (!activeFormId || !selectedPage) return;

    const page = pages.find(p => p.id === selectedPage);
    const form = forms.find(f => f.id === activeFormId);

    try {
      setSyncing(true);
      setResult(null);
      const res = await fetch('/api/meta/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPage,
          formId: activeFormId,
          pageName: page?.name,
          formName: formIdOverride === 'all' ? 'All Portfolio Forms' : form?.name
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setResult({ saved: data.saved, count: data.count });
        toast({ title: "Sync Complete", description: data.message });
      } else {
        toast({ title: "Error", description: data.error || "Sync failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong during sync", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!manualPageName.trim()) {
      toast({ title: "Page Name Required", description: "Please enter a Project/Page name for these leads.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingCSV(true);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data as Record<string, string>[];
          
          // Map CSV columns to Lead fields
          const leads = rawData.map(row => {
            // Case-insensitive header matching
            const findValue = (keys: string[]) => {
              const foundKey = Object.keys(row).find(k => 
                keys.some(key => k.toLowerCase().includes(key.toLowerCase()))
              );
              return foundKey ? row[foundKey] : null;
            };

            return {
              leadgenId: `csv_${uuidv4()}`,
              name: findValue(['name', 'full name', 'first name', 'customer']),
              email: findValue(['email', 'mail', 'e-mail']),
              phone: findValue(['phone', 'mobile', 'contact', 'number']),
              pageName: manualPageName,
              formName: 'CSV Import',
              adName: file.name,
              status: 'new'
            };
          }).filter(l => l.name || l.email || l.phone); // Filter out empty-ish rows

          if (leads.length === 0) {
            toast({ title: "Empty or Invalid CSV", description: "Could not find Name, Email, or Phone columns.", variant: "destructive" });
            return;
          }

          const res = await fetch('/api/leads/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leads })
          });
          
          const data = await res.json();
          if (data.success) {
            setResult({ saved: data.saved, count: leads.length });
            toast({ title: "Import Successful", description: `Uploaded ${data.saved} leads to ${manualPageName}.` });
            setManualPageName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
          } else {
            toast({ title: "Import Failed", description: data.error || "Server error", variant: "destructive" });
          }
        } catch {
          toast({ title: "Error", description: "Failed to process CSV data", variant: "destructive" });
        } finally {
          setUploadingCSV(false);
        }
      },
      error: () => {
        toast({ title: "Parse Error", description: "Could not read the CSV file.", variant: "destructive" });
        setUploadingCSV(false);
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      <div className="container mx-auto p-6 max-w-5xl space-y-12">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
              <RefreshCcw className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Lead Synchronization</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Import & Sync</h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Choose between live Meta syncing or manual CSV imports to consolidate all your leads in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Sync & Import Controls */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Meta Card */}
            <Card className="border-2 border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 bg-white overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-slate-50 bg-blue-50/20 pb-8 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Meta Form Sync
                  </CardTitle>
                  <CardDescription className="font-medium text-slate-400">Historical fetch from Facebook Forms.</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-8 flex-grow">
                {/* Page Selection (Combobox) */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">1. Select Facebook Page</label>
                  {loadingPages ? (
                    <div className="h-12 w-full bg-slate-50 animate-pulse rounded-xl border-2 border-slate-100" />
                  ) : (
                    <Popover open={openPageSelect} onOpenChange={setOpenPageSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPageSelect}
                          className="w-full h-12 justify-between rounded-xl border-2 border-slate-100 font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm px-4"
                        >
                          <div className="flex items-center truncate">
                            {selectedPage
                              ? pages.find((p) => p.id === selectedPage)?.name
                              : "Choose a page..."}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl border-2 border-slate-200 shadow-2xl overflow-hidden bg-white z-[100]" align="start">
                        <Command className="border-none bg-white">
                          <CommandInput placeholder="Search pages..." className="h-12 font-semibold bg-white" />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty className="py-6 text-center text-sm font-bold text-slate-400">No page found.</CommandEmpty>
                            <CommandGroup>
                              {pages.map((p) => (
                                <CommandItem
                                  key={p.id}
                                  value={p.name}
                                  onSelect={() => {
                                    handlePageChange(p.id);
                                    setOpenPageSelect(false);
                                  }}
                                  className="py-3 font-semibold px-4 cursor-pointer hover:bg-slate-50"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-indigo-600",
                                      selectedPage === p.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {p.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {/* Form Selection (Combobox) */}
                <div className={cn("space-y-3 transition-all duration-500", !selectedPage && "opacity-30 pointer-events-none grayscale")}>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">2. Select Lead Form</label>
                  {loadingForms ? (
                    <div className="h-12 w-full bg-slate-50 flex items-center px-4 rounded-xl border-2 border-indigo-100 animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500 mr-2" />
                      <span className="text-sm font-bold text-slate-400">Fetching forms...</span>
                    </div>
                  ) : (
                    <Popover open={openFormSelect} onOpenChange={setOpenFormSelect}>
                      <PopoverTrigger asChild disabled={forms.length === 0}>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openFormSelect}
                          className="w-full h-12 justify-between rounded-xl border-2 border-slate-100 font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm px-4 disabled:opacity-50"
                        >
                          <div className="flex items-center truncate">
                            {selectedForm
                              ? forms.find((f) => f.id === selectedForm)?.name
                              : forms.length > 0 ? "Choose a form..." : "No forms found"}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl border-2 border-slate-200 shadow-2xl overflow-hidden bg-white z-[100]" align="start">
                        <Command className="border-none bg-white">
                          <CommandInput placeholder="Search forms..." className="h-12 font-semibold bg-white" />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty className="py-6 text-center text-sm font-bold text-slate-400">No form found.</CommandEmpty>
                            <CommandGroup>
                              {forms.map((f) => (
                                <CommandItem
                                  key={f.id}
                                  value={f.name}
                                  onSelect={() => {
                                    setSelectedForm(f.id);
                                    setOpenFormSelect(false);
                                  }}
                                  className="py-3 font-semibold px-4 cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-blue-600",
                                      selectedForm === f.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {f.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-8 flex flex-col items-center gap-4 border-t border-slate-50">
                <Button 
                  onClick={() => handleSync()} 
                  disabled={!selectedForm || syncing} 
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-200/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 group"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Syncing Meta Data...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5 group-hover:bounce" />
                      Historical Meta Sync
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => handleSync('all')} 
                  disabled={!selectedPage || syncing} 
                  className="w-full h-12 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50 group"
                >
                  <RefreshCcw className={cn("mr-2 h-4 w-4 text-slate-400", syncing && "animate-spin")} />
                  Sync All Portfolio Data
                </Button>
              </CardFooter>
            </Card>

            {/* CSV Card */}
            <Card className="border-2 border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 bg-white overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-slate-50 bg-indigo-50/20 pb-8 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-indigo-600" />
                    Manual CSV Import
                  </CardTitle>
                  <CardDescription className="font-medium text-slate-400">Import leads from other projects manually.</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-600/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-8 flex-grow">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">1. Page / Project Name</label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. Google Ads Campaign" 
                      value={manualPageName}
                      onChange={(e) => setManualPageName(e.target.value)}
                      className="h-12 rounded-xl border-2 border-slate-100 focus:ring-indigo-500 font-bold text-slate-700 pl-10"
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">2. Upload CSV File</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all hover:border-indigo-300 group"
                  >
                    <Upload className="h-8 w-8 text-slate-300 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                    <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                      Click to browse .csv leads file
                    </p>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleCSVUpload}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-8 border-t border-slate-50">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-2 mx-auto">
                  <AlertCircle className="h-3 w-3" />
                  Supports Name, Email, and Phone columns.
                </p>
              </CardFooter>
            </Card>

          </div>

          <div className="lg:col-span-12">
            {result ? (
              <Card className="border-2 border-emerald-100 rounded-3xl bg-emerald-50/20 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-500 mt-4 shadow-xl">
                <CardContent className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Success! Import Completed</h3>
                      <p className="text-sm font-medium text-slate-400">Your leads are now available on the main dashboard.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-900">{result.saved}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Leads Saved</span>
                    </div>
                    <Button variant="outline" className="h-14 px-8 border-2 border-emerald-200 text-emerald-700 font-bold rounded-2xl" onClick={() => setResult(null)}>
                      Clear Result
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : syncing || uploadingCSV ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                <div className="h-16 w-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin shadow-xl" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
                  {uploadingCSV ? 'Parsing CSV Data...' : 'Connecting to Meta...'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
