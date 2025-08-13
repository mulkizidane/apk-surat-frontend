import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSuratMasuk } from '../api/api';

export default function VerifikasiMasukPage() {
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSurat = async () => {
      try {
        setError('');
        setIsLoading(true);
        const response = await getSuratMasuk(); 
        setSuratList(response.data || []);
      } catch (err) {
        setError(err.response?.data?.messages?.error || 'Gagal memuat data surat masuk.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurat();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Memuat data verifikasi...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Verifikasi & Distribusi Surat Masuk</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {suratList.length === 0 ? (
          <p className="text-gray-500">Tidak ada surat masuk baru yang perlu diverifikasi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Surat</th>
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
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize">
                        Perlu Verifikasi
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* DIUBAH: Link sekarang mengarah ke halaman distribusi */}
                      <Link to={`/dashboard/distribusi/${surat.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Proses & Distribusi
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