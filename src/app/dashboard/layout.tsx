import DashboardHeader from './DashboardHeader';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <DashboardHeader />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
