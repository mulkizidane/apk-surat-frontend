import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInbox } from '../api/api'; // Panggil API inbox yang baru

export default function SuratMasukPage() {
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInbox = async () => {
      try {
        const response = await getInbox();
        setSuratList(response.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat data inbox surat masuk.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInbox();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Memuat data inbox...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Surat Masuk (Inbox)</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        {suratList.length === 0 ? (
          <p className="text-gray-500">Tidak ada surat di inbox Anda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Agenda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <tr key={surat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{surat.nomor_agenda_masuk || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.perihal}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {surat.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/dashboard/surat-masuk/${surat.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Lihat Detail
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