import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSuratKeluarDetail } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function SuratKeluarDetailPage() {
    const { id } = useParams();
    const { user } = useAuth(); // Ambil user yang sedang login

    const [surat, setSurat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDetail = async () => {
            try {
                const response = await getSuratKeluarDetail(id);
                setSurat(response.data);
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                setError('Gagal memuat detail surat.');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadDetail();
    }, [id]);

    if (isLoading) return <div className="text-center p-8">Memuat detail surat...</div>;
    if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
    if (!surat) return <div className="text-center p-8">Surat tidak ditemukan.</div>;
    
    // Kondisi untuk menampilkan tombol edit: status surat 'revisi' DAN user yang login adalah pembuat surat
    const canEdit = surat.status === 'revisi' && user?.id.toString() === surat.created_by.toString();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Link to="/dashboard/surat-keluar" className="text-indigo-600 hover:underline">
                    &larr; Kembali ke Daftar Surat
                </Link>
                {/* Tampilkan tombol edit jika kondisi terpenuhi */}
                {canEdit && (
                    <Link to={`/dashboard/surat-keluar/${surat.id}/edit`} className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600">
                        Edit Surat Ini
                    </Link>
                )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Detail Surat Keluar</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Bagian Detail Utama Surat */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nomor Surat</h3>
                    <p className="mt-1 text-lg text-gray-900">{surat.nomor_surat || 'Belum Dinomori'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tanggal Surat</h3>
                    <p className="mt-1 text-lg text-gray-900">{surat.tanggal}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1 text-lg text-gray-900 capitalize font-semibold">{surat.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">Isi Ringkas</h3>
                    <p className="mt-1 text-lg text-gray-900">{surat.isi}</p>
                </div>
                
                {/* Riwayat Persetujuan/Paraf */}
                {surat.approvers && surat.approvers.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                         <h3 className="text-xl font-semibold text-gray-900 mb-4">Riwayat Persetujuan</h3>
                         <div className="space-y-4">
                            {surat.approvers.map(item => (
                                <div key={item.id} className={`p-4 rounded-lg border 
                                    ${item.status === 'revisi' ? 'bg-yellow-50 border-yellow-300' : ''}
                                    ${item.status === 'tolak' ? 'bg-red-50 border-red-300' : ''}
                                    ${item.status === 'setuju' ? 'bg-green-50 border-green-300' : ''}
                                    ${item.status === 'pending' || item.status === 'menunggu' ? 'bg-gray-50 border-gray-200' : ''}
                                `}>
                                    <p className="font-semibold text-gray-800">
                                        Tugas untuk: {item.approver_name} ({item.tipe})
                                    </p>
                                    <p className="text-lg capitalize font-bold mt-1">Status: {item.status.replace(/_/g, ' ')}</p>
                                    {item.catatan && <p className="text-sm text-gray-600 mt-2">Catatan: "{item.catatan}"</p>}
                                    {item.tanggal && <p className="text-xs text-gray-400 mt-2">Ditindaklanjuti pada: {new Date(item.tanggal).toLocaleString('id-ID')}</p>}
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
}