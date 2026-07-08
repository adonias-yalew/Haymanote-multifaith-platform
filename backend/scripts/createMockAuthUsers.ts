/**
 * createMockAuthUsers.ts
 *
 * Creates Supabase Auth entries for all 10 mock users using the Admin API.
 * This is more reliable than direct SQL INSERT into auth.users.
 *
 * Usage: npx tsx scripts/createMockAuthUsers.ts
 * Prerequisite: .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MOCK_USERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', email: 'dawit.hailu@mail.haymanote.com',    role: 'user',   religion: 'orthodox' },
  { id: 'a0000000-0000-0000-0000-000000000002', email: 'abune.germame@mail.haymanote.com',   role: 'leader', religion: 'orthodox' },
  { id: 'a0000000-0000-0000-0000-000000000003', email: 'kidus.maket@mail.haymanote.com',     role: 'vendor', religion: 'orthodox' },
  { id: 'b0000000-0000-0000-0000-000000000001', email: 'amina.hassan@mail.haymanote.com',    role: 'user',   religion: 'muslim' },
  { id: 'b0000000-0000-0000-0000-000000000002', email: 'sheikh.ahmed@mail.haymanote.com',    role: 'leader', religion: 'muslim' },
  { id: 'b0000000-0000-0000-0000-000000000003', email: 'halal.goods@mail.haymanote.com',     role: 'vendor', religion: 'muslim' },
  { id: 'c0000000-0000-0000-0000-000000000001', email: 'sara.tadesse@mail.haymanote.com',    role: 'user',   religion: 'protestant' },
  { id: 'c0000000-0000-0000-0000-000000000002', email: 'pastor.markos@mail.haymanote.com',   role: 'leader', religion: 'protestant' },
  { id: 'c0000000-0000-0000-0000-000000000003', email: 'grace.books@mail.haymanote.com',     role: 'vendor', religion: 'protestant' },
  { id: 'd0000000-0000-0000-0000-000000000001', email: 'admin@mail.haymanote.com',           role: 'admin',  religion: 'orthodox' },
];

const PASSWORD = 'Pass@123!';

async function main() {
  // 1. Sync public.users emails
  console.log('=== Step 1: Sync public.users emails ===');
  const { data: existing } = await supabase.from('users').select('id, email');
  if (existing) {
    for (const user of MOCK_USERS) {
      const match = existing.find(u => u.id === user.id);
      if (match && match.email !== user.email) {
        const { error } = await supabase.from('users').update({ email: user.email }).eq('id', user.id);
        if (error) console.error(`  FAIL ${match.email}: ${error.message}`);
        else console.log(`  ${match.email} -> ${user.email}`);
      }
    }
  }

  // 2. Create/ensure auth users (skip if already registered)
  console.log('\n=== Step 2: Create auth users ===');
  let created = 0, skipped = 0, failed = 0;
  for (const user of MOCK_USERS) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { role: user.role, religion: user.religion },
    });
    if (!error) {
      created++;
    } else if (error.message?.toLowerCase().includes('already been registered')) {
      skipped++;
    } else {
      failed++;
      console.error(`  FAIL ${user.email}: ${error.message}`);
    }
  }
  console.log(`  Created: ${created}, Already exists: ${skipped}, Failed: ${failed}`);

  // 3. Verify all 10 logins work
  console.log('\n=== Step 3: Verify logins ===');
  const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  let ok = 0, bad = 0;
  for (const user of MOCK_USERS) {
    const r = await anon.auth.signInWithPassword({ email: user.email, password: PASSWORD });
    if (r.error) { bad++; console.error(`  FAIL ${user.email}: ${r.error.message}`); }
    else ok++;
  }
  console.log(`  Login OK: ${ok}, Failed: ${bad}`);

  if (ok === MOCK_USERS.length) {
    console.log('\n✅ All mock auth users ready! Password: Pass@123!');
    console.log('   Example login: dawit.hailu@mail.haymanote.com');
  }
}

main().catch(console.error);
