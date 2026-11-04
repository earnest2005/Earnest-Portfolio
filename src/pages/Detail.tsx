import {useEffect,useState} from 'react';import {Link,useParams} from 'react-router-dom';import {ArrowLeft,Github,ExternalLink} from 'lucide-react'
import {supabase} from '../lib/supabase';import type {Row} from '../lib/data'
export default function Detail({table}:{table:string}){const {slug}=useParams();const [r,setR]=useState<Row|null|undefined>(undefined)
 useEffect(()=>{supabase.from(table).select('*').eq('slug',slug).eq('published',true).maybeSingle().then(({data})=>setR(data))},[table,slug])
 if(r===undefined)return <p className="p-10 text-mute">Loading…</p>
 if(!r)return <p className="p-10">Not found. <Link className="underline" to="/">Home</Link></p>
 const img=r.image_url||r.cover_url
 return <article className="mx-auto max-w-3xl px-6 py-12"><Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-mute"><ArrowLeft size={16}/>Back</Link>
 <h1 className="text-4xl font-bold">{r.title}</h1>{r.category&&<p className="mt-2 text-sage">{r.category}</p>}
 {img&&<img src={img} alt={r.title} className="my-8 w-full rounded-3xl"/>}
 {r.tech&&<p className="mb-4 text-sm text-mute">{r.tech}</p>}
 <div className="whitespace-pre-wrap leading-relaxed text-ink/90">{r.details||r.content||r.description}</div>
 <div className="mt-8 flex gap-3">{r.github_url&&<a className="btn btn-o" href={r.github_url}><Github size={16}/>GitHub</a>}{r.demo_url&&<a className="btn btn-p" href={r.demo_url}><ExternalLink size={16}/>Live demo</a>}</div></article>}
