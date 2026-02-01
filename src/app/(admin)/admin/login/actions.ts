'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

interface LoginFormData {
  email: string
  password: string
  key: string
}

// Hash function to hash the admin key (matches seed_admin.js)
function hashKey(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

export async function adminLogin(formData: LoginFormData) {
  try {
    const supabase = await createClient()

    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      console.error('Authentication error:', authError.message)
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Authentication failed'
      }
    }

    // Step 2: Verify user has ADMIN type metadata
    const userMetadata = authData.user.user_metadata
    if (!userMetadata || userMetadata.TYPE !== 'ADMIN') {
      console.error('User is not an admin:', authData.user.id)
      // Sign out the user since they're not authorized
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Access denied: Admin privileges required'
      }
    }

    // Step 3: Hash the provided key and verify it exists for this admin
    const hashedKey = hashKey(formData.key)

    const { data: keyData, error: keyError } = await supabase
      .from('admin_key')
      .select('id, admin, created_at')
      .eq('key', hashedKey)
      .eq('admin', authData.user.id)
      .single()

    if (keyError || !keyData) {
      console.error('Invalid admin key for user:', authData.user.id)
      // Sign out the user since key verification failed
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Invalid admin key'
      }
    }

    // Step 4: Successful login
    console.log('Admin login successful for user:', authData.user.id)
    revalidatePath('/admin')
    return {
      success: true
    }

  } catch (error) {
    console.error('Admin login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

// Server action to check if user is authenticated as admin
export async function checkAdminAuth() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { authenticated: false }
    }

    // Check if user has admin metadata
    const userMetadata = user.user_metadata
    if (!userMetadata || userMetadata.TYPE !== 'ADMIN') {
      return { authenticated: false }
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: userMetadata
      }
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return { authenticated: false }
  }
}

// Server action for logout
export async function adminLogout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/admin/login')
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: 'Logout failed' }
  }
}
