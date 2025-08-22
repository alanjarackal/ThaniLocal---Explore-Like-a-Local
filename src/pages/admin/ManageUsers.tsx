import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: 'tourist' | 'local' | 'admin'
  status: 'active' | 'suspended'
  created_at: string
  last_sign_in_at: string | null
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<'all' | 'tourist' | 'local' | 'admin'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'suspended'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      )

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`)
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'tourist' | 'local' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, role: newRole }
            : user
        )
      )

      toast.success('User role updated successfully')
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    const matchesSearch = searchQuery
      ? user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesRole && matchesStatus && matchesSearch
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Users</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as typeof selectedRole)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="tourist">Tourist</option>
            <option value="local">Local</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="sm:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar_url || 'https://via.placeholder.com/40'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                      className="text-sm border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="tourist">Tourist</option>
                      <option value="local">Local</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(user.id, 'suspended')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Activate
                      </button>
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