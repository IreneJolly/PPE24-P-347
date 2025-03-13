'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RootPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('No user found, redirecting to login...')
          router.push('/login')
          return
        }

        // Check if user needs to complete onboarding
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_first_login')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user data:', error)
          router.push('/login')
          return
        }

        if (userData?.is_first_login) {
          console.log('First time login, redirecting to onboarding...')
          router.push('/onboarding')
        } else {
          console.log('User already onboarded, redirecting to dashboard...')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      }
    }

    checkUser()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
}