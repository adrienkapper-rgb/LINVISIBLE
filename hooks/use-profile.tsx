'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          setError(error.message)
        } else {
          setProfile(data)
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err)
        setError('Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const updateProfile = async (updatedData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !profile) return { success: false, error: 'Utilisateur non connecté' }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        setError(error.message)
        return { success: false, error: error.message }
      } else {
        setProfile(data)
        return { success: true, data }
      }
    } catch (err) {
      console.error('Unexpected error updating profile:', err)
      const errorMessage = 'Erreur lors de la mise à jour du profil'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    displayName: profile?.first_name || user?.email?.split('@')[0] || 'Utilisateur'
  }
}