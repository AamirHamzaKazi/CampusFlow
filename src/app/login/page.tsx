import Link from 'next/link';
import { signIn } from './actions';
import { LoginForm } from '@/components/auth/LoginForm';
import { isSupabaseConfigured } from '@/lib/supabase/env';

function CampusArtwork() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="campus-sky" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#27272a" /><stop offset=".54" stopColor="#111113" /><stop offset="1" stopColor="#050505" /></linearGradient>
        <linearGradient id="campus-ground" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#27272a" /><stop offset="1" stopColor="#111113" /></linearGradient>
        <radialGradient id="campus-light"><stop stopColor="#fff" stopOpacity=".15" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <pattern id="window-grid" width="38" height="42" patternUnits="userSpaceOnUse"><path d="M7 8h16v20H7z" fill="#fff" fillOpacity=".76" /><path d="M7 32h16" stroke="#111" strokeOpacity=".5" /></pattern>
      </defs>
      <rect width="1000" height="1000" fill="url(#campus-sky)" />
      <circle cx="720" cy="250" r="360" fill="url(#campus-light)" />
      <path d="M0 565 230 435l170 85 230-190 370 185v485H0z" fill="#18181b" stroke="#52525b" strokeOpacity=".32" />
      <path d="m55 510 178-104 164 87v340H55z" fill="#252528" stroke="#a1a1aa" strokeOpacity=".45" />
      <path d="m77 505 156-91 139 74v308H77z" fill="url(#window-grid)" opacity=".45" />
      <path d="m400 475 230-190 295 146v376H400z" fill="#202023" stroke="#d4d4d8" strokeOpacity=".5" />
      <path d="m436 463 194-160 259 128v340H436z" fill="url(#window-grid)" opacity=".55" />
      <path d="M400 475 630 285l295 146-248 47z" fill="#3f3f46" stroke="#e4e4e7" strokeOpacity=".62" />
      <path d="M0 760q160-52 322 0t337 0 341 0v240H0z" fill="url(#campus-ground)" />
      <path d="M452 1000 574 650h112L824 1000" fill="#3f3f46" fillOpacity=".55" stroke="#d4d4d8" strokeOpacity=".26" />
      <path d="M625 690h18M602 758h64M577 838h115M548 932h171" stroke="#e4e4e7" strokeOpacity=".35" strokeWidth="2" />
      <g fill="#09090b" stroke="#a1a1aa" strokeOpacity=".35">
        <path d="M130 824h10v-60q0-28 22-28t22 28v60h10v-70q0-38-32-38t-32 38z" />
        <path d="M820 807h9v-54q0-25 20-25t20 25v54h9v-64q0-35-29-35t-29 35z" />
        <path d="M235 858h8v-45q0-21 17-21t17 21v45h8v-54q0-29-25-29t-25 29z" />
      </g>
      <g fill="#f4f4f5" opacity=".66"><circle cx="167" cy="726" r="3"/><circle cx="849" cy="712" r="3"/><circle cx="260" cy="782" r="3"/></g>
      <path d="M0 0h1000v1000H0z" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="2" />
    </svg>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`inline-flex w-fit items-center gap-3 ${light ? 'text-white' : 'text-foreground'}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${light ? 'bg-white text-black' : 'bg-black text-white'}`}>CF</span>
      <span><span className="block text-sm font-semibold tracking-tight">CampusFlow</span><span className={`block text-[11px] ${light ? 'text-white/60' : 'text-muted-foreground'}`}>Campus resource operations</span></span>
    </Link>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[1.08fr_.92fr]">
      <section aria-labelledby="login-story-title" className="relative isolate flex min-h-[310px] overflow-hidden bg-zinc-950 text-white sm:min-h-[370px] lg:min-h-screen">
        <CampusArtwork />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
        <div className="relative flex w-full flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="hidden lg:block"><Brand light /></div>
          <div className="max-w-xl pb-4 lg:pb-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-white" /> One connected campus</span>
            <h1 id="login-story-title" className="mt-5 max-w-lg text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl lg:text-5xl xl:text-[3.5rem]">Make room for the work that matters.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70 sm:text-base">Find, book, and manage the spaces that bring campus ideas to life.</p>
          </div>
          <div className="hidden items-center justify-between border-t border-white/15 pt-5 text-[11px] text-white/50 lg:flex"><span>Resources, schedules, and campus teams in sync.</span><span>CampusFlow</span></div>
        </div>
      </section>

      <section aria-labelledby="login-title" className="flex min-h-[calc(100vh-310px)] flex-col bg-background px-6 py-8 sm:min-h-[calc(100vh-370px)] sm:px-10 lg:min-h-screen lg:px-12 xl:px-20">
        <div className="lg:hidden"><Brand /></div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10 lg:py-16">
          <p className="text-xs font-medium uppercase tracking-[.16em] text-muted-foreground">Welcome back</p>
          <h2 id="login-title" className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Sign in to CampusFlow</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the email and password from your campus invitation.</p>

          {configured ? <LoginForm action={signIn} message={message} /> : (
            <div role="status" className="mt-7 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Supabase setup is needed</p>
              <p className="mt-1 text-xs leading-5">Add your project URL and publishable key to <code>.env.local</code>, then restart the development server.</p>
            </div>
          )}

          <p className="mt-7 text-center text-xs text-muted-foreground">Need access? Ask your campus administrator for an invitation.</p>
        </div>
        <footer className="mx-auto w-full max-w-[400px] border-t border-border pt-4 text-center text-[11px] text-muted-foreground">Secure access for your campus community</footer>
      </section>
    </main>
  );
}
