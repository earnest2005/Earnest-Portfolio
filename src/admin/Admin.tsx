import {useEffect,useState,useCallback} from 'react';import {NavLink,Route,Routes,Navigate,Link} from 'react-router-dom';import {LayoutDashboard,User,LogOut,Inbox,Layers,ExternalLink} from 'lucide-react'
import type {Session} from '@supabase/supabase-js';import {supabase} from '../lib/supabase';import {CFG,PROFILE} from './config';import Form from './Form'
type R=Record<string,any>
function Login(){const [e,setE]=useState('');const [p,setP]=useState('');const [m,setM]=useState('')
 return <div className="grid min-h-screen place-items-center"><form className="glass w-80 space-y-3 rounded-3xl p-8" onSubmit={async ev=>{ev.preventDefault();const {error}=await supabase.auth.signInWithPassword({email:e,password:p});if(error)setM(error.message)}}>
 <h1 className="text-xl font-bold">Admin sign in</h1><input className="inp" type="email" placeholder="Email" value={e} onChange={x=>setE(x.target.value)} required/><input className="inp" type="password" placeholder="Password" value={p} onChange={x=>setP(x.target.value)} required/>{m&&<p className="text-sm text-red-600">{m}</p>}<button className="btn btn-p w-full justify-center">Sign in</button></form></div>}
function Toast({m}:{m:string}){return m?<div className="fixed bottom-5 right-5 rounded-xl bg-ink px-4 py-2 text-sm text-white">{m}</div>:null}
function Dash(){const [c,setC]=useState<R>({});const [rec,setRec]=useState<R[]>([])
 useEffect(()=>{(async()=>{const o:R={};for(const t of [...Object.keys(CFG),'messages']){const {count}=await supabase.from(t).select('*',{count:'exact',head:true});o[t]=count??0}setC(o)
 const {data}=await supabase.from('messages').select('name,created_at').order('created_at',{ascending:false}).limit(5);setRec(data??[])})()},[])
 return <div><h1 className="mb-6 text-2xl font-bold">Dashboard</h1><div className="grid gap-4 sm:grid-cols-3">{[...Object.keys(CFG),'messages'].map(t=><div key={t} className="glass rounded-2xl p-5"><p className="text-3xl font-bold">{c[t]??'–'}</p><p className="text-sm capitalize text-mute">{CFG[t]?.label??'Messages'}</p></div>)}</div>
 <h2 className="mb-2 mt-8 font-semibold">Recent activity</h2>{rec.length?rec.map((r,i)=><p key={i} className="text-sm text-mute">Message from {r.name} · {new Date(r.created_at).toLocaleString()}</p>):<p className="text-sm text-mute">No messages yet.</p>}</div>}
function Profile({say}:{say:(m:string)=>void}){const [row,setRow]=useState<R|null>(null)
 useEffect(()=>{supabase.from('profile').select('*').eq('id',1).maybeSingle().then(({data})=>setRow(data??{}))},[])
 if(!row)return <p>Loading…</p>
 return <div><h1 className="mb-6 text-2xl font-bold">Profile, Hero, About, Resume & Social links</h1><div className="max-w-2xl"><Form fields={PROFILE} init={row} onSave={async v=>{const {error}=await supabase.from('profile').upsert({...v,id:1});if(error)throw error;say('Profile saved')}}/></div></div>}
