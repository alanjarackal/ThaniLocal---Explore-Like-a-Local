import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

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
  host: {
    id: string
    full_name: string
    email: string
  }
}

export default function ManageExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          host:host_id (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setExperiences(data || [])
    } catch (error) {
      console.error('Error fetching experiences:', error)
      toast.error('Failed to load experiences')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (experienceId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('experiences')
        .update({ status: newStatus })
        .eq('id', experienceId)

      if (error) throw error

      setExperiences(prev =>
        prev.map(exp =>
          exp.id === experienceId ? { ...exp, status: newStatus } : exp
        )
      )

      toast.success(`Experience ${newStatus} successfully`)
    } catch (error) {
      console.error('Error updating experience status:', error)
      toast.error('Failed to update experience status')
    }
  }

  const filteredExperiences = experiences.filter(exp => {
    const matchesStatus = selectedStatus === 'all' || exp.status === selectedStatus
    const matchesSearch = searchQuery
      ? exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.host.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Experiences</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No experiences found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
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
              {filteredExperiences.map((experience) => (
                <tr key={experience.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {experience.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {experience.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {experience.host.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {experience.host.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      ${experience.price} / person
                    </div>
                    <div className="text-sm text-gray-500">
                      {experience.duration}h • Max {experience.max_participants} people
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        experience.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : experience.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {experience.status.charAt(0).toUpperCase() + experience.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {experience.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(experience.id, 'approved')}
                          className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(experience.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 