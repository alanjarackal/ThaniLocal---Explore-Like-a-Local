import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Experiences } from './pages/Experiences';
import Marketplace from './pages/Marketplace';
import CreateExperience from './pages/CreateExperience';
import GenerateItinerary from './pages/GenerateItinerary';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './pages/AdminLayout';
import ManageExperiences from './pages/admin/ManageExperiences';
import ManageUsers from './pages/admin/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export function AppRoutes() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/experiences" element={<ErrorBoundary><Experiences /></ErrorBoundary>} />
        <Route path="/marketplace" element={<ErrorBoundary><Marketplace /></ErrorBoundary>} />
        <Route 
          path="/create-experience" 
          element={
            <ProtectedRoute>
              <ErrorBoundary><CreateExperience /></ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route path="/generate-itinerary" element={<ErrorBoundary><GenerateItinerary /></ErrorBoundary>} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ErrorBoundary><Profile /></ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-bookings" 
          element={
            <ProtectedRoute>
              <ErrorBoundary><MyBookings /></ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route path="/sign-in" element={<ErrorBoundary><SignIn /></ErrorBoundary>} />
        <Route path="/sign-up" element={<ErrorBoundary><SignUp /></ErrorBoundary>} />
        <Route
          path="/forgot-password"
          element={
            <ErrorBoundary>
              <ForgotPassword />
            </ErrorBoundary>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ErrorBoundary>
              <ResetPassword />
            </ErrorBoundary>
          }
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <ErrorBoundary><AdminLayout /></ErrorBoundary>
            </AdminRoute>
          }
        >
          <Route index element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
          <Route path="experiences" element={<ErrorBoundary><ManageExperiences /></ErrorBoundary>} />
          <Route path="users" element={<ErrorBoundary><ManageUsers /></ErrorBoundary>} />
        </Route>
      </Routes>
    </main>
  );
} 