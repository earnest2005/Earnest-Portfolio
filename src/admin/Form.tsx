import {useState} from 'react';import {uploadFile} from '../lib/supabase';import {SKILL_CATS,type F} from './config'
export default function Form({fields,init,onSave,onCancel,pub}:{fields:F[];init:Record<string,any>;onSave:(v:Record<string,any>)=>Promise<void>;onCancel?:()=>void;pub?:boolean}){
 const [v,setV]=useState<Record<string,any>>(init);const [busy,setBusy]=useState(false);const [err,setErr]=useState('')
 const up=async(k:string,f?:File)=>{if(!f)return;if(f.size>10e6)return setErr('File over 10 MB');setBusy(true);try{setV(s=>({...s,[k]:''}));const u=await uploadFile(f,k);setV(s=>({...s,[k]:u}))}catch(e:any){setErr(e.message)}setBusy(false)}
 const save=async(published?:boolean)=>{setErr('');const first=fields[0];if(!v[first.k]?.toString().trim())return setErr(`${first.l} is required`);setBusy(true)
  try{await onSave(published===undefined?v:{...v,published})}catch(e:any){setErr(e.message)}setBusy(false)}
 return <div className="space-y-4">{fields.map(f=><label key={f.k} className="block text-sm"><span className="mb-1 block font-medium">{f.l}</span>
 {f.t==='area'?<textarea rows={4} className="inp" value={v[f.k]??''} onChange={e=>setV({...v,[f.k]:e.target.value})}/>
 :f.t==='cat'?<select className="inp" value={v[f.k]??''} onChange={e=>setV({...v,[f.k]:e.target.value})}><option value="">Select…</option>{SKILL_CATS.map(c=><option key={c}>{c}</option>)}</select>
 :f.t==='kind'?<select className="inp" value={v[f.k]??'Certification'} onChange={e=>setV({...v,[f.k]:e.target.value})}><option>Certification</option><option>Achievement</option></select>
 :f.t==='image'||f.t==='file'?<div className="flex items-center gap-3">{v[f.k]&&f.t==='image'&&<img src={v[f.k]} className="h-16 rounded-lg" alt=""/>}{v[f.k]&&f.t==='file'&&<a className="underline" target="_blank" href={v[f.k]}>Current file</a>}<input type="file" accept={f.t==='image'?'image/*':'application/pdf'} onChange={e=>up(f.k,e.target.files?.[0])}/></div>
 :<input className="inp" value={v[f.k]??''} onChange={e=>setV({...v,[f.k]:e.target.value})}/>}</label>)}
 {err&&<p className="text-sm text-red-600">{err}</p>}
 <div className="flex gap-2"><button disabled={busy} onClick={()=>save(pub?true:undefined)} className="btn btn-p">{busy?'Working…':pub?'Save & publish':'Save'}</button>{pub&&<button disabled={busy} onClick={()=>save(false)} className="btn btn-o">Save as draft</button>}{onCancel&&<button onClick={onCancel} className="btn btn-o">Cancel</button>}</div></div>}
