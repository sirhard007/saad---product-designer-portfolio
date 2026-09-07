import { useReducedMotion } from 'motion/react';
import { useState } from 'react';
export default function Cover({project,controls=false}:{project:any;controls?:boolean}) {
 const reduced=useReducedMotion();
 const [failed,setFailed]=useState(false);
 if(project.cover_type==='video'&&project.video_url&&!failed)return <video src={project.video_url} poster={project.poster||project.image||undefined} autoPlay={!reduced} muted loop playsInline controls={controls||!!reduced} preload="metadata" onError={()=>setFailed(true)} aria-label={`${project.title} walkthrough`}/>;
 const image=project.cover_type==='video'?project.poster||project.image:project.image;
 return image?<img src={image} alt={`${project.title} cover`} loading="lazy"/>:<div className="cover-empty">{failed?'Video unavailable':'No cover selected'}</div>;
}
