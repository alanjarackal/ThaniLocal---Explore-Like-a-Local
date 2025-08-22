import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <nav className="fixed w-full top-0 z-50 bg-white/20 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-32 bg-gray-200/50 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-20 bg-gray-200/50 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/20 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-emerald-600">
                ThaniLocal
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/experiences"
                className="border-transparent text-white hover:border-white hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Experiences
              </Link>
              <Link
                to="/marketplace"
                className="border-transparent text-white hover:border-white hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Marketplace
              </Link>
              <Link
                to="/generate-itinerary"
                className="border-transparent text-white hover:border-white hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Generate Itinerary
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/80 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden sm:flex sm:items-center">
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/sign-in"
                  className="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-white text-emerald-600 hover:bg-white/90 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-black/20 backdrop-blur-md`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/experiences"
            className="text-white hover:bg-white/10 hover:text-white/80 block px-3 py-2 text-base font-medium transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Experiences
          </Link>
          <Link
            to="/marketplace"
            className="text-white hover:bg-white/10 hover:text-white/80 block px-3 py-2 text-base font-medium transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link
            to="/generate-itinerary"
            className="text-white hover:bg-white/10 hover:text-white/80 block px-3 py-2 text-base font-medium transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Generate Itinerary
          </Link>
        </div>
        {/* Mobile auth buttons */}
        {!user && (
          <div className="pt-4 pb-3 border-t border-white/10">
            <div className="space-y-1">
              <Link
                to="/sign-in"
                className="text-white hover:bg-white/10 hover:text-white/80 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="text-white hover:bg-white/10 hover:text-white/80 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}