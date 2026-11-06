/** MANUAL ONLY. Creates/deletes synthetic fixtures on the explicitly pinned DEVELOPMENT project. */
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { loadTs } from './load-typescript.mjs';
import { matchesDevelopmentProject, allowedFixtureRequest } from './development-target.mjs';
const { readSupabaseConfig } = loadTs('lib/supabase/config.ts');
const { createInitialPayload } = loadTs('modules/etats-des-lieux/state.ts');
const { REVISION_CONFLICT_SQLSTATE } = loadTs('modules/etats-des-lieux/persistence.ts');
class CheckFailure extends Error {}
const ensure = (value, label) => { if (!value) throw new CheckFailure(label); };
ensure(process.argv.includes('--allow-development-writes'), 'Autorisation explicite requise : --allow-development-writes. Voir le rapport de phase 4.');
const config = readSupabaseConfig(process.env);
ensure(config && process.env.VERCEL_ENV !== 'production', 'Configuration de développement requise.');
ensure(matchesDevelopmentProject(config.url, process.env.TEAM_TEST_EXPECTED_PROJECT_REF),
  'Le projet ne correspond pas au projet de développement épinglé.');
const names = ['ADMIN', 'AGENT_A', 'AGENT_B', 'INACTIVE', 'NO_MEMBER'];
for (const name of names) ensure(process.env[`TEAM_TEST_${name}_EMAIL`] && process.env[`TEAM_TEST_${name}_PASSWORD`], 'Identifiants de recette manquants dans la configuration locale privée.');
const id = randomUUID(); let creationAttempted = false, creationConfirmed = false;
const client = () => createClient(config.url, config.publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: (input, init) => {
    ensure(allowedFixtureRequest(input, init, config.url, id), 'Requête hors du périmètre de recette : arrêt.');
    return fetch(input, { ...init, redirect: 'error', cache: 'no-store', signal: init?.signal ?? AbortSignal.timeout(15_000) });
  } },
});
const clients = Object.fromEntries(names.map(name => [name, client()]));
const anonymous = client();
const subjects = {};
let checks = 0;
const check = (value, label) => { ensure(value, label); checks++; };
const payload = createInitialPayload();
payload.data.reference = 'PHASE4-TEST'; payload.data.client = 'Donnée synthétique';
payload.data['entry-notes'] = 'Accents éàç\n  espaces  '; payload.data.guests = '';
payload.data.arriving = '2026-11-05'; payload.data['entry-date'] = '2026-11-05T16:30';
payload.checks.entree[12] = 'corriger'; payload.steps.sortie[6] = true; payload.accepted = true;
const save = (c, revision, p = payload) => c.rpc('save_inspection_dossier', { p_id: id, p_expected_revision: revision, p_payload: p });
const remove = (c, revision, confirmation = id) => c.rpc('delete_inspection_dossier', { p_id: id, p_expected_revision: revision, p_confirmation: confirmation });
const read = c => c.from('inspection_dossiers').select('*').eq('id', id);
const expectError = async (operation, code, label) => {
  const result = await operation;
  if (result.error?.code !== code) {
    const current = await read(clients.ADMIN);
    console.error(JSON.stringify({ check: label, expected_code: code, status: result.status,
      actual_code: /^[A-Za-z0-9_]+$/.test(result.error?.code ?? '') ? result.error.code : null,
      has_error: Boolean(result.error), current_revision: current.data?.[0]?.revision ?? null }));
  }
  check(result.error?.code === code, label);
};
let failed = false;
try {
  for (const name of names) {
    const c = clients[name];
    const result = await c.auth.signInWithPassword({ email: process.env[`TEAM_TEST_${name}_EMAIL`], password: process.env[`TEAM_TEST_${name}_PASSWORD`] });
    check(!result.error && result.data.user, `Connexion Auth de recette refusée : ${name}.`);
    const verified = await c.auth.getUser(); check(!verified.error && verified.data.user, `Identité Auth non vérifiée : ${name}.`);
    const claims = JSON.parse(Buffer.from(result.data.session.access_token.split('.')[1], 'base64url').toString());
    check(verified.data.user.email?.toLowerCase() === process.env[`TEAM_TEST_${name}_EMAIL`].trim().toLowerCase() &&
      claims.sub === verified.data.user.id && claims.iss === `${config.url}/auth/v1`, `Identité/projet inattendu : ${name}.`);
    subjects[name] = verified.data.user.id;
    const membership = await c.from('team_members').select('role,active').eq('user_id', verified.data.user.id);
    check(!membership.error && (name === 'INACTIVE' || name === 'NO_MEMBER'
      ? membership.data.length === 0 : membership.data.length === 1 && membership.data[0].active && membership.data[0].role === (name === 'ADMIN' ? 'admin' : 'agent')), `Préconditions de rôle incorrectes : ${name}.`);
  }
  check(new Set(Object.values(subjects)).size === names.length, 'Les cinq profils doivent utiliser des comptes distincts.');
  // Read only the five fixture memberships; never list or modify other members.
  for (const name of names) {
    const row = await clients.ADMIN.from('team_members').select('role,active').eq('user_id', subjects[name]);
    check(!row.error && (name === 'NO_MEMBER' ? row.data.length === 0 : row.data.length === 1 &&
      row.data[0].role === (name === 'ADMIN' ? 'admin' : 'agent') && row.data[0].active === (name !== 'INACTIVE')),
    `Rôle/statut du profil de recette incorrect : ${name}.`);
  }
  check((await read(clients.ADMIN)).data?.length === 0, 'UUID synthétique déjà présent : arrêt.');
  console.log(JSON.stringify({ synthetic_id: id, project_ref: new URL(config.url).hostname.split('.')[0] }));
  const deniedRead = await read(anonymous);
  check(deniedRead.error?.code === '42501' && [401, 403].includes(deniedRead.status), 'Refus de lecture anonyme non confirmé.');
  // Even an operation expected to be denied can commit if a security regression exists.
  // Track its UUID before sending it so that failure cleanup cannot miss it.
  creationAttempted = true;
  await expectError(save(anonymous, 0), '42501', 'Refus d’écriture anonyme non confirmé.');
  const first = await save(clients.AGENT_A, 0);
  check(!first.error && first.data?.[0]?.revision === 1, 'Création Agent refusée.'); creationConfirmed = true;
  const restored = await read(clients.AGENT_B);
  check(!restored.error && restored.data.length === 1, 'Lecture partagée refusée.');
  // jsonb object order is immaterial; the actual client restores original export order.
  const { parsePayload } = loadTs('modules/etats-des-lieux/persistence.ts');
  check(JSON.stringify(parsePayload(restored.data[0].payload)) === JSON.stringify(payload), 'Payload altéré.');
  const changed = structuredClone(payload); changed.data.reference = 'PHASE4-TEST-B';
  check((await save(clients.AGENT_B, 1, changed)).data?.[0]?.revision === 2, 'Modification inter-agents refusée.');
  const metadata = (await read(clients.ADMIN)).data?.[0];
  check(metadata?.created_by === subjects.AGENT_A && metadata?.updated_by === subjects.AGENT_B && metadata?.revision === 2, 'Métadonnées incorrectes.');
  await expectError(save(clients.AGENT_A, 1), REVISION_CONFLICT_SQLSTATE, 'Révision obsolète non refusée avec le code attendu.');
  const race = await Promise.all([save(clients.AGENT_A, 2), save(clients.AGENT_B, 2)]);
  check(race.filter(r => !r.error && r.data?.[0]?.revision === 3).length === 1 &&
    race.filter(r => r.error?.code === REVISION_CONFLICT_SQLSTATE).length === 1, 'Concurrence atomique incorrecte.');
  check((await save(clients.AGENT_A, 3, { ...payload, accepted: 'true' })).error?.code === '23514', 'Payload invalide accepté par PostgreSQL.');
  for (const name of ['INACTIVE', 'NO_MEMBER']) {
    const result = await read(clients[name]); check(!result.error && result.data.length === 0, `Lecture RLS autorisée : ${name}.`);
    check((await save(clients[name], 3)).error?.code === '42501', `Écriture RLS autorisée : ${name}.`);
    check((await remove(clients[name], 3)).error?.code === '42501', `Suppression RLS autorisée : ${name}.`);
  }
  check((await remove(clients.AGENT_A, 3)).error?.code === '42501', 'Suppression Agent via RPC autorisée.');
  for (const name of ['AGENT_A', 'ADMIN']) {
    const result = await clients[name].from('inspection_dossiers').delete().eq('id', id).select('id');
    check(!result.error && result.data.length === 0, 'DELETE direct sans confirmation autorisé.');
  }
  check((await read(clients.AGENT_B)).data?.[0]?.revision === 3, 'DELETE direct a altéré le dossier.');
  check((await save(clients.ADMIN, 3)).data?.[0]?.revision === 4, 'Sauvegarde Administrateur refusée.');
  check((await remove(clients.ADMIN, 4, randomUUID())).error?.code === '22023', 'Confirmation incorrecte acceptée.');
  check((await remove(clients.ADMIN, 3)).error?.code === REVISION_CONFLICT_SQLSTATE, 'Suppression avec révision obsolète acceptée.');
  const deleted = await remove(clients.ADMIN, 4); check(!deleted.error && deleted.data === id, 'Suppression Administrateur confirmée refusée.'); creationAttempted = false;
  check((await read(clients.AGENT_B)).data?.length === 0, 'Dossier encore présent après suppression.');
  for (const name of names) {
    check(!(await clients[name].auth.signOut({ scope: 'local' })).error, `Déconnexion refusée : ${name}.`);
    check(!(await clients[name].auth.getUser()).data.user, `Session conservée après déconnexion : ${name}.`);
  }
  console.log(`${checks} contrôles réels Supabase Auth/RLS/persistance réussis sur le projet de développement épinglé.`);
  console.log(JSON.stringify({ project_ref: new URL(config.url).hostname.split('.')[0], synthetic_id: id, cleaned: true }));
} catch (error) {
  failed = true; console.error(error instanceof CheckFailure ? error.message : 'Échec de la recette distante ; détails sensibles masqués.');
  console.error(JSON.stringify({ completed_checks: checks, synthetic_id: id }));
} finally {
  if (creationAttempted) {
    try {
      const current = await read(clients.ADMIN);
      ensure(!current.error, 'État de la création non vérifiable.');
      if (current.data?.length) {
        const result = await remove(clients.ADMIN, current.data[0].revision);
        ensure(!result.error && result.data === id, 'Nettoyage non confirmé.');
      }
      const after = await read(clients.ADMIN);
      ensure(!after.error && after.data.length === 0, 'Absence après nettoyage non confirmée.');
      console.log(JSON.stringify({ synthetic_id: id, cleanup_verified: true }));
      // A lost creation receipt may precede a delayed commit. Never hide its UUID.
      if (!creationConfirmed) console.error(`Création non confirmée : vérifier ultérieurement le dossier synthétique ${id}.`);
    } catch {
      failed = true;
      console.error(`Dossier synthétique à vérifier/nettoyer manuellement : ${id}`);
    }
  }
  for (const c of Object.values(clients)) await c.auth.signOut({ scope: 'local' }).catch(() => {});
}
if (failed) process.exitCode = 1;
