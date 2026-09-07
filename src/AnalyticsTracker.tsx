import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const source=()=>{
 if(!document.referrer)return 'Direct';
 try{const host=new URL(document.referrer).hostname;
 if(host===location.hostname)return sessionStorage.getItem('cmsSource')||'Direct';
 if(/(^|\.)(google\.[a-z.]+|bing.com|duckduckgo.com|yahoo.com)$/.test(host))return 'Search';
 if(/(^|\.)(instagram.com|linkedin.com|t.co|x.com|twitter.com|facebook.com|behance.net|dribbble.com)$/.test(host))return 'Social';
 return 'Referral';}catch{return 'Direct';}
};
export default function AnalyticsTracker(){const location=useLocation();
 useEffect(()=>{
  if(/^\/(admin|login)/.test(location.pathname)||navigator.doNotTrack==='1'||(navigator as any).globalPrivacyControl)return;
  let cancelled=false;
  const settingsPromise=fetch('/api/settings').then(r=>r.ok?r.json():null);
  const send=async(event:string,target='')=>{
   try{
    const settings=await settingsPromise;if(!settings?.analytics_enabled||(cancelled&&event==='page_view'))return;
    let visitor=localStorage.getItem('cmsVisitor');if(!visitor){visitor=crypto.randomUUID();localStorage.setItem('cmsVisitor',visitor);}
    let session=sessionStorage.getItem('cmsVisit');const last=Number(sessionStorage.getItem('cmsLast')||0);
    if(!session||Date.now()-last>30*60*1000){session=crypto.randomUUID();sessionStorage.setItem('cmsVisit',session);sessionStorage.setItem('cmsSource',source());}
    sessionStorage.setItem('cmsLast',String(Date.now()));
    const ua=navigator.userAgent,device=/iPad|Tablet/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1)?'Tablet':/Mobi|Android/i.test(ua)?'Mobile':'Desktop';
    await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify({event,target,path:location.pathname,visitor,session,device,source:sessionStorage.getItem('cmsSource')||'Direct'})});
   }catch{/* Analytics must never interrupt the portfolio. */}
  };
  send('page_view');
  const click=(e:MouseEvent)=>{const el=(e.target as Element)?.closest?.('[data-event]') as HTMLElement|null;if(el)send(el.dataset.event||'',el.dataset.target||'');};
  const project=(e:Event)=>send('project_view',(e as CustomEvent).detail);
  document.addEventListener('click',click);document.addEventListener('cms-project-view',project);
  return()=>{cancelled=true;document.removeEventListener('click',click);document.removeEventListener('cms-project-view',project);};
 },[location.pathname]);return null;
}
