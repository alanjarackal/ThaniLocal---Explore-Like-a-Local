import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalExperiences: number;
  totalBookings: number;
  pendingExperiences: number;
  activeUsers: number;
  totalRevenue: number;
  bookingsByStatus: {
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  popularLocations: Array<{
    location: string;
    count: number;
  }>;
  recentBookings: Array<{
    id: string;
    experience_title: string;
    user_name: string;
    booking_date: string;
    status: string;
  }>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  sustainabilityMetrics: {
    localHostPercentage: number;
    averageGroupSize: number;
    carbonFootprint: number;
    localEconomicImpact: number;
    culturalExperiencesCount: number;
    sustainableCertifiedCount: number;
  };
  sustainabilityTrends: Array<{
    date: string;
    localSpending: number;
    carbonSaved: number;
  }>;
}

interface ExperienceWithSustainability {
  sustainability_rating: number;
  is_cultural: boolean;
  is_certified_sustainable: boolean;
  estimated_carbon_footprint: number;
  local_vendor_spending: number;
}

interface BookingWithSustainability {
  participants: number;
  experiences: ExperienceWithSustainability;
}

type TimeRange = '7days' | '30days' | '90days' | 'all';

type SupabaseBookingResponse = {
  id: string;
  booking_date: string;
  status: string;
  experiences: {
    title: string;
  };
  profiles: {
    full_name: string;
  };
};

interface BookingStatusAccumulator {
  confirmed: number;
  pending: number;
  cancelled: number;
  [key: string]: number;
}

interface LocationCountAccumulator {
  [key: string]: number;
}

interface RevenueData {
  total_price: number;
}

interface UserGrowthData {
  created_at: string;
}

interface BookingTrendData {
  booking_date: string;
  total_price: number;
  status: string;
}

interface LocationData {
  location: string | null;
}

interface BookingStatusData {
  status: string;
}

