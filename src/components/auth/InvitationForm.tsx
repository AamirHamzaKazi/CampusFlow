'use client';

import { FormEvent, useState } from 'react';
import { CampusRole } from '@/types';

const roles: { value: CampusRole; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'department_head', label: 'Department head' },
  { value: 'facility_manager', label: 'Facility manager' },
  { value: 'institution_admin', label: 'Campus admin' },
];

export function InvitationForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), fullName: form.get('fullName'), department: form.get('department'), role: form.get('role') }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Invitation failed.');
      setError(false);
      setMessage(`Invitation sent to ${result.email}.`);
      formElement.reset();
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : 'Invitation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 max-w-xl space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <label className="block space-y-1.5 text-sm font-medium">Full name<input name="fullName" required minLength={2} maxLength={120} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
      <label className="block space-y-1.5 text-sm font-medium">Campus email<input name="email" type="email" required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
      <label className="block space-y-1.5 text-sm font-medium">Department<input name="department" maxLength={120} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" /></label>
      <label className="block space-y-1.5 text-sm font-medium">Role<select name="role" required className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal">{roles.map((role) => <option value={role.value} key={role.value}>{role.label}</option>)}</select></label>
      {message && <p role={error ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message}</p>}
      <button disabled={busy} className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-50">{busy ? 'Sending invitation…' : 'Send invitation'}</button>
    </form>
  );
}
