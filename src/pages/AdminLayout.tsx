import { Outlet } from 'react-router-dom'
import AdminRoute from '../components/AdminRoute'

export default function AdminLayout() {
  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto p-6">
        <Outlet />
      </div>
    </AdminRoute>
  )
} 