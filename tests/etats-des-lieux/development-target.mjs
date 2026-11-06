/** Exact development-project pin; never infer the target from the supplied URL. */
export function matchesDevelopmentProject(value, expected) {
  if (typeof expected !== 'string') return false;
  const match = /^([a-z0-9]+)(?:\.supabase\.co)?$/.exec(expected.trim());
  if (!match) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === `${match[1]}.supabase.co` &&
      !url.port && !url.username && !url.password && !url.search && !url.hash && url.pathname === '/';
  } catch { return false; }
}

/** The manual suite may mutate only its generated dossier and its own Auth sessions. */
export function allowedFixtureRequest(value, init, origin, id) {
  try {
    const url = new URL(typeof value === 'string' ? value : value.url ?? String(value));
    if (url.origin !== origin) return false;
    const method = (init?.method ?? 'GET').toUpperCase();
    if (method === 'GET') return url.pathname === '/auth/v1/user' ||
      (url.pathname === '/rest/v1/team_members' && /^eq\.[0-9a-f-]{36}$/i.test(url.searchParams.get('user_id') ?? '')) ||
      (url.pathname === '/rest/v1/inspection_dossiers' && url.searchParams.get('id') === `eq.${id}`);
    if (method === 'DELETE') return url.pathname === '/rest/v1/inspection_dossiers' && url.searchParams.get('id') === `eq.${id}`;
    if (method !== 'POST') return false;
    if (url.pathname === '/auth/v1/token') return url.searchParams.get('grant_type') === 'password';
    if (url.pathname === '/auth/v1/logout') return url.searchParams.get('scope') === 'local';
    return ['/rest/v1/rpc/save_inspection_dossier', '/rest/v1/rpc/delete_inspection_dossier'].includes(url.pathname) &&
      JSON.parse(init.body).p_id === id;
  } catch { return false; }
}
