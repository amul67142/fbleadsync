'use client';

import { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Lead {
  id: number;
  leadgenId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  adName: string | null;
  adId: string | null;
  formId: string | null;
  formName: string | null;
  pageId: string | null;
  pageName: string | null;
  status: string;
  createdAt: Date;
}

function getRelativeTime(date: Date) {
  const diffInMs = new Date().getTime() - new Date(date).getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return `${diffInSecs}s ago`;
  if (diffInMins === 1) return `1m ago`;
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours === 1) return `1h ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return `1d ago`;
  return `${diffInDays}d ago`;
}

export default function LeadRow({ lead }: { lead: Lead }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
      case 'contacted': return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
      case 'interested': return 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200';
      case 'qualified': return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200';
      case 'junk': return 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200';
      case 'lost': return 'bg-gray-100 text-gray-400 hover:bg-gray-200 border-gray-200 shadow-none';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      console.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      console.error('Failed to delete lead');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TableRow className={cn(
      "group transition-all duration-300 hover:bg-slate-50/80 border-transparent hover:border-slate-100",
      isUpdating && "opacity-50 pointer-events-none"
    )}>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 tracking-tight">{lead.name || 'N/A'}</span>
          <span className="text-xs text-slate-400 font-medium">Verified Customer</span>
        </div>
      </TableCell>
      <TableCell className="font-medium text-slate-600 tracking-tight">{lead.phone || 'N/A'}</TableCell>
      <TableCell className="text-slate-500 font-medium">{lead.email || 'N/A'}</TableCell>
      <TableCell className="max-w-[180px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Form</span>
          <span className="truncate text-sm font-semibold text-slate-500" title={lead.formName || lead.formId || ''}>
            {lead.formName || lead.formId || 'N/A'}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-[180px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Page</span>
          <span className="truncate text-sm font-semibold text-slate-500" title={lead.pageName || lead.pageId || ''}>
            {lead.pageName || lead.pageId || 'N/A'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Select value={lead.status} onValueChange={handleStatusChange}>
          <SelectTrigger className={cn(
            "w-[130px] h-9 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm rounded-full border-2", 
            getStatusColor(lead.status)
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
            <SelectItem value="new" className="text-xs font-bold uppercase tracking-wider">New</SelectItem>
            <SelectItem value="interested" className="text-xs font-bold uppercase tracking-wider">Interested</SelectItem>
            <SelectItem value="qualified" className="text-xs font-bold uppercase tracking-wider">Qualified</SelectItem>
            <SelectItem value="contacted" className="text-xs font-bold uppercase tracking-wider">Contacted</SelectItem>
            <SelectItem value="junk" className="text-xs font-bold uppercase tracking-wider">Junk</SelectItem>
            <SelectItem value="lost" className="text-xs font-bold uppercase tracking-wider">Lost</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-[11px] text-slate-400 whitespace-nowrap font-bold uppercase tracking-tighter">
        {getRelativeTime(lead.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <button
          onClick={handleDelete}
          className="text-slate-300 hover:text-rose-500 p-2.5 rounded-full transition-all hover:bg-rose-50 opacity-0 group-hover:opacity-100 active:scale-95"
          title="Delete Lead"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
    </svg>
  );
}
