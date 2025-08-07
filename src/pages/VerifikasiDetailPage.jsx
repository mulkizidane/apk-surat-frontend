import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { getSuratKeluarDetail } from '../api/api';

export default function VerifikasiDetailPage() {
  const { id: parafId } = useParams(); // ID dari URL adalah ID dari tabel paraf_surat
  const navigate = useNavigate();

  const [surat, setSurat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk form verifikasi
  const [status, setStatus] = useState('setuju');
  const [catatan, setCatatan] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');

  useEffect(() => {
    const loadSuratDetail = async () => {
      try {
        // NOTE: Backend saat ini belum punya endpoint untuk mengambil detail surat
        // berdasarkan paraf_id. Untuk pengembangan, kita asumsikan ID di URL
        // adalah surat_id untuk sementara waktu agar bisa mengambil datanya.
        // Nanti kita bisa perbaiki ini di backend jika perlu.
        const response = await getSuratKeluarDetail(parafId); 
        setSurat(response.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat detail surat. Pastikan ID valid.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSuratDetail();
  }, [parafId]);

  const handleGenerateNomor = () => {
    // Logika sederhana untuk generate nomor otomatis
    const noUrut = Date.now().toString().slice(-4);
    const kodeUnit = surat?.nama_unit_pembuat?.substring(0, 3).toUpperCase() || 'XXX';
    const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const bulan = bulanRomawi[new Date().getMonth()];
    const tahun = new Date().getFullYear();
    setNomorSurat(`${noUrut}/${kodeUnit}/${bulan}/${tahun}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((status === 'revisi' || status === 'tolak') && !catatan) {
        setError('Catatan wajib diisi jika status revisi atau tolak.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        status,
        catatan,
        nomor_surat: status === 'setuju' ? nomorSurat : null,
      };
      
      // Kirim request ke endpoint verifikasi dengan ID dari paraf_surat
      await apiClient.put(`/verifikasi/${parafId}`, payload);

      alert('Verifikasi berhasil disimpan!');
      navigate('/dashboard'); // Kembali ke dashboard setelah berhasil
    } catch (err) {
      setError(err.response?.data?.messages?.error || 'Gagal menyimpan verifikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (error && !surat) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!surat) return <div className="text-center p-8">Data surat tidak ditemukan.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Verifikasi Surat</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Detail Surat */}
        <div className="mb-4 border-b pb-4">
          <h2 className="text-xl font-semibold">{surat.isi}</h2>
          <p className="text-sm text-gray-500">Tanggal Dibuat: {surat.tanggal}</p>
          <p className="text-sm text-gray-500">Dibuat oleh: {surat.nama_pembuat} ({surat.nama_unit_pembuat})</p>
        </div>

        {/* Form Verifikasi */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor Surat (jika disetujui)</label>
            <div className="flex items-center mt-1">
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Isi manual atau generate otomatis"
              />
              <button type="button" onClick={handleGenerateNomor} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                Otomatis
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tindakan</label>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
              {isLoading ? 'Menyimpan...' : 'Submit Verifikasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
