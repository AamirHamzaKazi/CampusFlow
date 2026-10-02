'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CampusNotification, CampusRole } from '@/types';
import { signOut } from '@/app/login/actions';
import { Bell, Building2, Check, Command, LogOut, Search, UserPlus } from 'lucide-react';

interface NavbarProps {
  currentRole: CampusRole;
  currentUserName: string;
  institutionName: string;
  onOpenQuickSearch: () => void;
  notifications: CampusNotification[];
  onMarkNotificationsRead: () => void;
}

const roleLabels: Record<CampusRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  department_head: 'Department head',
  facility_manager: 'Facility manager',
  institution_admin: 'Campus admin',
};

export const Navbar: React.FC<NavbarProps> = ({ currentRole, currentUserName, institutionName, onOpenQuickSearch, notifications, onMarkNotificationsRead }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const initials = currentUserName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-bold tracking-tight text-background">CF</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight text-foreground">CampusFlow</div>
            <div className="hidden text-[11px] text-muted-foreground sm:block">Campus resource operations</div>
          </div>
          <div className="hidden h-7 w-px bg-border md:block" />
          <div className="hidden min-w-0 items-center gap-2 md:flex"><Building2 className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate text-xs font-medium text-foreground">{institutionName}</span></div>
        </div>

        <div className="hidden max-w-md flex-1 lg:block">
          <button onClick={onOpenQuickSearch} className="group flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm hover:border-foreground/30">
            <span className="flex items-center gap-2"><Search className="h-4 w-4" />Search resources or bookings</span>
            <kbd className="flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]"><Command className="h-3 w-3" />K</kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {currentRole === 'institution_admin' && <Link href="/admin/invitations" aria-label="Invite campus members" title="Invite campus members" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"><UserPlus className="h-4 w-4" /></Link>}
          <div className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={`Notifications, ${unreadCount} unread`} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" />{unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-foreground ring-2 ring-card" />}
            </button>
            {notificationsOpen && <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><p className="text-sm font-semibold text-foreground">Notifications</p><p className="text-[11px] text-muted-foreground">Booking and campus updates</p></div><button onClick={onMarkNotificationsRead} className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"><Check className="h-3.5 w-3.5" /> Mark read</button></div>
              <div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.slice(0, 6).map((item) => <div key={item.id} className={`border-b border-border px-4 py-3 last:border-0 ${item.read ? '' : 'bg-muted/40'}`}><div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold text-foreground">{item.title}</p>{!item.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />}</div><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.description}</p><p className="mt-1.5 text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p></div>) : <p className="p-8 text-center text-xs text-muted-foreground">You’re all caught up.</p>}</div>
            </div>}
          </div>
          <div className="hidden min-w-0 sm:block"><span className="block max-w-36 truncate text-xs font-medium text-foreground">{currentUserName}</span><span className="block text-[10px] text-muted-foreground">{roleLabels[currentRole]}</span></div>
          <form action={signOut}><button aria-label="Sign out" title="Sign out" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"><LogOut className="h-4 w-4" /></button><button className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted sm:flex"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[10px] font-semibold text-background">{initials}</span><span>Sign out</span><LogOut className="h-3.5 w-3.5 text-muted-foreground" /></button></form>
        </div>
      </div>
    </header>
  );
};
