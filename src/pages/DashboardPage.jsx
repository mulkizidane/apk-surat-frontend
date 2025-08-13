import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Komponen Card untuk Tugas Verifikasi (untuk Pimpinan/Atasan)
const TaskCard = ({ title, tasks, linkPrefix }) => {
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

// Komponen Card BARU untuk Tugas Distribusi (untuk Admin TU)
const InfoCard = ({ title, count, description, linkTo, linkText }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                <p className="text-5xl font-bold text-indigo-600 mt-4">{count}</p>
                <p className="text-sm text-gray-500 mt-2">{description}</p>
            </div>
            <Link
                to={linkTo}
                className="mt-6 w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
            >
                {linkText}
            </Link>
        </div>
    );
};


export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getDashboardData();
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
        
        {/* Tampilkan InfoCard jika user adalah Admin TU dan ada data tugas_distribusi */}
        {user?.role === 'admin_tu' && typeof dashboardData.tugas_distribusi !== 'undefined' && (
            <InfoCard
                title="Tugas Verifikasi & Distribusi"
                count={dashboardData.tugas_distribusi}
                description="Jumlah surat masuk dan keluar yang memerlukan verifikasi dan distribusi dari Anda."
                linkTo="/dashboard/verifikasi-masuk" // Arahkan ke salah satu halaman verifikasi
                linkText="Lihat Tugas"
            />
        )}

        <TaskCard 
            title="Tugas Persetujuan Surat" 
            tasks={dashboardData.tugas_verifikasi}
            linkPrefix="/dashboard/verifikasi"
        />

      </div>
    </div>
  );
}