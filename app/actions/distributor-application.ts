'use server'

import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function submitDistributorApplication(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const companyName = formData.get('companyName') as string
    const operatingRegion = formData.get('operatingRegion') as string
    const website = formData.get('website') as string | null

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !companyName || !operatingRegion) {
      return { success: false, error: 'All fields are required' }
    }

    // Validate password length
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' }
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('distribution_partners')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return { success: false, error: 'An application with this email already exists' }
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert the application
    const { error: insertError } = await supabase
      .from('distribution_partners')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        operating_region: operatingRegion,
        website: website || null,
        status: 'Pending'
      })

    if (insertError) {
      console.error('[v0] Supabase insert error:', insertError)
      return { success: false, error: 'Failed to submit application. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Application submission error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
