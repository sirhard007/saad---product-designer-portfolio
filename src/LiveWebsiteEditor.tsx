import { useEffect, useState } from 'react';
import { cms, uploadMedia } from './cms';

const emptyWebsite={title:'',category:'',description:'',url:'',preview_type:'image',image_url:'',video_url:'',poster_url:'',accent:'#159c91',published:false,sort_order:0};

export default function LiveWebsiteEditor({website,onSave,onCancel}:any){
 const [form,setForm]=useState<any>({...emptyWebsite,...website});
 const [media,setMedia]=useState<any[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{cms('/media').then(setMedia).catch(e=>setError(e.message));},[]);
 const change=(key:string,value:any)=>setForm((current:any)=>({...current,[key]:value}));
 async function upload(file?:File,poster=false){
  if(!file)return;
  setBusy(true);setError('');
  try{
   const item=await uploadMedia(file);setMedia(current=>[item,...current]);
   if(poster){if(item.kind!=='image')throw new Error('The poster must be an image.');change('poster_url',item.url);}
   else {change('preview_type',item.kind);change(item.kind==='video'?'video_url':'image_url',item.url);}
  }catch(e:any){setError(e.message);}finally{setBusy(false);}
 }
 async function save(e:any){e.preventDefault();setBusy(true);setError('');try{await onSave(form);}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 const selectedUrl=form.preview_type==='video'?form.video_url:form.image_url;
 return <form className="cms-editor" onSubmit={save}>
  <div className="cms-heading"><div><p className="cms-eyebrow">LIVE WEBSITE EDITOR</p><h1>{website?'Edit website':'New website'}</h1></div><div className="cms-actions"><button type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="cms-primary" disabled={busy}>{busy?'Saving…':'Save website'}</button></div></div>
  {error&&<p role="alert" className="cms-error">{error}</p>}
  <div className="cms-editor-grid"><div><section className="cms-panel"><h2>Website information</h2><div className="cms-fields">
   <label>Website title<input required maxLength={160} value={form.title} onChange={e=>change('title',e.target.value)}/></label>
   <label>Category<input maxLength={250} value={form.category} onChange={e=>change('category',e.target.value)} placeholder="Fitness & wellness website"/></label>
   <label className="cms-wide">Live website URL<input required type="url" value={form.url} onChange={e=>change('url',e.target.value)} placeholder="https://example.com"/></label>
   <label className="cms-wide">Short description<textarea maxLength={1000} value={form.description} onChange={e=>change('description',e.target.value)}/></label>
  </div></section></div>
  <aside><section className="cms-panel"><h2>Website preview</h2>
   <label>Preview type<select value={form.preview_type} onChange={e=>change('preview_type',e.target.value)}><option value="image">Image</option><option value="video">Video</option></select></label>
   <div className="cms-cover-preview">{selectedUrl?(form.preview_type==='video'?<video key={selectedUrl} src={selectedUrl} poster={form.poster_url||undefined} autoPlay muted loop playsInline controls preload="metadata"/>:<img src={selectedUrl} alt={`${form.title||'Website'} preview`}/>):<div className="cover-empty">No preview selected</div>}</div>
   <label>Upload image or MP4<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" disabled={busy} onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/></label>
   <p className="cms-muted">JPG, PNG, WEBP or MP4 up to 4 MB. Larger videos can use a direct URL.</p>
   <label>{form.preview_type==='video'?'Video URL':'Image URL'}<input value={selectedUrl} onChange={e=>change(form.preview_type==='video'?'video_url':'image_url',e.target.value)} placeholder="https://…"/></label>
   <label>Reuse library asset<select value="" onChange={e=>{const item=media.find(x=>x.id===e.target.value);if(item){change('preview_type',item.kind);change(item.kind==='video'?'video_url':'image_url',item.url);}}}><option value="">Choose media…</option>{media.map(item=><option key={item.id} value={item.id}>{item.name} ({item.kind})</option>)}</select></label>
   {form.preview_type==='video'&&<><label>Poster image URL<input value={form.poster_url} onChange={e=>change('poster_url',e.target.value)} placeholder="https://…"/></label><label>Upload poster image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{upload(e.target.files?.[0],true);e.target.value='';}}/></label><label>Poster from library<select value="" onChange={e=>change('poster_url',e.target.value)}><option value="">Choose poster…</option>{media.filter(item=>item.kind==='image').map(item=><option key={item.id} value={item.url}>{item.name}</option>)}</select></label></>}
  </section><section className="cms-panel"><h2>Display settings</h2><label className="cms-check"><input type="checkbox" checked={form.published} onChange={e=>change('published',e.target.checked)}/>Show on portfolio</label><label>Display order<input type="number" min="-100000" max="100000" value={form.sort_order} onChange={e=>change('sort_order',Number(e.target.value))}/></label><label>Accent colour<input type="color" value={form.accent} onChange={e=>change('accent',e.target.value)}/></label><p className="cms-muted">Lower numbers appear first. Hidden websites remain available in the admin.</p></section></aside></div>
 </form>;
}
