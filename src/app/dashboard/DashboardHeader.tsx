'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Settings, RefreshCcw } from 'lucide-react';

export default function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b glassmorphism">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <span className="inline-block font-bold text-xl tracking-tight premium-gradient-text">
              LeadSync
            </span>
          </Link>
          <nav className="hidden md:flex gap-1">
            <Link 
              href="/dashboard"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                pathname === '/dashboard' 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Leads
            </Link>
            <Link 
              href="/dashboard/settings"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                pathname === '/dashboard/settings' 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link 
              href="/dashboard/sync"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                pathname === '/dashboard/sync' 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <RefreshCcw className="h-4 w-4" />
              Sync Leads
            </Link>
          </nav>
        </div>
        
        {/* Mobile Nav Toggle could go here if needed, but keeping it simple for now */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">System Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
