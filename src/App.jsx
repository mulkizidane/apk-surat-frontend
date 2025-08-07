import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import SuratKeluarPage from './pages/SuratKeluarPage';
import SuratKeluarForm from './pages/SuratKeluarForm';
import SuratKeluarDetailPage from './pages/SuratKeluarDetailPage';

// Komponen untuk melindungi rute
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center p-8">Loading application...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="surat-keluar" element={<SuratKeluarPage />} />
            <Route path="surat-keluar/baru" element={<SuratKeluarForm />} />
            <Route path="surat-keluar/:id" element={<SuratKeluarDetailPage />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            localStorage.getItem('jwt_token') ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