interface HostData {
  is_local: boolean;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalExperiences: 0,
    totalBookings: 0,
    pendingExperiences: 0,
    activeUsers: 0,
    totalRevenue: 0,
    bookingsByStatus: {
      confirmed: 0,
      pending: 0,
      cancelled: 0
    },
    popularLocations: [],
    recentBookings: [],
    userGrowth: [],
    bookingTrends: [],
    sustainabilityMetrics: {
      localHostPercentage: 0,
      averageGroupSize: 0,
      carbonFootprint: 0,
      localEconomicImpact: 0,
      culturalExperiencesCount: 0,
      sustainableCertifiedCount: 0,
    },
    sustainabilityTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [timeRange, isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    switch (timeRange) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '90days':
        start.setDate(end.getDate() - 90);
        break;
      case 'all':
        start.setFullYear(2020); // Or your app's start date
        break;
    }
    return { start, end };
  };

  const fetchDashboardStats = async () => {
    try {
      const { start, end } = getDateRange();

      // Fetch total users and active users with proper error handling
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (userError) throw new Error(`Error fetching users: ${userError.message}`);

      const { count: activeUserCount, error: activeUserError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      if (activeUserError) throw new Error(`Error fetching active users: ${activeUserError.message}`);

      // Fetch experience stats with proper error handling
      const { count: experienceCount, error: experienceError } = await supabase
        .from('experiences')
        .select('*', { count: 'exact' });

      if (experienceError) throw new Error(`Error fetching experiences: ${experienceError.message}`);

      const { count: pendingCount, error: pendingError } = await supabase
        .from('experiences')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      if (pendingError) throw new Error(`Error fetching pending experiences: ${pendingError.message}`);

      // Fetch booking stats
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' });

      // Fetch bookings by status with proper typing
      const { data: bookingStatusData } = await supabase
        .from('bookings')
        .select('status')
        .not('status', 'is', null) as { data: BookingStatusData[] | null };

      const bookingsByStatus = (bookingStatusData || []).reduce((acc: BookingStatusAccumulator, curr) => {
        const status = curr.status as keyof BookingStatusAccumulator;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, { confirmed: 0, pending: 0, cancelled: 0 });

      // Calculate total revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'confirmed');

      const totalRevenue = (revenueData || []).reduce((sum: number, booking: RevenueData) => 
        sum + (booking.total_price || 0), 0
      );

      // Fetch popular locations with proper typing
      const { data: locationData } = await supabase
        .from('experiences')
        .select('location')
        .not('location', 'is', null) as { data: LocationData[] | null };

      const locationCounts = (locationData || []).reduce((acc: LocationCountAccumulator, curr) => {
        if (curr.location) {
          acc[curr.location] = (acc[curr.location] || 0) + 1;
        }
        return acc;
      }, {});

      const popularLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Fetch recent bookings with proper typing
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          status,
          experiences:experiences_id!inner (
            title
          ),
          profiles:user_id!inner (
            full_name
          )
        `)
        .order('booking_date', { ascending: false })
        .limit(5) as { data: SupabaseBookingResponse[] | null };

      // Fetch user growth data
      const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

      const userGrowth = processGrowthData(userGrowthData || [], start, end);

      // Fetch booking trends
      const { data: bookingTrendsData } = await supabase
        .from('bookings')
        .select('booking_date, total_price, status')
        .gte('booking_date', start.toISOString())
        .lte('booking_date', end.toISOString())
        .order('booking_date');

      const bookingTrends = processBookingTrends(bookingTrendsData || [], start, end);

      // Fetch sustainability metrics with proper typing
      const { data: hostData } = await supabase
        .from('profiles')
        .select('is_local')
        .eq('role', 'host') as { data: HostData[] | null };
      
      const localHostPercentage = hostData 
        ? (hostData.filter(h => h.is_local).length / hostData.length) * 100 
        : 0;

      const { data: bookingDetails } = await supabase
        .from('bookings')
        .select(`
          participants,
          experiences!inner (
            sustainability_rating,
            is_cultural,
            is_certified_sustainable,
            estimated_carbon_footprint,
            local_vendor_spending
          )
        `)
        .eq('status', 'confirmed') as { data: BookingWithSustainability[] | null };

      const sustainabilityMetrics = {
        localHostPercentage,
        averageGroupSize: bookingDetails 
          ? bookingDetails.reduce((acc, curr) => acc + curr.participants, 0) / bookingDetails.length 
          : 0,
        carbonFootprint: bookingDetails
          ? bookingDetails.reduce((acc, curr) => acc + (curr.experiences.estimated_carbon_footprint || 0), 0)
          : 0,
        localEconomicImpact: bookingDetails
          ? bookingDetails.reduce((acc, curr) => acc + (curr.experiences.local_vendor_spending || 0), 0)
          : 0,
        culturalExperiencesCount: bookingDetails
          ? bookingDetails.filter(b => b.experiences.is_cultural).length
          : 0,
        sustainableCertifiedCount: bookingDetails
          ? bookingDetails.filter(b => b.experiences.is_certified_sustainable).length
          : 0,
      };

      setStats({
        totalUsers: userCount || 0,
        activeUsers: activeUserCount || 0,
        totalExperiences: experienceCount || 0,
        totalBookings: bookingCount || 0,
        pendingExperiences: pendingCount || 0,
        totalRevenue,
        bookingsByStatus: {
          confirmed: bookingsByStatus.confirmed || 0,
          pending: bookingsByStatus.pending || 0,
          cancelled: bookingsByStatus.cancelled || 0
        },
        popularLocations,
        recentBookings: (recentBookings || []).map(booking => ({
          id: booking.id,
          experience_title: booking.experiences.title,
          user_name: booking.profiles.full_name,
          booking_date: booking.booking_date,
          status: booking.status,
        })),
        userGrowth,
        bookingTrends,
        sustainabilityMetrics,
        sustainabilityTrends: processSustainabilityTrends(bookingDetails || [], start, end),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const processGrowthData = (data: UserGrowthData[], start: Date, end: Date) => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const growth = Array.from({ length: days }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        count: 0
      };
    });

    data.forEach(item => {
      if (item.created_at) {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        const index = growth.findIndex(g => g.date === date);
        if (index !== -1) {
          growth[index].count++;
        }
      }
    });

    return growth;
  };

  const processBookingTrends = (data: BookingTrendData[], start: Date, end: Date) => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const trends = Array.from({ length: days }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        bookings: 0,
        revenue: 0
      };
    });

    data.forEach(item => {
      if (item.booking_date && item.status === 'confirmed') {
        const date = new Date(item.booking_date).toISOString().split('T')[0];
        const index = trends.findIndex(t => t.date === date);
        if (index !== -1) {
          trends[index].bookings++;
          trends[index].revenue += item.total_price || 0;
        }
      }
    });

    return trends;
  };

  const processSustainabilityTrends = (data: BookingWithSustainability[], start: Date, end: Date) => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const trends = Array.from({ length: days }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        localSpending: 0,
        carbonSaved: 0
      };
    });

    data.forEach(booking => {
      if (booking.experiences) {
        const date = new Date().toISOString().split('T')[0]; // Use current date for demo
        const index = trends.findIndex(t => t.date === date);
        if (index !== -1) {
          trends[index].localSpending += booking.experiences.local_vendor_spending || 0;
          trends[index].carbonSaved += booking.experiences.estimated_carbon_footprint || 0;
        }
      }
    });

    return trends;
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={() => {
              const data = {
                users: stats.userGrowth,
                bookings: stats.bookingTrends,
                revenue: stats.bookingTrends.map(t => ({ date: t.date, revenue: t.revenue }))
              };
              const csv = Object.entries(data).map(([key, values]) => {
                const headers = Object.keys(values[0]).join(',');
                const rows = values.map(v => Object.values(v).join(',')).join('\n');
                return `${key}\n${headers}\n${rows}\n\n`;
              }).join('');
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `dashboard_stats_${timeRange}.csv`;
              a.click();
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
          <p className="text-3xl font-bold text-emerald-600">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.activeUsers} active users
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Experiences</h3>
          <p className="text-3xl font-bold text-emerald-600">{stats.totalExperiences}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.pendingExperiences} pending approval
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
          <p className="text-3xl font-bold text-emerald-600">{stats.totalBookings}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.bookingsByStatus.confirmed} confirmed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="text-3xl font-bold text-emerald-600">
            ${stats.totalRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            From {stats.bookingsByStatus.confirmed} confirmed bookings
          </p>
        </div>
      </div>

      {/* Growth Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 relative">
            {stats.userGrowth.map((data, index) => (
              <div
                key={data.date}
                className="absolute bottom-0 left-0 w-full"
                style={{
                  height: `${(data.count / Math.max(...stats.userGrowth.map(d => d.count))) * 100}%`,
                  width: `${100 / stats.userGrowth.length}%`,
                  left: `${(index / stats.userGrowth.length) * 100}%`
                }}
              >
                <div
                  className="absolute bottom-0 w-full bg-emerald-500 opacity-75 transition-all hover:opacity-100"
                  style={{ height: '100%' }}
                  title={`${data.date}: ${data.count} new users`}
                />
              </div>
            ))}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200" />
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>{stats.userGrowth[0]?.date}</span>
            <span>{stats.userGrowth[stats.userGrowth.length - 1]?.date}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking & Revenue Trends</h3>
          <div className="h-64 relative">
            {stats.bookingTrends.map((data, index) => (
              <div
                key={data.date}
                className="absolute bottom-0 left-0 w-full"
                style={{
                  height: `${(data.bookings / Math.max(...stats.bookingTrends.map(d => d.bookings))) * 100}%`,
                  width: `${100 / stats.bookingTrends.length}%`,
                  left: `${(index / stats.bookingTrends.length) * 100}%`
                }}
              >
                <div
                  className="absolute bottom-0 w-full bg-emerald-500 opacity-75 transition-all hover:opacity-100"
                  style={{ height: '100%' }}
                  title={`${data.date}: ${data.bookings} bookings, $${data.revenue.toFixed(2)} revenue`}
                />
              </div>
            ))}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200" />
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>{stats.bookingTrends[0]?.date}</span>
            <span>{stats.bookingTrends[stats.bookingTrends.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confirmed</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${(stats.bookingsByStatus.confirmed / stats.totalBookings) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.bookingsByStatus.confirmed}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{
                      width: `${(stats.bookingsByStatus.pending / stats.totalBookings) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.bookingsByStatus.pending}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${(stats.bookingsByStatus.cancelled / stats.totalBookings) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.bookingsByStatus.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Locations</h3>
          <div className="space-y-4">
            {stats.popularLocations.map((location) => (
              <div key={location.location} className="flex justify-between items-center">
                <span className="text-gray-600">{location.location}</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${(location.count / stats.popularLocations[0].count) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{location.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sustainability Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Local Economic Impact</h3>
            <p className="text-3xl font-bold text-emerald-600">
              ${stats.sustainabilityMetrics.localEconomicImpact.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.sustainabilityMetrics.localHostPercentage.toFixed(1)}% local hosts
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Environmental Impact</h3>
            <p className="text-3xl font-bold text-emerald-600">
              {stats.sustainabilityMetrics.carbonFootprint.toFixed(1)} kg CO₂
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Avg group size: {stats.sustainabilityMetrics.averageGroupSize.toFixed(1)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Cultural Preservation</h3>
            <p className="text-3xl font-bold text-emerald-600">
              {stats.sustainabilityMetrics.culturalExperiencesCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.sustainabilityMetrics.sustainableCertifiedCount} certified sustainable
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/experiences"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Experiences</h3>
          <p className="text-gray-600">Review and manage experience listings</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Users</h3>
          <p className="text-gray-600">View and manage user accounts</p>
        </Link>

        <Link
          to="/admin/bookings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Bookings</h3>
          <p className="text-gray-600">Handle booking requests and issues</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="divide-y">
          {stats.recentBookings.map((booking) => (
            <div key={booking.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{booking.experience_title}</h4>
                  <p className="text-sm text-gray-600">Booked by {booking.user_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}