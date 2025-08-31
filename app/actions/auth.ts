'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  // Extract auth data
  const authData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Extract profile data
  const profileData = {
    email: formData.get('email') as string,
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    phone: formData.get('phone') as string,
    account_type: formData.get('accountType') as 'particulier' | 'professionnel',
    company_name: formData.get('company') as string || null,
    country: formData.get('country') as string,
    address_formatted: formData.get('address_formatted') as string,
    address_street: formData.get('address_street') as string || null,
    address_housenumber: formData.get('address_housenumber') as string || null,
    postcode: formData.get('postcode') as string,
    city: formData.get('city') as string,
    country_code: formData.get('country_code') as string,
  }

  // Validate required fields
  if (!authData.email || !authData.password) {
    return { error: 'Email et mot de passe sont requis' }
  }

  if (!profileData.first_name || !profileData.last_name) {
    return { error: 'Nom et prénom sont requis' }
  }

  if (!profileData.country || !profileData.address_formatted || !profileData.postcode || !profileData.city) {
    return { error: 'Adresse complète requise' }
  }

  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp(authData)

    if (authError) {
      return { error: authError.message }
    }

    if (!authUser.user) {
      return { error: 'Erreur lors de la création du compte' }
    }

    // Use the secure function to insert profile data (bypasses RLS)
    const { error: profileError } = await supabase.rpc('create_user_profile', {
      user_id: authUser.user.id,
      user_email: profileData.email,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      country: profileData.country,
      address_formatted: profileData.address_formatted,
      postcode: profileData.postcode,
      city: profileData.city,
      country_code: profileData.country_code,
      phone: profileData.phone || null,
      account_type: profileData.account_type || 'particulier',
      company_name: profileData.company_name || null,
      address_street: profileData.address_street || null,
      address_housenumber: profileData.address_housenumber || null
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return { error: 'Erreur lors de la sauvegarde des informations: ' + profileError.message }
    }

    revalidatePath('/', 'layout')
    return { 
      success: true, 
      user: authUser.user,
      session: authUser.session 
    }

  } catch (error) {
    console.error('Signup error:', error)
    return { error: 'Une erreur inattendue est survenue lors de la création du compte' }
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getUser() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  return user
}