import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'

export type Row = Record<string, any>

export interface PortfolioData {
  profile: Row
  skills: Row[]
  projects: Row[]
  experience: Row[]
  education: Row[]
  certifications: Row[]
  posts: Row[]
}

const CACHE_KEY = 'ea_portfolio_data_v1'

const DEFAULT_DATA: PortfolioData = {
  profile: {},
  skills: [],
  projects: [],
  experience: [],
  education: [],
  certifications: [],
  posts: []
}

function getStoredCache(): PortfolioData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PortfolioData
  } catch {
    return null
  }
}

function saveCache(data: PortfolioData) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore storage quota or private mode issues
  }
}

// Fetch all public collections in a single parallel batch
export async function fetchAllPortfolioData(): Promise<PortfolioData> {
  const [profileRes, skillsRes, projectsRes, experienceRes, educationRes, certsRes, postsRes] =
    await Promise.all([
      supabase.from('profile').select('*').eq('id', 1).maybeSingle(),
      supabase.from('skills').select('*').eq('published', true).order('sort_order'),
      supabase.from('projects').select('*').eq('published', true).order('sort_order'),
      supabase.from('experience').select('*').eq('published', true).order('sort_order'),
      supabase.from('education').select('*').eq('published', true).order('sort_order'),
      supabase.from('certifications').select('*').eq('published', true).order('sort_order'),
      supabase.from('posts').select('*').eq('published', true).order('sort_order')
    ])

  return {
    profile: profileRes.data ?? {},
    skills: skillsRes.data ?? [],
    projects: projectsRes.data ?? [],
    experience: experienceRes.data ?? [],
    education: educationRes.data ?? [],
    certifications: certsRes.data ?? [],
    posts: postsRes.data ?? []
  }
}

// Stale-While-Revalidate custom hook for the whole portfolio
export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(() => {
    return getStoredCache() ?? DEFAULT_DATA
  })
  const [isReady, setIsReady] = useState<boolean>(() => {
    return getStoredCache() !== null
  })
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    fetchAllPortfolioData()
      .then((fresh) => {
        if (!isMounted.current) return
        setData(fresh)
        setIsReady(true)
        saveCache(fresh)
      })
      .catch((err) => {
        console.error('Failed to refresh portfolio data:', err)
        if (isMounted.current) setIsReady(true)
      })

    return () => {
      isMounted.current = false
    }
  }, [])

  return { ...data, isReady }
}

// Backward-compatible individual hooks
export function useProfile(): Row {
  const { profile } = usePortfolioData()
  return profile
}

export function useRows(table: string): Row[] | null {
  const data = usePortfolioData()
  const key = table as keyof PortfolioData
  if (key in data && Array.isArray(data[key])) {
    return data[key] as Row[]
  }
  return null
}
