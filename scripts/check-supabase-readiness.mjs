/** Read-only diagnostics. Never signs in, sends mail or changes remote state. */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.log('Required Supabase variables are absent.');
  process.exitCode = 2;
} else {
  try {
    const target = new URL(url);
    if (target.protocol !== 'https:' || !target.hostname.endsWith('.supabase.co') ||
      target.username || target.password || target.search || target.hash ||
      !key.startsWith('sb_publishable_')) throw new Error('invalid-config');
    const request = path => fetch(new URL(path, target.origin), {
      headers: { apikey: key }, redirect: 'error', signal: AbortSignal.timeout(15000),
    });
    const health = await request('/auth/v1/health');
    console.log('Read-only Supabase health HTTP status:', health.status);
    if (!health.ok) process.exitCode = 1;
    else {
      const settings = await request('/auth/v1/settings');
      console.log('Read-only Auth settings HTTP status:', settings.status);
      if (settings.ok) {
        const value = await settings.json();
        console.log('Public signup disabled:', typeof value.disable_signup === 'boolean' ? value.disable_signup : 'unknown; inspect dashboard');
      }
      const table = await request('/rest/v1/team_members?select=user_id&limit=0');
      console.log('Read-only anonymous table probe HTTP status:', table.status);
      console.log('This probe does not validate RLS or a member session.');
    }
  } catch (error) {
    // Only error classifications; no URLs, keys, credentials or provider bodies.
    const causes = [error, error?.cause, error?.cause?.cause];
    console.log('Read-only Supabase check failed:', {
      errorType: error?.name,
      proxyDenied: causes.some(e => /403|proxy|tunnel/i.test(String(e?.message))),
      invalidConfig: error?.message === 'invalid-config',
    });
    process.exitCode = 1;
  }
}
