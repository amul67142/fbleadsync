'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FiltersProps {
  pages: string[];
  forms: string[];
  statuses: string[];
  totalLeads: number;
  filteredCount: number;
}

export default function Filters({ pages, forms, statuses, totalLeads, filteredCount }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = searchParams.get('pageName') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentForm = searchParams.get('formName') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const pageNumber = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        updateFilter('search', searchTerm, true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchQuery]);

  function updateFilter(key: string, value: string, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    if (resetPage) params.delete('page');
    
    // If page changes, we must reset form filter if the new page doesn't have it
    if (key === 'pageName') params.delete('formName');

    router.push(`/dashboard?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/dashboard');
    setSearchTerm('');
  }

  const hasFilters = currentPage !== 'all' || currentStatus !== 'all' || currentForm !== 'all' || searchQuery;
  
  const totalPages = Math.ceil(filteredCount / limit);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex-grow max-w-md group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search name, email, or phone..."
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); updateFilter('search', ''); }}>
              <X className="h-3 w-3 text-slate-300 hover:text-slate-600" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Page Filter */}
          <Select value={currentPage} onValueChange={(v: string) => updateFilter('pageName', v)}>
            <SelectTrigger className="w-[180px] h-11 rounded-2xl border-2 border-slate-100 font-bold bg-white text-slate-700">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
              <SelectItem value="all" className="font-bold">All Projects</SelectItem>
              {pages.map((p) => (
                <SelectItem key={p} value={p} className="font-semibold">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Form Filter (Conditional) */}
          {currentPage !== 'all' && (
            <Select value={currentForm} onValueChange={(v: string) => updateFilter('formName', v)}>
              <SelectTrigger className="w-[180px] h-11 rounded-2xl border-2 border-indigo-100 font-bold bg-white text-indigo-700 animate-in fade-in slide-in-from-left-2 duration-300">
                <SelectValue placeholder="All Forms" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-indigo-50">
                <SelectItem value="all" className="font-bold">All Forms</SelectItem>
                {forms.map((f) => (
                  <SelectItem key={f} value={f} className="font-semibold">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Status Filter */}
          <Select value={currentStatus} onValueChange={(v: string) => updateFilter('status', v)}>
            <SelectTrigger className="w-[150px] h-11 rounded-2xl border-2 border-slate-100 font-bold bg-white text-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
              <SelectItem value="all" className="font-bold">All Status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize font-semibold">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 h-11 rounded-2xl px-4 font-black uppercase tracking-widest text-[10px]"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="ml-auto flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Page {pageNumber} / {totalPages || 1}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber <= 1}
              onClick={() => updateFilter('page', (pageNumber - 1).toString(), false)}
              className="h-8 w-8 rounded-xl border border-slate-200 shadow-sm disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber >= totalPages}
              onClick={() => updateFilter('page', (pageNumber + 1).toString(), false)}
              className="h-8 w-8 rounded-xl border border-slate-200 shadow-sm disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
