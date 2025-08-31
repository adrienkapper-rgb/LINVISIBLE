'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveUserInfo(data: {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Convertir le code pays en minuscules pour la base de données
  const countryCode = (data.countryCode || 'FR').toLowerCase();
  
  // Mapper le code pays au nom complet
  const countryNames: Record<string, string> = {
    'fr': 'France',
    'be': 'Belgique',
    'lu': 'Luxembourg',
    'es': 'Espagne',
    'pt': 'Portugal',
    'at': 'Autriche',
    'de': 'Allemagne',
    'nl': 'Pays-Bas'
  };

  // Préparer les données pour la table profiles
  const profileData: any = {
    id: user.id,
    email: user.email,
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone,
    updated_at: new Date().toISOString(),
  }

  // Ajouter l'adresse si fournie
  if (data.address && data.city && data.postalCode) {
    profileData.address_formatted = data.address;
    profileData.city = data.city;
    profileData.postcode = data.postalCode;
    profileData.country_code = countryCode;
    profileData.country = countryNames[countryCode] || 'France';
  }

  // Utiliser upsert pour créer ou mettre à jour le profil
  const { error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })

  if (error) {
    console.error('Error updating profile:', error)
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

  // Récupérer les données depuis la table profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    // Retourner au moins l'email si le profil n'existe pas
    return {
      id: user.id,
      email: user.email || '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      countryCode: 'FR', // Déjà en majuscules par défaut
    }
  }


  return {
    id: user.id,
    email: profile.email || user.email || '',
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    phone: profile.phone || '',
    address: profile.address_formatted || '',
    city: profile.city || '',
    postalCode: profile.postcode || '',
    countryCode: (profile.country_code || 'FR').toUpperCase(),
  }
}