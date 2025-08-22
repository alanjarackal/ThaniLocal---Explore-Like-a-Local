import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { AuthError } from '@supabase/supabase-js'
import { toast } from 'sonner'

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // First check if the user exists in the profiles table
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('id, email_verified')
        .eq('email', email)
        .single()

      if (!profileCheck) {
        throw new Error('No account found with this email. Please sign up first.')
      }

      // Attempt to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (!user) {
        throw new Error('Invalid credentials')
      }

      // Get the user's profile with role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Check if email is verified (if required by your app)
      if (profile && !profile.email_verified) {
        toast.warning('Please verify your email address. Check your inbox for the verification link.')
      }

      // Log successful sign in
      await supabase
        .from('auth_logs')
        .insert([
          {
            user_id: user.id,
            action: 'sign_in',
            ip_address: 'client-side',
            user_agent: navigator.userAgent
          }
        ])
        .select()

      toast.success('Successfully signed in!')
      navigate('/')
    } catch (error) {
      const authError = error as AuthError | Error
      setError(authError.message || 'An error occurred during sign in')
      toast.error(authError.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      setError(authError.message || 'An error occurred during Google sign in')
      toast.error('Failed to sign in with Google')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="font-medium text-sm text-emerald-600 hover:text-emerald-500"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSignInWithGoogle}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
            />
            Sign in with Google
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/sign-up"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
} 