import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// PERBAIKAN 1: Import 'apiClient' bukan 'apiFetch'
import apiClient, { getSuratKeluarDetail } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Komponen Form Verifikasi
const VerificationForm = ({ surat, pendingApproval, onVerificationSubmit }) => {
    const [status, setStatus] = useState('setuju');
    const [catatan, setCatatan] = useState('');
    const [nomorSurat, setNomorSurat] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGenerateNomor = () => {
        const noUrut = Date.now().toString().slice(-4);
        const kodeUnit = surat?.nama_unit_pembuat?.substring(0, 3).toUpperCase() || 'XXX';
        const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        const bulan = bulanRomawi[new Date().getMonth()];
        const tahun = new Date().getFullYear();
        setNomorSurat(`${noUrut}/${kodeUnit}/${bulan}/${tahun}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            status,
            catatan,
            nomor_surat: status === 'setuju' ? nomorSurat : null,
        };
        onVerificationSubmit(payload).finally(() => setIsSubmitting(false));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-6 mt-6 border-t">
            <h3 className="text-xl font-semibold text-gray-900">Tindakan Verifikasi</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Surat (jika disetujui)</label>
                <div className="flex items-center mt-1">
                    <input type="text" value={nomorSurat} onChange={(e) => setNomorSurat(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm" />
                    <button type="button" onClick={handleGenerateNomor} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">Otomatis</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tindakan</label>
                <div className="flex space-x-4 mt-1">
                    <label className="flex items-center"><input type="radio" name="status" value="setuju" checked={status === 'setuju'} onChange={(e) => setStatus(e.target.value)} /> Setuju</label>
                    <label className="flex items-center"><input type="radio" name="status" value="revisi" checked={status === 'revisi'} onChange={(e) => setStatus(e.target.value)} /> Revisi</label>
                    <label className="flex items-center"><input type="radio" name="status" value="tolak" checked={status === 'tolak'} onChange={(e) => setStatus(e.target.value)} /> Tolak</label>
                </div>
            </div>
            <div>
                <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Catatan</label>
                <textarea id="catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                    {isSubmitting ? 'Menyimpan...' : 'Submit Verifikasi'}
                </button>
            </div>
        </form>
    );
};


export default function SuratKeluarDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [surat, setSurat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingApproval, setPendingApproval] = useState(null);

    useEffect(() => {
        const loadDetail = async () => {
            try {
                const response = await getSuratKeluarDetail(id);
                setSurat(response.data);

                if (response.data.approvers && user) {
                    const myPendingTask = response.data.approvers.find(
                        // Pastikan perbandingan tipe data benar (misal: user.id bisa jadi number)
                        app => app.user_id.toString() === user.id.toString() && app.status === 'pending'
                    );
                    setPendingApproval(myPendingTask);
                }
            } catch (err) {
                // PERBAIKAN: Gunakan variabel 'err' untuk pesan yang lebih informatif
                setError(err.message || 'Gagal memuat detail surat.');
            } finally {
                setIsLoading(false);
            }
        };
        if(user) { // Pastikan user sudah ada sebelum fetch data
            loadDetail();
        }
    }, [id, user]);

    const handleVerificationSubmit = async (payload) => {
        if (!pendingApproval) return;
        try {
            // PERBAIKAN: Gunakan 'apiClient' yang sudah kita import
            await apiClient.put(`/verifikasi/${pendingApproval.id}`, payload);
            alert('Verifikasi berhasil disimpan!');
            navigate('/dashboard');
        } catch (err) {
            // PERBAIKAN: Gunakan variabel 'err'
            setError(err.response?.data?.messages?.error || 'Gagal menyimpan verifikasi.');
        }
    };

    if (isLoading) return <div className="text-center p-8">Memuat detail surat...</div>;
    if (error && !surat) return <div className="text-center p-8 text-red-600">{error}</div>;
    if (!surat) return <div className="text-center p-8">Surat tidak ditemukan.</div>;

    return (
        <div>
            <Link to="/dashboard/surat-keluar" className="text-indigo-600 hover:underline mb-6 inline-block">
                &larr; Kembali ke Daftar Surat
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Detail Surat Keluar</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Bagian Detail Surat (tidak berubah) */}
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
                    <p className="mt-1 text-lg text-gray-900 capitalize">{surat.status.replace('_', ' ')}</p>
                  </div>
                </div>
                {/* ... bagian detail lainnya ... */}
                
                {error && <p className="text-sm text-red-600 my-4">{error}</p>}

                {/* Tampilkan form verifikasi secara kondisional */}
                {pendingApproval && (
                    <VerificationForm 
                        surat={surat} 
                        pendingApproval={pendingApproval}
                        onVerificationSubmit={handleVerificationSubmit}
                    />
                )}
            </div>
        </div>
    );
}
