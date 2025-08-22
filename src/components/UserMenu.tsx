import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../lib/store';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
        )}
        <span className="font-medium">{user.full_name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>

          {/* Regular user menu items */}
          <Link
            to="/my-bookings"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            My Bookings
          </Link>

          {/* Admin-only menu items */}
          {user.role === 'admin' && (
            <>
              <Link
                to="/admin/experiences"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Manage Experiences
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Manage Users
              </Link>
            </>
          )}

          <button
            onClick={async () => {
              await signOut();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}