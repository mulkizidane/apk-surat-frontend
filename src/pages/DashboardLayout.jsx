import React from 'react';
// Import komponen-komponen penting dari react-router-dom
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// Import hook dan fungsi logout dari context dan api
import { useAuth } from '../context/AuthContext';
import { logout as apiLogout } from '../api/auth';

export default function DashboardLayout() {
  // Ambil data user dan fungsi logout dari AuthContext
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    apiLogout(); // Panggil fungsi logout dari API untuk membersihkan token di apiClient
    logout(); // Panggil fungsi logout dari context untuk membersihkan state global
    navigate('/login'); // Arahkan kembali ke halaman login
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="px-4 py-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Aplikasi Surat</h1>
          {/* Tampilkan nama dan role user jika ada */}
          {user && (
            <div className="mt-2">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        
        {/* Menu Navigasi */}
        <nav className="flex-grow p-4">
          <ul>
            <li className="mb-2">
              {/* Gunakan NavLink untuk mendapatkan styling otomatis saat link aktif */}
              <NavLink 
                to="/dashboard"
                end // Prop 'end' penting agar link ini tidak aktif saat di sub-route
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`
                }
              >
                {/* Anda bisa menambahkan icon di sini nanti */}
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/dashboard/surat-keluar"
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`
                }
              >
                <span>Surat Keluar</span>
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/dashboard/surat-masuk"
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`
                }
              >
                <span>Surat Masuk</span>
              </NavLink>
            </li> 
            {/* Tambahkan link menu lainnya di sini, contoh: */}
            {/* <li className="mb-2">
              <NavLink 
                to="/dashboard/surat-masuk"
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-indigo-600' : ''}`
                }
              >
                <span>Surat Masuk</span>
              </NavLink>
            </li> 
            */}
          </ul>
        </nav>
        
        {/* Tombol Logout di bagian bawah sidebar */}
        <div className="p-4 border-t border-gray-700">
            <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 rounded transition-colors duration-200 hover:bg-red-700 bg-red-600"
            >
                {/* Icon logout bisa ditambahkan di sini */}
                <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Outlet akan merender komponen halaman sesuai route (DashboardPage, SuratKeluarPage, dll) */}
        <Outlet />
      </main>
    </div>
  );
}
