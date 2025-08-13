import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArsipSurat } from '../api/api'; // Fungsi API baru yang akan kita buat

// Kita bisa gunakan lagi komponen StatusBadge dari SuratKeluarPage
const StatusBadge = ({ status }) => {
    const statusMap = {
        MENUNGGU_VERIFIKASI_ADMIN: 'bg-gray-200 text-gray-800',
        PROSES_PERSETUJUAN: 'bg-blue-200 text-blue-800',
        DIKEMBALIKAN_PENGIRIM: 'bg-yellow-200 text-yellow-800',
        DITOLAK: 'bg-red-200 text-red-800',
        TERKIRIM: 'bg-cyan-200 text-cyan-800',
        SELESAI: 'bg-green-200 text-green-800',
        DIARSIPKAN: 'bg-purple-200 text-purple-800',
    };

    const colorClass = statusMap[status] || 'bg-gray-200 text-gray-800';
    const statusText = status.replace(/_/g, ' ').toLowerCase();

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass} capitalize`}>
            {statusText}
        </span>
    );
};


export default function ArsipSuratPage() {
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArsip = async () => {
      try {
        const response = await getArsipSurat();
        setSuratList(response.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat data arsip surat.');
      } finally {
        setIsLoading(false);
      }
    };
    loadArsip();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Memuat arsip...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Arsip Surat</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        {suratList.length === 0 ? (
          <p className="text-gray-500">Arsip surat masih kosong.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl. Surat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Final</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <tr key={surat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{surat.perihal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{surat.tanggal_surat}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={surat.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Link ke detail surat keluar atau masuk tergantung tipenya */}
                      <Link to={`/dashboard/surat-${surat.tipe_surat === 'INTERNAL' ? 'keluar' : 'masuk'}/${surat.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Lihat Detail Arsip
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