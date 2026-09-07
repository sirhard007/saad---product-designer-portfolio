export async function cms(path:string, options:RequestInit={}) {
 const response=await fetch('/api'+path,{...options,headers:{...(!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),Authorization:`Bearer ${localStorage.getItem('adminToken')||''}`,...options.headers}});
 const data=await response.json().catch(()=>({error:'Invalid server response.'}));
 if(!response.ok){if(response.status===401){localStorage.removeItem('adminToken');window.location.assign('/login');}throw new Error(data.error||'Request failed');}return data;
}
export async function uploadMedia(file:File){const body=new FormData();body.append('image',file);return cms('/upload',{method:'POST',body});}
