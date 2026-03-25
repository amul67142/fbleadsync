import { prisma } from '@/lib/prisma';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AutoRefresh from './AutoRefresh';
import LeadRow from './LeadRow';
import Filters from './Filters';
import { Filter } from 'lucide-react';

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

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { pageName?: string; status?: string };
}) {
  const { pageName, status } = searchParams;

  // Build filter object for Prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (pageName && pageName !== 'all') where.pageName = pageName;
  if (status && status !== 'all') where.status = status;

  // Fetch leads with filters applied
  const leadsRaw = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch options for filters from ALL leads (unfiltered)
  const allLeads = await prisma.lead.findMany({
    select: { pageName: true, status: true, createdAt: true },
  });

  const uniquePages = Array.from(new Set(allLeads.map(l => l.pageName).filter(Boolean))) as string[];
  const uniqueStatuses = Array.from(new Set(allLeads.map(l => l.status).filter(Boolean))) as string[];

  // Map to match the interface
  const leads: Lead[] = (leadsRaw as any[]).map(lead => ({
    ...lead,
    createdAt: lead.createdAt,
    formName: lead.formName,
  }));

  // Calculate Stats
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const totalCount = allLeads.length;
  const recentCount = allLeads.filter(l => l.createdAt >= twentyFourHoursAgo).length;
  const qualifiedCount = allLeads.filter(l => l.status === 'qualified' || l.status === 'interested').length;
  const conversionRate = totalCount > 0 ? Math.round((qualifiedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      <div className="container mx-auto p-6 space-y-10">
        <AutoRefresh intervalMs={30000} />

        {/* Header & Stats */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Leads Overview
              </h1>
              <p className="text-slate-500 font-medium">
                Real-time tracking for your Facebook Lead Ads campaigns.
              </p>
            </div>
            
            <Filters pages={uniquePages} statuses={uniqueStatuses} />
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Leads</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-900">{totalCount}</h3>
                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">All Time</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Recent (24h)</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-slate-900">{recentCount}</h3>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conversion Rate</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black premium-gradient-text">{conversionRate}%</h3>
                <span className="text-xs font-bold text-slate-400">Qualified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Lead Feed</h2>
            </div>
            <div className="h-px flex-grow bg-slate-100" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Result Count</span>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-indigo-100 min-w-[30px] text-center">
                {leads.length}
              </span>
            </div>
          </div>
          
          <div className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/20 bg-white">
            <div className="overflow-x-auto">
              {leads.length > 0 ? (
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
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
                      <LeadRow key={lead.id} lead={lead} />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-32 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                    <Filter className="h-8 w-8 text-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">No leads found</h3>
                    <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">
                      Try adjusting filters or wait for new Meta events.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
