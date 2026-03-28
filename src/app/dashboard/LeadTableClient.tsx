'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LeadRow from './LeadRow';

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

interface LeadTableClientProps {
  leads: Lead[];
}

export default function LeadTableClient({ leads }: LeadTableClientProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(leads.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteDialogOpen(true);
  };

  const performBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/leads/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Leads Deleted",
          description: data.message,
        });
        setSelectedIds([]);
        router.refresh();
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || "Could not delete leads",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selection</span>
              <span className="text-sm font-bold">{selectedIds.length} leads selected</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex items-center gap-3">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDeleteClick}
                disabled={isDeleting}
                className="rounded-full px-6 font-black uppercase tracking-widest text-[10px] h-10 hover:scale-105 transition-all shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Selected
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white rounded-full font-bold text-[10px] uppercase"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/20 bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[50px] py-4">
                  <div className="flex items-center justify-center">
                    <Checkbox 
                      checked={allSelected}
                      onChange={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                    />
                  </div>
                </TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Contact</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Phone</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Email</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Source Form</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Meta Page</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</TableHead>
                <TableHead className="py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Entry Time</TableHead>
                <TableHead className="py-4 text-right font-black uppercase tracking-widest text-[10px] text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead: Lead) => (
                <LeadRow 
                  key={lead.id} 
                  lead={lead} 
                  isSelected={selectedIds.includes(lead.id)}
                  onSelect={(id, checked) => handleSelectRow(id, checked)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-2 border-slate-100 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <Trash2 className="h-6 w-6 text-rose-500" />
            </div>
            <DialogTitle className="text-2xl font-black">Delete Selected Leads?</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              You are about to permanently delete <strong className="text-slate-900">{selectedIds.length} lead{selectedIds.length !== 1 ? 's' : ''}</strong>. 
              This action cannot be undone and the data will be removed from your database forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-xl font-bold font-sm border-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={performBulkDelete}
              disabled={isDeleting}
              className="rounded-xl font-bold font-sm shadow-md transition-all"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Yes, delete {selectedIds.length} lead{selectedIds.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
