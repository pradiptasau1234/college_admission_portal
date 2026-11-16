import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantDashboard from './pages/ApplicantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicationDetail from './pages/AdminApplicationDetail';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0b4a8f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/applicant'} replace />;
  }

  return children;
};

// Root index redirector
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/applicant'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<HomeRedirect />} />

              {/* Applicant Portal */}
              <Route
                path="/applicant"
                element={
                  <ProtectedRoute allowedRoles={['applicant']}>
                    <ApplicantDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Management Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Application Review Deep-Dive */}
              <Route
                path="/admin/applications/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminApplicationDetail />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Wildcard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
