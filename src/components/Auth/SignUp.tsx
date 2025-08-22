import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { AuthError } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface SignUpForm {
  full_name: string
  email: string
  password: string
  role: 'tourist' | 'local' | 'admin'
  phone_number: string
  location: string
}

export default function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignUpForm>({
    full_name: '',
    email: '',
    password: '',
    role: 'tourist',
    phone_number: '',
    location: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      throw new Error('Full name is required')
    }
    if (!formData.email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
      throw new Error('Invalid email format')
    }
    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }
    if (formData.phone_number && !formData.phone_number.match(/^\+?[1-9]\d{1,14}$/)) {
      throw new Error('Invalid phone number format')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate form
      validateForm()

      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single()

      if (existingProfile) {
        throw new Error('An account with this email already exists')
      }

      // Create auth user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
          },
        },
      })

      if (signUpError) throw signUpError

      if (user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: formData.full_name,
              email: formData.email,
              role: formData.role,
              phone_number: formData.phone_number || null,
              location: formData.location || null,
              email_verified: false,
              phone_verified: false,
              account_status: 'active',
              failed_login_attempts: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
          ])

        if (profileError) {
          // If profile creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(user.id)
          throw profileError
        }

        // Log the signup
        await supabase
          .from('auth_logs')
          .insert([
            {
              user_id: user.id,
              action: 'sign_up',
              ip_address: 'client-side',
              user_agent: navigator.userAgent
            }
          ])

        toast.success('Check your email for the confirmation link!')
        navigate('/sign-in')
      }
    } catch (error) {
      const authError = error as AuthError | Error
      setError(authError.message || 'An error occurred during sign up')
      toast.error(authError.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a...
              </label>
              <select
                id="role"
                name="role"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="tourist">Tourist</option>
                <option value="local">Local Guide</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location (Optional)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/sign-in"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 