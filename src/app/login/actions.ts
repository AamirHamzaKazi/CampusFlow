'use server';

import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) redirect('/login?message=Supabase%20configuration%20is%20missing.');
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) redirect('/login?message=Enter%20your%20email%20and%20password.');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?message=Sign-in%20failed.%20Check%20your%20credentials%20or%20contact%20your%20campus%20admin.');
  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
