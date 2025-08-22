import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PostgrestError } from '@supabase/supabase-js'

interface Experience {
  id: string
  title: string
  description: string
  price: number
  duration: number
  location: string
  category: string
  max_participants: number
  creator_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  images: string[] | null
}

interface Stats {
  totalExperiences: number
  pendingApprovals: number
  totalBookings: number
}

export default function AdminDashboard() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [stats, setStats] = useState<Stats>({
    totalExperiences: 0,
    pendingApprovals: 0,
    totalBookings: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingExperience, setUpdatingExperience] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null)
    try {
      // Fetch experiences
      const { data: experiencesData, error: experiencesError } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false })

      if (experiencesError) throw experiencesError

      // Fetch bookings count
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

      if (bookingsError) throw bookingsError

      setExperiences(experiencesData)
      const pendingCount = experiencesData.filter((exp: Experience) => exp.status === 'pending').length

      setStats({
        totalExperiences: experiencesData.length,
        pendingApprovals: pendingCount,
        totalBookings: bookingsCount || 0
      })
    } catch (error) {
      const pgError = error as PostgrestError
      console.error('Error fetching data:', pgError)
      setError(pgError.message || 'Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStatusChange = async (experienceId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingExperience(experienceId)
    try {
      const { error } = await supabase
        .from('experiences')
        .update({ status: newStatus })
        .eq('id', experienceId)

      if (error) throw error

      // Update local state
      setExperiences(prev =>
        prev.map(exp =>
          exp.id === experienceId ? { ...exp, status: newStatus } : exp
        )
      )

      // Update stats
      if (newStatus === 'approved' || newStatus === 'rejected') {
        setStats(prev => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1
        }))
      }
    } catch (error) {
      const pgError = error as PostgrestError
      console.error('Error updating status:', pgError)
      alert(pgError.message || 'Failed to update experience status. Please try again.')
    } finally {
      setUpdatingExperience(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Experiences</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalExperiences}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalBookings}</p>
        </div>
      </div>

      {/* Experience Management */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Experience Management</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {experiences.map(experience => (
                <tr key={experience.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {experience.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {experience.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="capitalize">{experience.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    ${experience.price}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      experience.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : experience.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {experience.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    {experience.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(experience.id, 'approved')}
                          disabled={updatingExperience === experience.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          {updatingExperience === experience.id ? 'Updating...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(experience.id, 'rejected')}
                          disabled={updatingExperience === experience.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {updatingExperience === experience.id ? 'Updating...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 