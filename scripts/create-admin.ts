import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '../api/security.js';
const {SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,ADMIN_USERNAME,ADMIN_PASSWORD,ADMIN_EMAIL}=process.env;
if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_USERNAME || !ADMIN_PASSWORD || (ADMIN_PASSWORD.length<12 || ADMIN_PASSWORD.length>256)) {
 throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USERNAME and an ADMIN_PASSWORD of at least 12 characters.');
}
if(!/^[a-z0-9_.-]{3,40}$/i.test(ADMIN_USERNAME)) throw new Error('Username must be 3–40 letters, numbers, dots, underscores or hyphens.');
const db=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY);
const {error}=await db.from('cms_admins').insert({username:ADMIN_USERNAME.toLowerCase(),email:ADMIN_EMAIL||'',password_hash:hashPassword(ADMIN_PASSWORD)});
if(error) throw new Error(error.message);
console.log('Admin created. Sign in with your configured username and password.');
