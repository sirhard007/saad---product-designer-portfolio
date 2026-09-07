import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cms, uploadMedia } from './cms';
import Cover from './Cover';
export default function ProjectEditor({project,onSave,onCancel}:any) {
 const [form,setForm]=useState<any>({title:'',tag:'',description:'',content:'',client:'',year:String(new Date().getFullYear()),role:'',tools:'',industry:'',image:'',cover_type:'image',video_url:'',poster:'',published:false,featured:false,homepage_visible:true,sort_order:0,...project});
 const [media,setMedia]=useState<any[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{cms('/media').then(setMedia).catch(e=>setError(e.message));},[]);
 const change=(key:string,value:any)=>setForm((f:any)=>({...f,[key]:value}));
 async function upload(file?:File){if(!file)return;setBusy(true);setError('');try{const m=await uploadMedia(file);change(m.kind==='video'?'video_url':'image',m.url);change('cover_type',m.kind);setMedia(v=>[m,...v]);}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 async function save(e:any){e.preventDefault();setBusy(true);setError('');try{await onSave(form);}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 return <form onSubmit={save} className="cms-editor">
  <div className="cms-heading"><div><p className="cms-eyebrow">PROJECT EDITOR</p><h1>{project?'Edit project':'New project'}</h1></div><div className="cms-actions"><button type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="cms-primary" disabled={busy}>{busy?'Saving…':'Save project'}</button></div></div>
  {error&&<p role="alert" className="cms-error">{error}</p>}
  <div className="cms-editor-grid"><div><section className="cms-panel"><h2>Project information</h2><div className="cms-fields">
   {[['title','Project title'],['tag','Category'],['client','Client / company'],['year','Year'],['role','Your role'],['tools','Tools used'],['industry','Industry']].map(([key,label])=><label key={key}>{label}<input required={key==='title'} value={form[key]} onChange={e=>change(key,e.target.value)} maxLength={250}/></label>)}
   <label className="cms-wide">Short description<textarea value={form.description} onChange={e=>change('description',e.target.value)} maxLength={1000}/></label>
  </div></section><section className="cms-panel"><h2>Case study</h2><ReactQuill theme="snow" value={form.content} onChange={v=>change('content',v)}/></section></div>
  <aside><section className="cms-panel"><h2>Cover media</h2><label>Cover type<select value={form.cover_type} onChange={e=>change('cover_type',e.target.value)}><option value="image">Image</option><option value="video">Video</option></select></label>
  <div className="cms-cover-preview"><Cover key={`${form.image}${form.video_url}`} project={form} controls/></div>
  <label>Upload image or MP4<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" disabled={busy} onChange={e=>upload(e.target.files?.[0])}/></label><p className="cms-muted">Up to 4 MB per upload. Larger videos can use a direct video URL.</p>
  <label>{form.cover_type==='image'?'Image URL':'Video URL (direct MP4)'}<input value={form.cover_type==='image'?form.image:form.video_url} onChange={e=>change(form.cover_type==='image'?'image':'video_url',e.target.value)} placeholder="https://…"/></label>
  <label>Reuse library asset<select value="" onChange={e=>{const m=media.find(x=>x.id===e.target.value);if(m){change('cover_type',m.kind);change(m.kind==='video'?'video_url':'image',m.url);}}}><option value="">Choose media…</option>{media.map(m=><option key={m.id} value={m.id}>{m.name} ({m.kind})</option>)}</select></label>
  {form.cover_type==='video'&&<><label>Poster image URL<input value={form.poster} onChange={e=>change('poster',e.target.value)}/></label><label>Poster from library<select value="" onChange={e=>change('poster',e.target.value)}><option value="">Choose poster…</option>{media.filter(m=>m.kind==='image').map(m=><option key={m.id} value={m.url}>{m.name}</option>)}</select></label></>}
  </section><section className="cms-panel"><h2>Display settings</h2>{[['published','Published'],['featured','Featured project'],['homepage_visible','Show on homepage']].map(([key,label])=><label className="cms-check" key={key}><input type="checkbox" checked={form[key]} onChange={e=>change(key,e.target.checked)}/>{label}</label>)}<label>Display order<input type="number" min="-100000" max="100000" value={form.sort_order} onChange={e=>change('sort_order',Number(e.target.value))}/></label><p className="cms-muted">Lower numbers appear first. Unpublished projects are hidden from public pages.</p></section></aside></div>
 </form>;
}
