'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveUserInfo(data: {
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Mettre à jour les métadonnées utilisateur
  const { error } = await supabase.auth.updateUser({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/checkout')
  return { success: true }
}

export async function getUserInfo() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
    firstName: user.user_metadata?.firstName || '',
    lastName: user.user_metadata?.lastName || '',
    phone: user.user_metadata?.phone || '',
  }
}