'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

const COOKIE_NAME = 'distributor_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function distributorLogin(
  email: string,
  password: string,
  rememberDevice: boolean,
): Promise<{ success: true; distributorId: string } | { success: false; error: string }> {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' }
    }

    const supabase = await createClient()

    // Fetch the partner record by email
    const { data: partner, error: fetchError } = await supabase
      .from('distribution_partners')
      .select('id, password_hash, status, company_name')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (fetchError || !partner) {
      return { success: false, error: 'Invalid email or password.' }
    }

    // Check account status
    // DB constraint allows: 'Pending' | 'Verified' | 'Closed' | 'Banned'
    if (partner.status !== 'Verified') {
      return {
        success: false,
        error:
          partner.status === 'Pending'
            ? 'Your application is under review. You will be notified once approved.'
            : 'This account has been suspended. Please contact support.',
      }
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, partner.password_hash)
    if (!passwordValid) {
      return { success: false, error: 'Invalid email or password.' }
    }

    // Set HTTP-only session cookie
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, partner.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberDevice ? COOKIE_MAX_AGE : undefined, // session cookie if not remembered
    })

    return { success: true, distributorId: partner.id }
  } catch (err) {
    console.error('[distributor-auth] Login error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function distributorLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getDistributorSession(): Promise<{
  id: string
  company_name: string
  first_name: string
  last_name: string
  email: string
  status: string
} | null> {
  try {
    const cookieStore = await cookies()
    const distributorId = cookieStore.get(COOKIE_NAME)?.value

    if (!distributorId) return null

    const supabase = await createClient()

    const { data: partner, error } = await supabase
      .from('distribution_partners')
      .select('id, company_name, first_name, last_name, email, status')
      .eq('id', distributorId)
      .single()

    if (error || !partner) return null

    // Revoke session if account is no longer active
    if (partner.status !== 'Verified') {
      const cookieStore2 = await cookies()
      cookieStore2.delete(COOKIE_NAME)
      return null
    }

    return partner
  } catch {
    return null
  }
}
