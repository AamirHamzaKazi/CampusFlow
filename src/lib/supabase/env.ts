const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(projectUrl && publishableKey);
}

export function getSupabasePublicEnv() {
  if (!projectUrl || !publishableKey) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env.local and add your project URL and publishable key.',
    );
  }

  return { url: projectUrl, publishableKey };
}

export function getSupabaseSecretKey() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Supabase invitations are not configured. Add SUPABASE_SECRET_KEY as a server-only environment variable.');
  }

  return secretKey;
}
