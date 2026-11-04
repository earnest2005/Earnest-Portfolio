import {useEffect,useState} from 'react'
import {supabase} from './supabase'
export type Row=Record<string,any>
export function useRows(table:string){const [r,setR]=useState<Row[]|null>(null)
 useEffect(()=>{supabase.from(table).select('*').eq('published',true).order('sort_order').then(({data})=>setR(data??[]))},[table]);return r}
export function useProfile(){const [p,setP]=useState<Row>({})
 useEffect(()=>{supabase.from('profile').select('*').eq('id',1).maybeSingle().then(({data})=>setP(data??{}))},[]);return p}
