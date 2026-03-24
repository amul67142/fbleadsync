'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

interface FiltersProps {
  pages: string[];
  statuses: string[];
}

export default function Filters({ pages, statuses }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = searchParams.get('pageName') || 'all';
  const currentStatus = searchParams.get('status') || 'all';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/dashboard');
  }

  const hasFilters = currentPage !== 'all' || currentStatus !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
        <Filter className="h-4 w-4" />
        Filters:
      </div>

      <div className="flex items-center gap-3">
        {/* Page Filter */}
        <Select value={currentPage} onValueChange={(v: string) => updateFilter('pageName', v)}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="All Pages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            {pages.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={currentStatus} onValueChange={(v: string) => updateFilter('status', v)}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground h-9"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
