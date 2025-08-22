import { NavLink } from 'react-router-dom'

export default function AdminNav() {
  return (
    <nav className="mb-8">
      <div className="border-b border-gray-200">
        <div className="-mb-px flex space-x-8">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `border-b-2 py-4 px-1 text-sm font-medium ${
                isActive
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/experiences"
            className={({ isActive }) =>
              `border-b-2 py-4 px-1 text-sm font-medium ${
                isActive
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            Experiences
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `border-b-2 py-4 px-1 text-sm font-medium ${
                isActive
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`
            }
          >
            Users
          </NavLink>
        </div>
      </div>
    </nav>
  )
} 