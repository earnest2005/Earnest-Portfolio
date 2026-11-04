import {createClient} from '@supabase/supabase-js'
export const supabase=createClient(import.meta.env.VITE_SUPABASE_URL||'http://localhost:54321',import.meta.env.VITE_SUPABASE_ANON_KEY||'missing-key')
export async function uploadFile(file:File,folder:string):Promise<string>{
  let body:Blob=file,ext=file.name.split('.').pop()||'bin',type=file.type
  if(file.type.startsWith('image/')&&file.type!=='image/svg+xml'){ // client-side compression to WebP, max 1600px
    const bmp=await createImageBitmap(file);const s=Math.min(1,1600/Math.max(bmp.width,bmp.height))
    const c=document.createElement('canvas');c.width=bmp.width*s;c.height=bmp.height*s
    c.getContext('2d')!.drawImage(bmp,0,0,c.width,c.height)
    body=await new Promise<Blob>(r=>c.toBlob(b=>r(b!),'image/webp',0.85));ext='webp';type='image/webp'}
  const path=`${folder}/${Date.now()}.${ext}`
  const {error}=await supabase.storage.from('media').upload(path,body,{contentType:type})
  if(error)throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
