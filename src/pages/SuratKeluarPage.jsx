import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSuratKeluar } from '../api/api'; 

// Helper function untuk styling status agar lebih berwarna
const getStatusBadge = (status) => {
  const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize";
  switch (status) {
    case 'menunggu_penomoran':
    case 'proses_approval_atasan':
    case 'proses_approval_pimpinan':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'selesai_terkirim':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'revisi':
      return `${baseClasses} bg-orange-100 text-orange-800`;
    case 'ditolak':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};


export default function SuratKeluarPage() {
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSuratKeluar = async () => {
      try {
        setError('');
        setIsLoading(true);
        
        const response = await getSuratKeluar(); 
        
        if (response && Array.isArray(response.data)) {
          setSuratList(response.data);
        } else {
          console.warn("API tidak mengembalikan format array yang diharapkan:", response);
          setSuratList([]);
        }

      } catch (err) {
        setError(err.message || 'Gagal memuat data surat keluar.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSuratKeluar();
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
          Buat Draf Surat
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Surat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <tr key={surat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.nomor_surat || 'Belum Dinomori'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.isi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{surat.tanggal}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(surat.status)}>
                        {surat.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* PERBAIKAN UTAMA: Link sekarang mengarah ke halaman detail umum */}
                      <Link to={`/dashboard/surat-keluar/${surat.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Detail
                      </Link>
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