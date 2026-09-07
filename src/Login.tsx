import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './admin.css';
export default function Login(){
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);const navigate=useNavigate();
 async function submit(e:any){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const d=await r.json();if(!r.ok)throw new Error(d.error);localStorage.setItem('adminToken',d.token);navigate('/admin');}catch(e:any){setError(e.message||'Cannot connect to the server.');}finally{setBusy(false);}}
 return <main className="cms cms-login"><form className="cms-panel" onSubmit={submit}><Link to="/" className="cms-brand">SA<span>Saadux</span></Link><p className="cms-eyebrow">PORTFOLIO STUDIO</p><h1>Welcome back.</h1><p className="cms-muted">Sign in to manage your work.</p><label>Username<input autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert" className="cms-error">{error}</p>}<button className="cms-primary" disabled={busy}>{busy?'Signing in…':'Sign in'}</button><Link to="/">Return to portfolio ↗</Link></form></main>;
}
