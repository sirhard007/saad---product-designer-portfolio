import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { hashPassword, verifyPassword } from '../api/security.js';

test('passwords use unique salts and reject incorrect or malformed credentials', () => {
 const a=hashPassword('a long test password');
 assert.notEqual(a,hashPassword('a long test password'));
 assert.equal(verifyPassword('a long test password',a),true);
 assert.equal(verifyPassword('incorrect',a),false);
 assert.equal(verifyPassword('incorrect','broken'),false);
 assert.equal(verifyPassword('incorrect','a'.repeat(32)+':'+ 'z'.repeat(128)),false);
});

test('CMS authorization, publishing and sanitization contracts', async () => {
 process.env.SUPABASE_URL='https://cms-test.example';
 process.env.SUPABASE_SERVICE_ROLE_KEY='test-service-key';
 process.env.JWT_SECRET='test-only-secret-that-is-at-least-32-characters';
 const realFetch=globalThis.fetch;
 const admin={id:'00000000-0000-4000-8000-000000000001',username:'owner',password_hash:hashPassword(' secure password '),session_version:1};
 let analyticsEnabled=false, eventInserts=0;
 const project={id:1,title:'Published',published:true,homepage_visible:true,content:'<p>Safe</p><script>alert(1)</script><img src="/image.png" onerror="alert(1)">'};
 globalThis.fetch=async(input:any,init?:any)=>{
  const url=new URL(typeof input==='string'?input:input.url);
  if(url.hostname!=='cms-test.example')return realFetch(input,init);
  const respond=(data:any)=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
  if(url.pathname.endsWith('/rpc/cms_rate_limit'))return respond(true);
  if(url.pathname.endsWith('/cms_admins'))return respond(admin);
  if(url.pathname.endsWith('/cms_settings'))return respond({analytics_enabled:analyticsEnabled});
  if(url.pathname.endsWith('/cms_events')){eventInserts++;return respond(null);}
  if(url.pathname.endsWith('/cms_websites')){
   assert.equal(url.searchParams.get('published'),'eq.true','Public website queries must filter out hidden entries');
   return respond([{id:'website-1',title:'Live website',published:true,preview_type:'video'}]);
  }
  if(url.pathname.endsWith('/projects')){
   assert.equal(url.searchParams.get('published'),'eq.true','Public queries must filter out drafts');
   if(url.searchParams.has('id'))return respond(url.searchParams.get('id')==='eq.1'?project:null);
   assert.equal(url.searchParams.get('homepage_visible'),'eq.true');
   return respond([project]);
  }
  throw new Error('Unexpected database request: '+url.pathname);
 };
 const {default:app}=await import('../api/index.js');
 const request=(path:string,body?:any,token?:string)=>new Promise<any>((resolve,reject)=>{
  const req:any=new IncomingMessage(new Socket());req.url='/api'+path;req.method=body?'POST':'GET';req.body=body||{};req.headers=token?{authorization:'Bearer '+token}:{};
  const res:any=new ServerResponse(req);
  res.end=(chunk:any)=>{resolve({status:res.statusCode,json:async()=>JSON.parse(String(chunk||'null'))});return res;};
  app(req,res,reject);
 });
 try {
  assert.equal((await request('/admin/projects')).status,401);
  assert.equal((await request('/login',{username:'owner',password:'wrong'})).status,401);
  const login=await request('/login',{username:'owner',password:' secure password '});
  assert.equal(login.status,200);const {token}=await login.json();
  assert.equal((await request('/verify',undefined,token)).status,200);
  admin.session_version++;
  assert.equal((await request('/verify',undefined,token)).status,401);
  const projects=await (await request('/projects?homepage=true')).json();
  assert.equal(projects.length,1);assert.ok(!projects[0].content.includes('script'));assert.ok(!projects[0].content.includes('onerror'));assert.ok(projects[0].content.includes('/image.png'));
  const websites=await (await request('/websites')).json();assert.equal(websites.length,1);assert.equal(websites[0].preview_type,'video');
  assert.equal((await request('/projects/2')).status,404);
  assert.equal((await request('/events',{event:'page_view'})).status,204);
  assert.equal(eventInserts,0);
  analyticsEnabled=true;
  assert.equal((await request('/events',{event:'page_view',path:'/admin'})).status,400);
  assert.equal(eventInserts,0);
 } finally { globalThis.fetch=realFetch; }
});
