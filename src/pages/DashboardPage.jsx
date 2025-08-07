import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import { getDashboardData } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Komponen Card diupdate untuk menerima properti `isVerification`
const TaskCard = ({ title, tasks, isVerification = false }) => {
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
          <div key={task.id} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
            <div>
              {isVerification ? (
                // Tampilan khusus untuk kartu verifikasi
                <p className="text-gray-700">Surat ID #{task.surat_id} menunggu persetujuan Anda.</p>
              ) : (
                // Tampilan umum untuk kartu lain
                <p className="text-gray-700">{task.perihal || task.isi || task.keterangan_disposisi}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {isVerification ? `Tipe: ${task.tipe}` : `Tanggal: ${new Date(task.tanggal_surat || task.tanggal_disposisi).toLocaleDateString('id-ID')}`}
              </p>
            </div>
            {isVerification && (
              // 2. Tambahkan Link ke halaman verifikasi
              <Link
                to={`/dashboard/verifikasi/${task.id}`} // `task.id` di sini adalah ID dari paraf_surat
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
  const { user } = useAuth(); // Ambil data user untuk personalisasi

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getDashboardData();
        setDashboardData(response.data); // Ingat, data dari axios ada di .data
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
        {/* 3. Beri properti isVerification={true} pada card yang tepat */}
        <TaskCard title="Surat Perlu Persetujuan" tasks={dashboardData?.perlu_persetujuan} isVerification={true} />
        <TaskCard title="Surat Masuk Baru" tasks={dashboardData?.surat_masuk_baru} />
        <TaskCard title="Disposisi untuk Anda" tasks={dashboardData?.disposisi_untuk_anda} />
        <TaskCard title="Surat Siap Kirim / Arsip" tasks={dashboardData?.siap_kirim} />
        <TaskCard title="Surat Sudah Didisposisi" tasks={dashboardData?.sudah_disposisi} />
      </div>
    </div>
  );
}
