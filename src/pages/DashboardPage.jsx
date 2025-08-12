import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Komponen Card untuk menampilkan daftar tugas
const TaskCard = ({ title, tasks, linkPrefix }) => {
  // Pastikan tasks adalah array, jika tidak, anggap saja kosong
  const taskList = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">
        {title} <span className="text-sm font-normal text-gray-500">({taskList.length})</span>
      </h3>
      
      {taskList.length === 0 ? (
        <p className="text-sm text-gray-500">Tidak ada tugas.</p>
      ) : (
        <div className="space-y-3">
          {taskList.map((task) => (
            <div key={task.id} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-gray-700 font-semibold">{task.perihal}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ID Surat: #{task.id}
                </p>
              </div>
              <Link
                to={`${linkPrefix}/${task.id}`}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Proses
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default function DashboardPage() {
  // State awal diubah menjadi objek kosong {} agar lebih aman
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getDashboardData();
        // Jika response.data kosong, state akan menjadi objek kosong, bukan undefined
        setDashboardData(response.data || {});
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal memuat data dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <p className="text-center p-8">Memuat data dashboard...</p>;
  }

  if (error) {
    return <p className="text-center p-8 text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Selamat datang kembali, {user?.name || 'Pengguna'}.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TaskCard 
            title="Tugas Verifikasi Surat" 
            // Sekarang aman untuk langsung akses seperti ini
            tasks={dashboardData.tugas_verifikasi}
            linkPrefix="/dashboard/verifikasi"
        />
        {/* Nanti kita bisa tambahkan card lain di sini */}
      </div>
    </div>
  );
}
