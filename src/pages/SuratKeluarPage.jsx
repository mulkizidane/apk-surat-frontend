import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSuratKeluar } from '../api/api';

const StatusBadge = ({ status }) => {
    const statusMap = {
        MENUNGGU_VERIFIKASI_ADMIN: 'bg-gray-200 text-gray-800',
        PROSES_PERSETUJUAN: 'bg-blue-200 text-blue-800',
        DIKEMBALIKAN_PENGIRIM: 'bg-yellow-200 text-yellow-800',
        DITOLAK: 'bg-red-200 text-red-800',
        TERKIRIM: 'bg-green-200 text-green-800',
        SELESAI: 'bg-green-200 text-green-800',
    };

    const colorClass = statusMap[status] || 'bg-gray-200 text-gray-800';
    const statusText = status.replace(/_/g, ' ').toLowerCase();

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass} capitalize`}>
            {statusText}
        </span>
    );
};

export default function SuratKeluarPage() {
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSurat = async () => {
      try {
        setError('');
        setIsLoading(true);
        const response = await getSuratKeluar();
        setSuratList(response.data || []);
      } catch (err) {
        setError(err.response?.data?.messages?.error || 'Gagal memuat data surat keluar.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurat();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Memuat data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Surat Keluar</h1>
        <Link 
          to="/dashboard/surat-keluar/baru" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          + Buat Surat Baru
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {suratList.length === 0 ? (
          <p className="text-gray-500">Belum ada surat keluar yang dibuat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <tr key={surat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.perihal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{surat.tanggal_surat}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {surat.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {surat.status === 'DIKEMBALIKAN_PENGIRIM' ? (
                        <Link to={`/dashboard/surat-keluar/edit/${surat.id}`} className="text-yellow-600 hover:text-yellow-900 mr-4">
                          Edit
                        </Link>
                      ) : (
                        <Link to={`/dashboard/surat-keluar/${surat.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Detail
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}