'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function setPassword(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');
  if (password.length < 8 || password !== confirmation) redirect('/auth/set-password?message=Use%20at%20least%208%20characters%20and%20make%20both%20passwords%20match.');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?message=Open%20the%20invitation%20link%20to%20set%20your%20password.');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect('/auth/set-password?message=Password%20could%20not%20be%20updated.%20Try%20again.');
  redirect('/');
}
