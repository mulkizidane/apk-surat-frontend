import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSuratDetail } from '../api/api';

export default function SuratKeluarDetailPage() {
    const { id } = useParams();
    const [surat, setSurat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDetail = async () => {
            try {
                const response = await getSuratDetail(id);
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

    return (
        <div>
            <Link to="/dashboard/surat-keluar" className="text-indigo-600 hover:underline mb-6 inline-block">
                &larr; Kembali ke Daftar Surat
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Detail Surat Keluar</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Nomor</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.nomor_surat}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Perihal</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.perihal}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">isi Surat</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.isi_ringkas}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Tanggal Surat</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.tanggal_surat}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Tujuan</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.tujuan}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Tembusan</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.tembusan}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="mt-1 text-lg text-gray-900 capitalize">{surat.status.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}