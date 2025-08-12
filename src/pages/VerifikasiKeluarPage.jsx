import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVerifikasiKeluar } from '../api/api';

export default function VerifikasiKeluarPage() {
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getVerifikasiKeluar();
        setSuratList(response.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat data verifikasi surat keluar.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Memuat data...</div>;
  }
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Verifikasi Surat Keluar</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        {suratList.length === 0 ? (
          <p className="text-gray-500">Tidak ada surat baru yang perlu diverifikasi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor Surat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <tr key={surat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.perihal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{surat.nomor_surat || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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