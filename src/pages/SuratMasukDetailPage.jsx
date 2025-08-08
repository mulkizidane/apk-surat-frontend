import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/api'; // Kita perlu apiClient untuk disposisi
import { useAuth } from '../context/AuthContext';

// Fungsi API khusus untuk halaman ini (bisa dipindah ke api.js nanti jika perlu)
const getSuratMasukDetail = (id) => apiClient.get(`/surat-masuk/${id}`);
const getUsersForDisposisi = () => apiClient.get('/users'); // Asumsi endpoint ini ada

// Komponen Form Disposisi
const DisposisiForm = ({ suratId, onDisposisiSuccess }) => {
    const [penerimaId, setPenerimaId] = useState('');
    const [jenisDisposisi, setJenisDisposisi] = useState('tindaklanjut');
    const [keterangan, setKeterangan] = useState('');
    const [userList, setUserList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Ambil daftar user yang bisa jadi penerima disposisi
        getUsersForDisposisi()
            .then(response => setUserList(response.data))
            .catch(() => setError('Gagal memuat daftar user.'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                penerima_disposisi_id: penerimaId,
                jenis_disposisi: jenisDisposisi,
                keterangan_disposisi: keterangan,
            };
            await apiClient.post(`/surat-masuk/${suratId}/disposisi`, payload);
            alert('Surat berhasil didisposisi!');
            onDisposisiSuccess();
        } catch (err) {
            setError(err.response?.data?.messages?.error || 'Gagal mengirim disposisi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-6 mt-6 border-t">
            <h3 className="text-xl font-semibold text-gray-900">Formulir Disposisi</h3>
            <div>
                <label htmlFor="penerima" className="block text-sm font-medium text-gray-700">Teruskan Kepada</label>
                <select id="penerima" value={penerimaId} onChange={(e) => setPenerimaId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">-- Pilih Penerima --</option>
                    {userList.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Disposisi</label>
                <div className="flex space-x-4 mt-1">
                    <label className="flex items-center"><input type="radio" name="jenis_disposisi" value="tindaklanjut" checked={jenisDisposisi === 'tindaklanjut'} onChange={(e) => setJenisDisposisi(e.target.value)} /> Tindaklanjuti</label>
                    <label className="flex items-center"><input type="radio" name="jenis_disposisi" value="arsip" checked={jenisDisposisi === 'arsip'} onChange={(e) => setJenisDisposisi(e.target.value)} /> Arsip</label>
                </div>
            </div>
            <div>
                <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700">Keterangan / Instruksi</label>
                <textarea id="keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                    {isSubmitting ? 'Mengirim...' : 'Submit Disposisi'}
                </button>
            </div>
        </form>
    );
};

export default function SuratMasukDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();

    const [surat, setSurat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSuratDetail = async () => {
        setIsLoading(true);
        try {
            const response = await getSuratMasukDetail(id);
            setSurat(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Gagal memuat detail surat.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuratDetail();
    }, [id]);

    if (isLoading) return <div className="text-center p-8">Memuat detail surat...</div>;
    if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
    if (!surat) return <div className="text-center p-8">Surat tidak ditemukan.</div>;

    const isPimpinan = user?.role === 'pimpinan_unit';
    const canDisposisi = isPimpinan && surat.status === 'baru';

    return (
        <div>
            <Link to="/dashboard/surat-masuk" className="text-indigo-600 hover:underline mb-6 inline-block">
                &larr; Kembali ke Daftar Surat
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Detail Surat Masuk</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Nomor Surat Asli</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.nomor_surat_asli}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Tanggal Surat</h3>
                        <p className="mt-1 text-lg text-gray-900">{surat.tanggal_surat}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="mt-1 text-lg text-gray-900 capitalize">{surat.status}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">Perihal</h3>
                    <p className="mt-1 text-lg text-gray-900">{surat.perihal}</p>
                </div>

                {/* Tampilkan riwayat disposisi jika ada */}
                {surat.disposisi && surat.disposisi.length > 0 && (
                    <div className="mt-6 border-t pt-6">
                         <h3 className="text-xl font-semibold text-gray-900 mb-4">Riwayat Disposisi</h3>
                         <div className="space-y-4">
                            {surat.disposisi.map(item => (
                                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="font-semibold text-gray-800">{item.keterangan_disposisi}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Didisposisikan kepada <span className="font-medium text-gray-700">{/* Nanti diisi nama penerima */}</span> 
                                        pada <span className="font-medium text-gray-700">{new Date(item.tanggal_disposisi).toLocaleString('id-ID')}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">Jenis: {item.jenis_disposisi}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
                
                {canDisposisi && (
                    <DisposisiForm suratId={surat.id} onDisposisiSuccess={fetchSuratDetail} />
                )}
            </div>
        </div>
    );
}