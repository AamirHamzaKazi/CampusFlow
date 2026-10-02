import { setPassword } from './actions';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <main className="mx-auto max-w-lg p-8 text-center"><h1 className="text-xl font-semibold">Open your campus invitation first</h1><p className="mt-2 text-sm text-muted-foreground">This page needs the secure sign-in session from your invitation email.</p></main>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <form action={setPassword} className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-7 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Set your password</h1>
        <p className="text-sm text-muted-foreground">Choose a password of at least 8 characters for {user.email}.</p>
        <label className="block space-y-1.5 text-sm font-medium text-foreground">New password<input name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
        <label className="block space-y-1.5 text-sm font-medium text-foreground">Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
        {message && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{message}</p>}
        <button className="h-11 w-full rounded-lg bg-foreground text-sm font-semibold text-background hover:opacity-90">Save password</button>
      </form>
    </main>
  );
}
