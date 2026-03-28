'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LeadRowProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
}

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
  createdAt: string;
}

function getRelativeTime(date: string | Date) {
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

export default function LeadRow({ lead, isSelected, onSelect }: LeadRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const performDelete = async () => {
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
    <>
    <TableRow className={cn(
      "group/row transition-all duration-200 border-b border-slate-100 hover:!bg-slate-50",
      isSelected && "!bg-indigo-50/40 hover:!bg-indigo-50/60",
      isUpdating && "opacity-50 pointer-events-none"
    )}>
      <TableCell className="py-5">
        <div className="flex items-center justify-center">
          <Checkbox 
            checked={isSelected}
            onChange={(e) => onSelect(lead.id, (e.target as HTMLInputElement).checked)}
          />
        </div>
      </TableCell>
      <TableCell className="py-5">
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 tracking-tight">{lead.name || 'N/A'}</span>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Verified Customer</span>
        </div>
      </TableCell>
      <TableCell className="py-5 font-medium text-slate-600 tracking-tight">{lead.phone || 'N/A'}</TableCell>
      <TableCell className="py-5 text-slate-500 font-medium">{lead.email || 'N/A'}</TableCell>
      <TableCell className="py-5 max-w-[200px]">
        <div className="flex flex-col gap-0.5 group/form">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Form</span>
          <span 
            className="truncate text-sm font-semibold text-slate-500 cursor-help" 
            title={lead.formName || lead.formId || 'No form name'}
          >
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
          onClick={handleDeleteClick}
          className="text-slate-300 hover:text-rose-500 p-2.5 rounded-xl transition-all hover:bg-rose-50 active:scale-95 opacity-40 group-hover/row:opacity-100"
          title="Delete Lead"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
    
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-md rounded-3xl border-2 border-slate-100 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-2 mx-auto sm:mx-0">
            <Trash2 className="h-6 w-6 text-rose-500" />
          </div>
          <DialogTitle className="text-2xl font-black">Delete Lead?</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Are you sure you want to permanently delete <strong className="text-slate-900">{lead.name || 'this lead'}</strong>? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isUpdating}
            className="rounded-xl font-bold font-sm border-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={performDelete}
            disabled={isUpdating}
            className="rounded-xl font-bold font-sm shadow-md transition-all"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Yes, delete lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