function Manager({table,say}:{table:string;say:(m:string)=>void}){const c=CFG[table];const [rows,setRows]=useState<R[]>([]);const [ed,setEd]=useState<R|null>(null)
 const load=useCallback(async()=>{const {data}=await supabase.from(table).select('*').order('sort_order');setRows(data??[])},[table]);useEffect(()=>{setEd(null);load()},[load])
 const move=async(i:number,d:number)=>{const a=rows[i],b=rows[i+d];if(!b)return;await supabase.from(table).update({sort_order:b.sort_order}).eq('id',a.id);await supabase.from(table).update({sort_order:a.sort_order}).eq('id',b.id);load()}
 const del=async(r:R)=>{if(!confirm('Delete this entry permanently?'))return;const {error}=await supabase.from(table).delete().eq('id',r.id);say(error?error.message:'Deleted');load()}
 const save=async(v:R)=>{const p={...v};if(!p.id){p.sort_order=(rows[rows.length-1]?.sort_order??0)+1;if(c.slug&&!p.slug)p.slug=String(p.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  const {error}=p.id?await supabase.from(table).update(p).eq('id',p.id):await supabase.from(table).insert(p);if(error)throw error;say('Saved');setEd(null);load()}
 if(ed)return <div className="max-w-2xl"><h1 className="mb-6 text-2xl font-bold">{ed.id?'Edit':'New'} {c.label}</h1><Form fields={c.fields} init={ed} onSave={save} onCancel={()=>setEd(null)} pub/><p className="mt-3 text-xs text-mute">Published items appear on the public site immediately.{c.slug&&' Preview: save, then open the item from the public site.'}</p></div>
 return <div><div className="mb-6 flex items-center justify-between"><h1 className="text-2xl font-bold">{c.label}</h1><button className="btn btn-p" onClick={()=>setEd({published:true})}>+ Add</button></div>
 <div className="space-y-2">{rows.map((r,i)=><div key={r.id} className="glass flex items-center gap-3 rounded-2xl p-3 text-sm"><div className="flex flex-col"><button onClick={()=>move(i,-1)} aria-label="Move up">▲</button><button onClick={()=>move(i,1)} aria-label="Move down">▼</button></div>
 <span className="flex-1 font-medium">{r[c.title]}{!r.published&&<em className="ml-2 text-xs text-mute">(draft)</em>}</span>
 {c.slug&&r.published&&<Link to={`/${table==='posts'?'blog':'projects'}/${r.slug}`} target="_blank" className="text-sage"><ExternalLink size={14}/></Link>}
 <button className="underline" onClick={()=>setEd(r)}>Edit</button><button className="text-red-600 underline" onClick={()=>del(r)}>Delete</button></div>)}{!rows.length&&<p className="text-sm text-mute">No entries yet.</p>}</div></div>}
function Messages({say}:{say:(m:string)=>void}){const [rows,setRows]=useState<R[]>([]);const load=()=>supabase.from('messages').select('*').order('created_at',{ascending:false}).then(({data})=>setRows(data??[]));useEffect(()=>{load()},[])
 return <div><h1 className="mb-6 text-2xl font-bold">Messages</h1><div className="space-y-3">{rows.map(r=><div key={r.id} className="glass rounded-2xl p-4 text-sm"><p className="font-medium">{r.name} · <a className="text-sage" href={`mailto:${r.email}`}>{r.email}</a></p><p className="mt-1 whitespace-pre-wrap">{r.message}</p><p className="mt-2 text-xs text-mute">{new Date(r.created_at).toLocaleString()} · <button className="text-red-600 underline" onClick={async()=>{if(!confirm('Delete message?'))return;await supabase.from('messages').delete().eq('id',r.id);say('Deleted');load()}}>Delete</button></p></div>)}{!rows.length&&<p className="text-sm text-mute">No messages yet.</p>}</div></div>}
export default function Admin(){const [s,setS]=useState<Session|null|undefined>(undefined);const [ok,setOk]=useState<boolean|null>(null);const [m,setM]=useState('')
 const say=(t:string)=>{setM(t);setTimeout(()=>setM(''),2500)}
 useEffect(()=>{supabase.auth.getSession().then(({data})=>setS(data.session));const {data}=supabase.auth.onAuthStateChange((_e,x)=>setS(x));return()=>data.subscription.unsubscribe()},[])
 useEffect(()=>{setOk(null);if(s)supabase.from('admins').select('user_id').eq('user_id',s.user.id).maybeSingle().then(({data})=>setOk(!!data))},[s])
 if(s===undefined)return <p className="p-10">Loading…</p>;if(!s)return <Login/>
 if(ok===null)return <p className="p-10">Checking access…</p>
 if(!ok)return <div className="p-10"><p>This account is not an administrator. See README → Admin setup.</p><button className="btn btn-o mt-4" onClick={()=>supabase.auth.signOut()}>Log out</button></div>
 const L=({to,icon,children}:{to:string;icon:React.ReactNode;children:React.ReactNode})=><NavLink end to={to} className={({isActive})=>`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive?'bg-sage text-white':'hover:bg-sage2/40'}`}>{icon}{children}</NavLink>
 return <div className="flex min-h-screen"><aside className="w-56 shrink-0 space-y-1 border-r border-sage2 bg-white p-4"><p className="mb-4 font-head text-lg font-bold">EA Admin</p>
 <L to="/admin" icon={<LayoutDashboard size={16}/>}>Dashboard</L><L to="/admin/profile" icon={<User size={16}/>}>Profile / Hero / About</L>
 {Object.entries(CFG).map(([k,c])=><L key={k} to={`/admin/${k}`} icon={<Layers size={16}/>}>{c.label}</L>)}<L to="/admin/messages" icon={<Inbox size={16}/>}>Messages</L>
 <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-mute"><ExternalLink size={16}/>View site</a>
 <button onClick={()=>supabase.auth.signOut()} className="flex items-center gap-2 px-3 py-2 text-sm text-mute"><LogOut size={16}/>Logout</button></aside>
 <main className="flex-1 p-8"><Routes><Route index element={<Dash/>}/><Route path="profile" element={<Profile say={say}/>}/><Route path="messages" element={<Messages say={say}/>}/>
 {Object.keys(CFG).map(k=><Route key={k} path={k} element={<Manager table={k} say={say}/>}/>)}<Route path="*" element={<Navigate to="/admin"/>}/></Routes></main><Toast m={m}/></div>}
