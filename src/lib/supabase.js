import { createClient } from '@supabase/supabase-js'

const url=import.meta.env.VITE_SUPABASE_URL || 'https://dbetjwgrchhgqkjjrubl.supabase.co'
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__75ZE-c5sP98lIUaJLvVFQ_b92fOuwp'
export const supabase = createClient(url,key)

export async function logToolEvent(slug,event='completed',meta={}){
  const { data:{ user } }=await supabase.auth.getUser()
  await supabase.from('tool_events').insert({ tool_slug:slug,event,user_id:user?.id||null,meta })
}

export async function saveFavorite(slug){
  const { data:{ user } }=await supabase.auth.getUser()
  if(!user) throw new Error('Sign in first')
  return supabase.from('favorites').upsert({user_id:user.id,tool_slug:slug},{onConflict:'user_id,tool_slug'})
}
