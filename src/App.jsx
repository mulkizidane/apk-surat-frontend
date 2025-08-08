import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import SuratKeluarPage from './pages/SuratKeluarPage';
import SuratKeluarForm from './pages/SuratKeluarForm';
import SuratMasukPage from './pages/SuratMasukPage';
import SuratMasukForm from './pages/SuratMasukForm';
import VerifikasiDetailPage from './pages/VerifikasiDetailPage';
import SuratMasukDetailPage from './pages/SuratMasukDetailPage';
import AdminSuratKeluarPage from './pages/AdminSuratKeluarPage';
import SuratKeluarEditPage from './pages/SuratKeluarEditPage';




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
            <Route path="verifikasi/:id" element={<VerifikasiDetailPage />} />
            {/* 👇 2. TAMBAHKAN RUTE BARU DI SINI 👇 */}
            <Route path="surat-masuk" element={<SuratMasukPage />} />
            <Route path="surat-masuk/upload" element={<SuratMasukForm />} />
            <Route path="surat-masuk/:id" element={<SuratMasukDetailPage />} />
            <Route path="admin/surat-keluar/:id/verify" element={<AdminSuratKeluarPage />} />
            <Route path="surat-keluar/:id/edit" element={<SuratKeluarEditPage />} />
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
