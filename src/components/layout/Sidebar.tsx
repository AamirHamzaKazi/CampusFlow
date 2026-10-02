'use client';

import React from 'react';
import { Role } from '@/types';
import { BarChart3, CalendarDays, ClipboardList, LayoutGrid, Search, Settings2, Sparkles, Wrench } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'calendar' | 'discover' | 'my-bookings' | 'approvals' | 'resources' | 'maintenance' | 'analytics' | 'assistant' | 'activity';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingCount: number;
  currentRole: Role;
  resourceCount: number;
}

const studentNav: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'discover', label: 'Find resources', icon: <Search className="h-4 w-4" /> },
  { id: 'my-bookings', label: 'My bookings', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'calendar', label: 'Campus calendar', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 'assistant', label: 'Booking assistant', icon: <Sparkles className="h-4 w-4" /> },
];

const staffNav: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: 'pending' }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'calendar', label: 'Resource calendar', icon: <CalendarDays className="h-4 w-4" /> },
  { id: 'my-bookings', label: 'All bookings', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'resources', label: 'Resource inventory', icon: <Search className="h-4 w-4" /> },
  { id: 'approvals', label: 'Booking requests', icon: <ClipboardList className="h-4 w-4" />, badge: 'pending' },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="h-4 w-4" /> },
  { id: 'analytics', label: 'Utilization', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'activity', label: 'Activity log', icon: <Settings2 className="h-4 w-4" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, pendingCount, currentRole, resourceCount }) => {
  const isCampusUser = currentRole === 'student' || currentRole === 'faculty';
  const nav = isCampusUser ? studentNav : staffNav;
  const renderItem = (item: (typeof nav)[number], layout: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    const isActive = activeTab === item.id;
    const badge = 'badge' in item && item.badge === 'pending' && pendingCount > 0;
    const compact = layout === 'mobile';
    return <button key={item.id} onClick={() => onSelectTab(item.id)} aria-current={isActive ? 'page' : undefined} className={`relative flex shrink-0 items-center rounded-lg text-xs font-medium transition-colors ${layout === 'desktop' ? 'w-full gap-3 px-3 py-2.5 text-left' : layout === 'tablet' ? 'gap-2 whitespace-nowrap px-3 py-2' : 'min-w-[72px] flex-col justify-center gap-1 px-1 py-2'} ${isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      <span className="shrink-0">{item.icon}</span><span className={compact ? 'max-w-full truncate text-[10px]' : layout === 'tablet' ? 'whitespace-nowrap' : 'min-w-0 flex-1 truncate'}>{item.label}</span>{badge && layout !== 'mobile' && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">{pendingCount}</span>}
    </button>;
  };

  return <>
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col justify-between border-r border-border bg-sidebar p-3 xl:flex">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"><span className="text-[11px] font-medium text-muted-foreground">Workspace</span><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground">{isCampusUser ? 'Campus user' : 'Operations'}</span></div>
        <nav aria-label="Main navigation" className="space-y-1">{nav.map((item) => renderItem(item))}</nav>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-[11px] font-medium text-muted-foreground">Campus snapshot</p>
        <div className="mt-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">Resources</span><span className="font-semibold text-foreground">{resourceCount}</span></div>
        <div className="mt-2 flex items-center justify-between text-xs"><span className="text-muted-foreground">Requests waiting</span><span className="font-semibold text-foreground">{pendingCount}</span></div>
      </div>
    </aside>
    <nav aria-label="Tablet navigation" className="sticky top-16 z-30 hidden min-w-0 border-b border-border bg-background/95 px-3 py-2 backdrop-blur md:block xl:hidden">
      <div className="overflow-x-auto [scrollbar-width:thin]"><div className="flex w-max min-w-full items-center gap-1">{nav.map((item) => renderItem(item, 'tablet'))}</div></div>
    </nav>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"><div className="flex min-w-max gap-1">{nav.map((item) => renderItem(item, 'mobile'))}</div></nav>
  </>;
};
