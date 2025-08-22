import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Experiences } from './pages/Experiences';
import Marketplace from './pages/Marketplace';
import CreateExperience from './pages/CreateExperience';
import GenerateItinerary from './pages/GenerateItinerary';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ManageExperiences from './pages/admin/ManageExperiences';
import ManageUsers from './pages/admin/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Main App Routes */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/experiences" element={<Experiences />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route 
                    path="/create-experience" 
                    element={
                      <ProtectedRoute>
                        <CreateExperience />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/generate-itinerary" element={<GenerateItinerary />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/my-bookings" 
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="experiences" element={<ManageExperiences />} />
                    <Route path="users" element={<ManageUsers />} />
                  </Route>
                </Routes>
              </main>
              <Toaster 
                position="top-right"
                expand={true}
                richColors
                closeButton
              />
            </div>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;