'use server'

import { supabaseServiceRole } from '@/lib/supabase/service-role'
import { getDistributorSession } from './distributor-auth'

export interface AddCustomerPayload {
  email: string
  first_name: string
  last_name: string
  city?: string
  postal_code?: string
  street?: string
  country?: string
  phone?: string
  telegram_username?: string
  instagram_username?: string
  snapchat_username?: string
}

export async function addDistributorCustomer(
  payload: AddCustomerPayload,
): Promise<{ success: true; data: Record<string, unknown> } | { success: false; error: string }> {
  try {
    // Verify the distributor session server-side
    const session = await getDistributorSession()

    if (!session) {
      return { success: false, error: 'You must be logged in to add customers.' }
    }

    if (!payload.email?.trim() || !payload.first_name?.trim() || !payload.last_name?.trim()) {
      return { success: false, error: 'Email, first name, and last name are required.' }
    }

    const { data, error } = await supabaseServiceRole
      .from('distributor_customers')
      .insert({
        distributor: session.id,
        email: payload.email.trim(),
        first_name: payload.first_name.trim(),
        last_name: payload.last_name.trim(),
        city: payload.city?.trim() || null,
        postal_code: payload.postal_code?.trim() || null,
        street: payload.street?.trim() || null,
        country: payload.country?.trim() || null,
        phone: payload.phone?.trim() || null,
        telegram_username: payload.telegram_username?.trim() || null,
        instagram_username: payload.instagram_username?.trim() || null,
        snapchat_username: payload.snapchat_username?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[distributor-customers] Insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Record<string, unknown> }
  } catch (err) {
    console.error('[distributor-customers] Unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}
