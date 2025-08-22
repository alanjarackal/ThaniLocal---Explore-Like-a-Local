import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

interface Booking {
  id: string
  experience: {
    id: string
    title: string
    location: string
    price: number
    host: {
      full_name: string
    }
  }
  booking_date: string
  participants: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          experience:experience_id (
            id,
            title,
            location,
            price,
            host:host_id (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true })

      if (error) throw error

      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      )
      toast.success('Booking cancelled successfully')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.booking_date)
    const today = new Date()
    return activeTab === 'upcoming'
      ? bookingDate >= today
      : bookingDate < today
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'upcoming'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'past'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Past
          </button>
        </nav>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No {activeTab} bookings found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {booking.experience.title}
                  </h2>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'}
                    `}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{booking.experience.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Host</p>
                    <p className="font-medium text-gray-900">{booking.experience.host.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="font-medium text-gray-900">{booking.participants}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${booking.total_price.toFixed(2)}
                    </p>
                  </div>

                  {booking.status !== 'cancelled' && activeTab === 'upcoming' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 