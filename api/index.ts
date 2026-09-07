import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';
import { createHash } from 'node:crypto';
import { hashPassword, verifyPassword } from './security.js';
dotenv.config();
const app=express();
app.use(express.json({limit:'2mb'}));
const db=process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
 ? createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}) : null;
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
const secret=process.env.JWT_SECRET;
const api=express.Router();
const run=(fn:any)=>(req:any,res:any,next:any)=>Promise.resolve(fn(req,res,next)).catch(next);
const requireDb=(req:any,res:any,next:any)=>db?next():res.status(503).json({error:'CMS database is not configured. Complete the CMS setup.'});
api.use(requireDb);
const result=(r:any)=>{if(r.error) throw new Error(r.error.message); return r.data;};
const cleanContent=(html:string)=>sanitizeHtml(html,{allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img']),allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,img:['src','alt','width','height'],p:['class'],span:['class']},allowedClasses:{p:['ql-align-center','ql-align-right','ql-align-justify','ql-indent-*'],span:['ql-size-small','ql-size-large','ql-size-huge']}});
const cleanProject=(p:any)=>({...p,content:cleanContent(p.content||'')});
function validUrl(value:any, optional=true) {
 if(!value && optional) return '';
 if(typeof value!=='string') throw new Error('Invalid media URL');
 if(value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return value;
 const u=new URL(value); if(!['https:','http:'].includes(u.protocol)) throw new Error('Use an HTTP or HTTPS URL'); return value;
}
function text(v:any,max=500) { return typeof v==='string'?v.trim().slice(0,max):''; }
async function rate(req:any,scope:string,maximum:number,seconds:number) {
 const address=process.env.VERCEL?req.headers['x-vercel-forwarded-for']:req.socket.remoteAddress;
 const key=scope+':'+createHash('sha256').update(String(address||'unknown')).digest('hex');
 return result(await db!.rpc('cms_rate_limit',{bucket:key,maximum,window_seconds:seconds}));
}
const protect=run(async(req:any,res:any,next:any)=>{
 if(!secret || secret.length<32) return res.status(503).json({error:'Configure a JWT_SECRET of at least 32 characters.'});
 try {
  const token=String(req.headers.authorization||'').replace(/^Bearer /,'');
  const claims=jwt.verify(token,secret,{algorithms:['HS256']}) as any;
  const admin=result(await db!.from('cms_admins').select('*').eq('id',claims.sub).single());
  if(claims.version!==admin.session_version) throw new Error('Expired');
  req.admin=admin;
 } catch { return res.status(401).json({error:'Your session expired. Please sign in again.'}); }
 // Express middleware continues only after database authorization.
 next();
});

const publicProfile=(a:any)=>({id:a.id,username:a.username,email:a.email,avatar_url:a.avatar_url,created_at:a.created_at,last_login:a.last_login});
api.post('/login',run(async(req:any,res:any)=>{
 if(!secret || secret.length<32) return res.status(503).json({error:'Admin authentication is not configured.'});
 if(!await rate(req,'login',10,900)) return res.status(429).json({error:'Too many attempts. Try again in 15 minutes.'});
 const username=text(req.body.username,40).toLowerCase(), password=typeof req.body.password==='string'?req.body.password.slice(0,256):'';
 const {data:a,error}=await db!.from('cms_admins').select('*').eq('username',username).maybeSingle();
 if(error) throw new Error(error.message);
 const valid=verifyPassword(password,a?.password_hash||'00000000000000000000000000000000:'+ '0'.repeat(128));
 if(!a || !valid) return res.status(401).json({error:'Incorrect username or password.'});
 result(await db!.from('cms_admins').update({last_login:new Date().toISOString()}).eq('id',a.id));
 res.json({token:jwt.sign({version:a.session_version},secret,{subject:a.id,expiresIn:'8h',algorithm:'HS256'})});
}));
api.get('/verify',protect,(_req,res)=>res.json({valid:true}));
api.get('/profile',protect,(req:any,res)=>res.json(publicProfile(req.admin)));
api.put('/profile',protect,run(async(req:any,res:any)=>{
 const username=text(req.body.username,40).toLowerCase(),email=text(req.body.email,254);
 if(!/^[a-z0-9_.-]{3,40}$/.test(username) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return res.status(400).json({error:'Enter a valid username and email.'});
 const update:any={username,email,avatar_url:validUrl(req.body.avatar_url)};
 if(req.body.new_password){
  if(!await rate(req,'password',10,900)) return res.status(429).json({error:'Try again in 15 minutes.'});
  if(!verifyPassword(String(req.body.current_password||''),req.admin.password_hash)) return res.status(400).json({error:'Current password is incorrect.'});
  if(typeof req.body.new_password!=='string' || req.body.new_password.length<12 || req.body.new_password.length>256) return res.status(400).json({error:'Use a password of 12–256 characters.'});
  update.password_hash=hashPassword(req.body.new_password);update.session_version=req.admin.session_version+1;
 }
 const a=result(await db!.from('cms_admins').update(update).eq('id',req.admin.id).select('*').single());
 res.json({...publicProfile(a),reauthenticate:!!update.password_hash});
}));
api.get('/projects',run(async(req:any,res:any)=>{
 let query=db!.from('projects').select('*').eq('published',true);
 if(req.query.homepage==='true') query=query.eq('homepage_visible',true);
 res.json(result(await query.order('sort_order').order('id',{ascending:false})).map(cleanProject));
}));
api.get('/projects/:id',run(async(req:any,res:any)=>{
 const {data,error}=await db!.from('projects').select('*').eq('published',true).eq('id',req.params.id).maybeSingle();
 if(error) throw new Error(error.message);if(!data)return res.status(404).json({error:'Project not found'});res.json(cleanProject(data));
}));
api.get('/admin/projects',protect,run(async(_req:any,res:any)=>res.json(result(await db!.from('projects').select('*').order('sort_order').order('id',{ascending:false})))));
function projectInput(b:any){
 if(!text(b.title,160))throw new Error('A project title is required.');
 const p:any={};
 for(const k of ['title','description','tag','year','client','role','tools','industry'])p[k]=text(b[k],k==='description'?1000:250);
 p.content=cleanContent(text(b.content,500000));p.size=b.size==='large'?'large':'small';
 p.cover_type=b.cover_type==='video'?'video':'image';
 for(const k of ['image','video_url','poster'])p[k]=validUrl(b[k]);
 if(p.cover_type==='video'&&!p.video_url)throw new Error('Add a video URL or upload a video.');
 p.featured=b.featured===true;p.homepage_visible=b.homepage_visible!==false;p.published=b.published===true;
 p.sort_order=Number.isInteger(Number(b.sort_order))?Math.max(-100000,Math.min(100000,Number(b.sort_order))):0;
 return p;
}
api.post('/projects',protect,run(async(req:any,res:any)=>res.json(result(await db!.from('projects').insert(projectInput(req.body)).select('*').single()))));
api.put('/projects/:id',protect,run(async(req:any,res:any)=>res.json(result(await db!.from('projects').update(projectInput(req.body)).eq('id',req.params.id).select('*').single()))));
api.delete('/projects/:id',protect,run(async(req:any,res:any)=>{result(await db!.from('projects').delete().eq('id',req.params.id));res.json({success:true});}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:4*1024*1024},fileFilter:(_req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp','video/mp4'].includes(file.mimetype))});
api.get('/media',protect,run(async(_req:any,res:any)=>res.json(result(await db!.from('cms_media').select('*').order('created_at',{ascending:false})))));
api.post('/upload',protect,upload.single('image'),run(async(req:any,res:any)=>{
 const f=req.file;if(!f)return res.status(400).json({error:'Choose JPG, PNG, WEBP or MP4 (maximum 4 MB). Use a video URL for larger videos.'});
 const bytes=f.buffer;
 const actual=bytes[0]===0xff&&bytes[1]===0xd8?'image/jpeg':bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'image/webp':bytes.toString('ascii',4,8)==='ftyp'?'video/mp4':'';
 if(actual!==f.mimetype)return res.status(400).json({error:'File content does not match its format.'});
 const kind=actual==='video/mp4'?'video':'image';
 const uploaded:any=await new Promise((resolve,reject)=>cloudinary.uploader.upload_stream({folder:'portfolio',resource_type:kind},(e,r)=>e?reject(e):resolve(r)).end(bytes));
 const saved=await db!.from('cms_media').insert({name:text(f.originalname,160),url:uploaded.secure_url,public_id:uploaded.public_id,kind,bytes:f.size}).select('*').single();
 if(saved.error){await cloudinary.uploader.destroy(uploaded.public_id,{resource_type:kind});throw new Error(saved.error.message);}
 res.json(saved.data);
}));
api.delete('/media/:id',protect,run(async(req:any,res:any)=>{
 const m=result(await db!.from('cms_media').select('*').eq('id',req.params.id).single());
 const projects=result(await db!.from('projects').select('image,video_url,poster,content'));
 const profiles=result(await db!.from('cms_admins').select('avatar_url'));
 const settings=result(await db!.from('cms_settings').select('resume_url').eq('id',1).single());
 if(projects.some((p:any)=>[p.image,p.video_url,p.poster].includes(m.url)||String(p.content).includes(m.url))||profiles.some((p:any)=>p.avatar_url===m.url)||settings.resume_url===m.url)return res.status(409).json({error:'This media is in use. Remove its references before deleting.'});
 const deleted=await cloudinary.uploader.destroy(m.public_id,{resource_type:m.kind});
 if(!['ok','not found'].includes(deleted.result))throw new Error('The file could not be deleted.');
 result(await db!.from('cms_media').delete().eq('id',m.id));res.json({success:true});
}));
api.get('/settings',run(async(_req:any,res:any)=>res.json(result(await db!.from('cms_settings').select('*').eq('id',1).single()))));
api.put('/settings',protect,run(async(req:any,res:any)=>{
 const contact_email=text(req.body.contact_email,254);
 if(contact_email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email))return res.status(400).json({error:'Enter a valid contact email.'});
 res.json(result(await db!.from('cms_settings').update({contact_email,resume_url:validUrl(req.body.resume_url),analytics_enabled:req.body.analytics_enabled===true}).eq('id',1).select('*').single()));
}));
api.get('/messages',protect,run(async(_req:any,res:any)=>res.json(result(await db!.from('cms_messages').select('*').order('created_at',{ascending:false})))));
api.patch('/messages/:id',protect,run(async(req:any,res:any)=>{result(await db!.from('cms_messages').update({status:req.body.status==='read'?'read':'unread'}).eq('id',req.params.id));res.json({success:true});}));
api.post('/messages',run(async(req:any,res:any)=>{
 if(!await rate(req,'message',5,3600))return res.status(429).json({error:'Too many messages. Please try later.'});
 const name=text(req.body.name,100),email=text(req.body.email,254),message=text(req.body.message,5000);
 if(!name||!message||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Complete your name, email and message.'});
 result(await db!.from('cms_messages').insert({name,email,message}));res.status(201).json({success:true});
}));
const events=['page_view','project_view','project_click','live_click','resume_download','contact_click'];
api.post('/events',run(async(req:any,res:any)=>{
 const settings=result(await db!.from('cms_settings').select('analytics_enabled').eq('id',1).single());
 if(!settings.analytics_enabled)return res.sendStatus(204);
 if(!events.includes(req.body.event)||!/^\/[a-zA-Z0-9/_-]*$/.test(req.body.path)||/^\/(admin|login)/.test(req.body.path))return res.sendStatus(400);
 if(!await rate(req,'events',240,60))return res.sendStatus(429);
 const visitor=text(req.body.visitor,80),session=text(req.body.session,80);
 if(!/^[a-z0-9-]{16,80}$/i.test(visitor)||!/^[a-z0-9-]{16,80}$/i.test(session))return res.sendStatus(400);
 // Geographic headers are trusted only on Vercel. Never infer a location locally.
 const country=process.env.VERCEL?text(req.headers['x-vercel-ip-country'],80):null;
 const city=process.env.VERCEL?text(req.headers['x-vercel-ip-city'],120):null;
 result(await db!.from('cms_events').insert({visitor,session,event:req.body.event,path:req.body.path,target:text(req.body.target,200),device:['Desktop','Mobile','Tablet'].includes(req.body.device)?req.body.device:'Desktop',source:['Direct','Search','Social','Referral'].includes(req.body.source)?req.body.source:'Direct',country,city}));
 res.sendStatus(204);
}));
api.get('/analytics',protect,run(async(req:any,res:any)=>{
 const days=[7,30,90].includes(Number(req.query.days))?Number(req.query.days):30;
 const since=new Date();since.setUTCHours(0,0,0,0);since.setUTCDate(since.getUTCDate()-days+1);
 let rows:any[]=[];
 for(let from=0;;from+=1000){const page=result(await db!.from('cms_events').select('*').gte('created_at',since.toISOString()).order('id').range(from,from+999));rows.push(...page);if(page.length<1000)break;}
 const views=rows.filter(r=>r.event==='page_view');
 const group=(items:any[],field:string)=>Object.entries(items.reduce((a:any,r:any)=>{const k=r[field]||'Unavailable';a[k]=(a[k]||0)+1;return a;},{})).map(([label,value])=>({label,value})).sort((a:any,b:any)=>b.value-a.value);
 const trend=Array.from({length:days},(_,i)=>{const d=new Date(since);d.setUTCDate(d.getUTCDate()+i);const date=d.toISOString().slice(0,10);const day=views.filter(r=>r.created_at.slice(0,10)===date);return {date,views:day.length,visitors:new Set(day.map(r=>r.visitor)).size};});
 const uniqueVisits=Array.from(new Map(views.map(r=>[r.visitor,r])).values());
 res.json({days,totalVisitors:new Set(views.map(r=>r.session)).size,uniqueVisitors:new Set(views.map(r=>r.visitor)).size,pageViews:views.length,trend,pages:group(views,'path'),projects:group(rows.filter(r=>r.event==='project_view'),'target'),actions:events.filter(e=>!['page_view','project_view'].includes(e)).map(label=>({label,value:rows.filter(r=>r.event===label).length})),projectViews:rows.filter(r=>r.event==='project_view').length,devices:group(uniqueVisits,'device'),sources:group(uniqueVisits,'source'),countries:group(uniqueVisits,'country'),cities:group(uniqueVisits,'city')});
}));
app.use('/api',api);
app.use('/api',(_req,res)=>res.status(404).json({error:'API route not found'}));
app.use('/api',(err:any,_req:any,res:any,_next:any)=>{console.error('CMS:',err.message);res.status(err.code==='LIMIT_FILE_SIZE'?413:500).json({error:err.code==='LIMIT_FILE_SIZE'?'File is too large. Maximum upload is 4 MB; use a URL for larger videos.':err.message||'Request failed.'});});
export default app;
