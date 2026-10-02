'use client';

import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

interface LoginFormProps {
  action: (formData: FormData) => void | Promise<void>;
  message?: string;
}

export function LoginForm({ action, message }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block space-y-2 text-sm font-medium text-foreground">
        <span>Campus email</span>
        <span className="relative block">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="email" type="email" autoComplete="username" required placeholder="you@campus.edu" className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-normal outline-none transition placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-2 focus:ring-foreground/10" />
        </span>
      </label>

      <label className="block space-y-2 text-sm font-medium text-foreground">
        <span className="flex items-center justify-between"><span>Password</span><span className="text-[11px] font-normal text-muted-foreground">From your campus invitation</span></span>
        <span className="relative block">
          <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-11 text-sm font-normal outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10" />
          <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </span>
      </label>

      {message && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800">{message}</p>}
      <button className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        Sign in <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
      </button>
    </form>
  );
}
