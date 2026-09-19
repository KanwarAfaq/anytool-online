import { createClient } from '@supabase/supabase-js'

const url=import.meta.env.VITE_SUPABASE_URL
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url,key) : null

export async function logToolEvent(slug,event='completed',meta={}){
  if(!supabase) return
  const { data:{ user } }=await supabase.auth.getUser()
  await supabase.from('tool_events').insert({ tool_slug:slug,event,user_id:user?.id||null,meta })
}

export async function saveFavorite(slug){
  if(!supabase) throw new Error('Supabase is not configured')
  const { data:{ user } }=await supabase.auth.getUser()
  if(!user) throw new Error('Sign in first')
  return supabase.from('favorites').upsert({user_id:user.id,tool_slug:slug},{onConflict:'user_id,tool_slug'})
}
