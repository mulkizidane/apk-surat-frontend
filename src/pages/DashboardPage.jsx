import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../api/api';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ title, tasks, linkPrefix, linkSuffix = '', linkKey = 'id', titleKey = 'isi' }) => {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">
        {title} <span className="text-sm font-normal text-gray-500">({tasks.length})</span>
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task[linkKey]} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
            <div>
              <p className="text-gray-700">{task[titleKey] || `Tugas ID: ${task[linkKey]}`}</p>
              <p className="text-xs text-gray-400 mt-1">
                {task.tipe ? `Tipe: ${task.tipe}` : `Tanggal: ${new Date(task.tanggal || task.created_at || task.tanggal_diterima).toLocaleDateString('id-ID')}`}
              </p>
            </div>
            {linkPrefix && (
              <Link
                to={`${linkPrefix}/${task[linkKey]}${linkSuffix}`}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Proses
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getDashboardData();
        setDashboardData(response.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal memuat data. Coba refresh halaman.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <p className="text-center p-8">Loading dashboard data...</p>;
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
            title="Surat Perlu Persetujuan" 
            tasks={dashboardData?.perlu_persetujuan} 
            linkPrefix="/dashboard/verifikasi" 
            titleKey="surat_id"
        />
        
        <TaskCard 
            title="Surat Perlu Penomoran" 
            tasks={dashboardData?.perlu_penomoran} 
            linkPrefix="/dashboard/admin/surat-keluar"
            linkSuffix="/verify" // <-- PERBAIKAN KRUSIAL ADA DI SINI
            linkKey="id"
            titleKey="isi" 
        />
        <TaskCard 
            title="Surat Siap Kirim" 
            tasks={dashboardData?.siap_kirim} 
            linkPrefix="/dashboard/surat-keluar"
        />

        <TaskCard 
            title="Surat Masuk Baru" 
            tasks={dashboardData?.surat_masuk_baru} 
            linkPrefix="/dashboard/surat-masuk" 
            titleKey="perihal"
        />
        <TaskCard 
            title="Disposisi untuk Anda" 
            tasks={dashboardData?.disposisi_untuk_anda} 
            linkPrefix="/dashboard/surat-masuk" 
            titleKey="keterangan_disposisi" 
            linkKey="surat_masuk_id" 
        />
      </div>
    </div>
  );
}