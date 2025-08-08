import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient, { getVerifikasiDetail } from '../api/api';

export default function VerifikasiDetailPage() {
  const { id: parafId } = useParams();
  const navigate = useNavigate();

  const [surat, setSurat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk form verifikasi disederhanakan
  const [status, setStatus] = useState('setuju');
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    const loadSuratDetail = async () => {
      try {
        const response = await getVerifikasiDetail(parafId); 
        setSurat(response.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat detail surat untuk verifikasi.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSuratDetail();
  }, [parafId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((status === 'revisi' || status === 'tolak') && !catatan) {
        setError('Catatan wajib diisi jika status revisi atau tolak.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Payload sekarang tidak lagi mengirim nomor_surat
      const payload = {
        status,
        catatan,
      };
      
      await apiClient.put(`/verifikasi/${parafId}`, payload);

      alert('Tindakan berhasil disimpan!');
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.messages?.error || 'Gagal menyimpan tindakan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center p-8">Memuat data...</div>;
  if (error && !surat) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!surat) return <div className="text-center p-8">Data surat tidak ditemukan.</div>;

  return (
    <div>
      <Link to="/dashboard" className="text-indigo-600 hover:underline mb-6 inline-block">
          &larr; Kembali ke Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-4">Persetujuan Surat</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Detail Surat */}
        <div className="mb-4 border-b pb-4">
          <h2 className="text-xl font-semibold">{surat.nomor_surat}</h2>
          <p className="text-base text-gray-700 mt-2">{surat.isi}</p>
          <p className="text-sm text-gray-500 mt-3">Tanggal Dibuat: {surat.tanggal}</p>
          <p className="text-sm text-gray-500">Dibuat oleh: {surat.nama_pembuat}</p>
        </div>

        {/* Form Verifikasi Sederhana */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tindakan Anda</label>
            <div className="flex space-x-4 mt-1">
              <label className="flex items-center"><input type="radio" name="status" value="setuju" checked={status === 'setuju'} onChange={(e) => setStatus(e.target.value)} className="mr-1" /> Setuju</label>
              <label className="flex items-center"><input type="radio" name="status" value="revisi" checked={status === 'revisi'} onChange={(e) => setStatus(e.target.value)} className="mr-1" /> Revisi</label>
              <label className="flex items-center"><input type="radio" name="status" value="tolak" checked={status === 'tolak'} onChange={(e) => setStatus(e.target.value)} className="mr-1" /> Tolak</label>
            </div>
          </div>

          <div>
            <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Catatan (wajib jika revisi/tolak)</label>
            <textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
              {isLoading ? 'Menyimpan...' : 'Submit Tindakan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}