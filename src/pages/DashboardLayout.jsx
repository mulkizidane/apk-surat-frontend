import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans ">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="px-4 py-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Aplikasi Surat</h1>
          {user && (
            <div className="mt-2">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        
        {/* === PERUBAHAN UTAMA DI SINI === */}
        <nav className="flex-grow p-4 ">
          <ul>
            <li className="mb-2">
              <NavLink to="/dashboard" end className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                Dashboard
              </NavLink>
            </li>

            {/* Menu ini HANYA MUNCUL untuk Admin TU */}
            {user?.role === 'admin_tu' && (
              <li className="mb-2">
                <NavLink to="/dashboard/verifikasi-masuk" className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                  Verifikasi Surat Masuk
                </NavLink>
              </li>
            )}
            {user?.role === 'admin_tu' && (
              <li className="mb-2">
                <NavLink to="/dashboard/verifikasi-keluar" className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                  Verifikasi Surat Keluar
                </NavLink>
              </li>
            )}
            {/* Menu HANYA MUNCUL untuk Pimpinan Unit */}
            {user?.role === 'pimpinan_unit' && (
              <li className="mb-2">
                <NavLink to="/dashboard/disposisi" className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                  Disposisi Surat Masuk
                </NavLink>
              </li>
            )}
            {user?.role === 'atasan_terkait' && (
              <li className="mb-2">
                <NavLink to="/dashboard/disposisi" className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                  Disposisi Surat Masuk
                </NavLink>
              </li>
            )}

            
            <li className="mb-2">
              <NavLink to="/dashboard/surat-keluar" className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                Surat Keluar
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink to="/dashboard/surat-masuk" className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                Surat Masuk (Inbox)
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink to="/dashboard/arsip" className={({ isActive }) => `block px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`}>
                Arsip Surat
              </NavLink>
            </li>
          </ul>
        </nav>
        
        
        <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded transition-colors duration-200 hover:bg-red-700 bg-red-600">
                Logout
            </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
