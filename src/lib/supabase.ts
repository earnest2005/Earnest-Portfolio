import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verify whether Supabase public credentials exist
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey !== 'missing-key'
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Warning: Missing or invalid VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.'
  )
}

// Safely initialize with fallback to prevent top-level runtime crash
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

export async function uploadFile(file: File, folder: string): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  let body: Blob = file, ext = file.name.split('.').pop() || 'bin', type = file.type
  if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
    // client-side compression to WebP, max 1600px
    const bmp = await createImageBitmap(file)
    const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = bmp.width * s
    c.height = bmp.height * s
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    body = await new Promise<Blob>(r => c.toBlob(b => r(b!), 'image/webp', 0.85))
    ext = 'webp'
    type = 'image/webp'
  }
  const path = `${folder}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('media').upload(path, body, { contentType: type })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
