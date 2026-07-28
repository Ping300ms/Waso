import { supabase } from '../sync/supabaseClient'

const PSEUDO_CACHE_KEY = 'waso.cachedPseudo'

export interface Profile {
  id: string
  pseudo: string
}

/** Fetches the current user's profile when online, caching the pseudo in localStorage
 * so it can still be displayed offline (Profil screen must work without connectivity). */
export async function fetchOwnProfile(userId: string): Promise<Profile | null> {
  if (!navigator.onLine) return getCachedProfile(userId)

  const { data, error } = await supabase.from('profiles').select('id, pseudo').eq('id', userId).single()
  if (error || !data) return getCachedProfile(userId)

  localStorage.setItem(PSEUDO_CACHE_KEY, JSON.stringify(data))
  return data as Profile
}

function getCachedProfile(userId: string): Profile | null {
  const raw = localStorage.getItem(PSEUDO_CACHE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Profile
    return parsed.id === userId ? parsed : null
  } catch {
    return null
  }
}

export async function updatePseudo(userId: string, pseudo: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({ pseudo }).eq('id', userId)
  if (!error) localStorage.setItem(PSEUDO_CACHE_KEY, JSON.stringify({ id: userId, pseudo }))
  return { error: error?.message ?? null }
}
