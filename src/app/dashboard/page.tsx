import { prisma } from '@/lib/prisma';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AutoRefresh from './AutoRefresh';

// Inline type matching the Prisma schema to avoid requiring generated client
interface Lead {
  id: number;
  leadgenId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  adName: string | null;
  adId: string | null;
  formId: string | null;
  pageId: string | null;
  pageName: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function getRelativeTime(date: Date) {
  const diffInMs = new Date().getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return `${diffInSecs} seconds ago`;
  if (diffInMins === 1) return `1 minute ago`;
  if (diffInMins < 60) return `${diffInMins} minutes ago`;
  if (diffInHours === 1) return `1 hour ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return `1 day ago`;
  return `${diffInDays} days ago`;
}

function StatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'new':
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">New</Badge>;
    case 'contacted':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Contacted</Badge>;
    case 'qualified':
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">Qualified</Badge>;
    case 'lost':
      return <Badge variant="destructive">Lost</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const leads: Lead[] = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <AutoRefresh intervalMs={30000} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">LeadSync Dashboard</h1>
        <p className="text-muted-foreground">
          Showing {leads.length} total lead{leads.length !== 1 ? 's' : ''}. Auto-refreshes every 30 seconds.
        </p>
      </div>

      <div className="border rounded-lg overflow-x-auto shadow-sm bg-card">
        {leads.length > 0 ? (
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ad Name</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead: Lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name || 'N/A'}</TableCell>
                  <TableCell>{lead.phone || 'N/A'}</TableCell>
                  <TableCell>{lead.email || 'N/A'}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={lead.adName || ''}>
                    {lead.adName || 'N/A'}
                  </TableCell>
                  <TableCell>{lead.pageName || lead.pageId || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-sm text-muted-foreground">
                    {getRelativeTime(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No leads yet. When Meta sends webhook events, they will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
