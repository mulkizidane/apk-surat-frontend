import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// 1. Import fungsi getSuratMasuk
import { getSuratMasuk } from '../api/api'; 
import { useAuth } from '../context/AuthContext';

export default function SuratMasukPage() {
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadSuratMasuk = async () => {
      try {
        // 2. Panggil API untuk mengambil data
        const response = await getSuratMasuk();
        setSuratList(response.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat data surat masuk.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSuratMasuk();
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
        <h1 className="text-3xl font-bold text-gray-800">Daftar Surat Masuk</h1>
        {user?.role === 'admin_tu' && (
          <Link 
            to="/dashboard/surat-masuk/upload" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            Upload Surat Eksternal
          </Link>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {suratList.length === 0 ? (
          <p className="text-gray-500">Belum ada surat masuk yang diarsipkan.</p>
        ) : (
          // 3. Tampilkan data dalam bentuk tabel
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Surat Asli</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengirim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Diterima</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <tr key={surat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.nomor_surat_asli}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.perihal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{surat.pengirim}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{surat.tanggal_diterima}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                        {surat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Nanti kita akan buat halaman detailnya */}
                      <Link to={`/dashboard/surat-masuk/${surat.id}`} className="text-indigo-600 hover:text-indigo-900">
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