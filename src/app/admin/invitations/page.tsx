import Link from 'next/link';
import { signOut } from '@/app/login/actions';
import { InvitationForm } from '@/components/auth/InvitationForm';
import { requireCampusProfile } from '@/lib/supabase/profile';

export const dynamic = 'force-dynamic';

export default async function InvitationsPage() {
  const profile = await requireCampusProfile();
  if (profile.role !== 'institution_admin') {
    return <main className="mx-auto max-w-xl p-8"><h1 className="text-xl font-semibold">Campus admin access required</h1><Link href="/" className="mt-4 inline-block text-sm underline">Return to CampusFlow</Link></main>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4"><div><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← CampusFlow</Link><h1 className="mt-5 text-2xl font-semibold tracking-tight">Invite campus members</h1><p className="mt-2 text-sm text-muted-foreground">Invitations are limited to your institution. Role access is assigned here and cannot be selected by the invitee.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Supabase’s built-in email service allows up to 2 emails per hour. Configure custom SMTP in Supabase if you need to send more.</p></div><form action={signOut}><button className="rounded-lg border border-border px-3 py-2 text-xs font-medium">Sign out</button></form></div>
        <InvitationForm />
      </div>
    </main>
  );
}
