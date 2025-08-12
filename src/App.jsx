import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import SuratKeluarDetailPage from './pages/SuratKeluarDetailPage';
import SuratKeluarForm from './pages/SuratKeluarForm';
import SuratKeluarPage from './pages/SuratKeluarPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import VerifikasiDetailPage from './pages/VerifikasiDetailPage';
import SuratMasukPage from './pages/SuratMasukPage';
import SuratMasukDetailPage from './pages/SuratMasukDetailPage';
import VerifikasiMasukPage from './pages/VerifikasiSuratMasukPage';
import DistribusiDetailPage from './pages/DistribusiDetailPage';
import VerifikasiKeluarPage from './pages/VerifikasiKeluarPage';


const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
      <Routes>
      <Route path="/login" element={<LoginPage />} /> 
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="verifikasi/:suratId" element={<VerifikasiDetailPage />} />
          <Route path="surat-keluar" element={<SuratKeluarPage />} />
          <Route path="surat-keluar/baru" element={<SuratKeluarForm />} />
          <Route path="surat-keluar/edit/:id" element={<SuratKeluarForm />} />
          <Route path="surat-keluar/:id" element={<SuratKeluarDetailPage />} />
          <Route path="verifikasi-masuk" element={<VerifikasiMasukPage />} />
          <Route path="surat-masuk" element={<SuratMasukPage />} />
          <Route path="surat-masuk/:suratId" element={<SuratMasukDetailPage />} />
          <Route path="distribusi/:suratId" element={<DistribusiDetailPage />} />
          <Route path="verifikasi-keluar" element={<VerifikasiKeluarPage />} />
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
  );
}

export default App;