import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient, { getSuratKeluarDetail } from '../api/api';

export default function AdminSuratKeluarVerifyPage() {
  const { id: suratId } = useParams();
  const navigate = useNavigate();

  const [surat, setSurat] = useState(null);
  const [nomorSurat, setNomorSurat] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSuratDetail = async () => {
      try {
        const response = await getSuratKeluarDetail(suratId);
        setSurat(response.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat detail surat.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSuratDetail();
  }, [suratId]);

  const handleGenerateNomor = () => {
    const noUrut = Date.now().toString().slice(-4);
    const kodeUnit = surat?.nama_unit_pembuat?.substring(0, 3).toUpperCase() || 'XXX';
    const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const bulan = bulanRomawi[new Date().getMonth()];
    const tahun = new Date().getFullYear();
    setNomorSurat(`${noUrut}/${kodeUnit}/${bulan}/${tahun}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!nomorSurat) {
      setError('Nomor surat wajib diisi.');
      setIsLoading(false);
      return;
    }

    try {
      // Panggil endpoint baru yang sudah kita siapkan di backend
      await apiClient.post(`/admin/surat-keluar/${suratId}/verify`, {
        nomor_surat: nomorSurat,
      });
      alert('Surat berhasil diberi nomor dan diteruskan ke Atasan!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.messages?.error || 'Gagal memproses surat.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center p-8">Memuat data...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!surat) return <div className="text-center p-8">Data surat tidak ditemukan.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Verifikasi & Penomoran Surat</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Detail Surat */}
        <div className="mb-6 border-b pb-6">
          <h2 className="text-xl font-semibold">{surat.isi}</h2>
          <p className="text-sm text-gray-500">Tanggal Dibuat: {surat.tanggal}</p>
          <p className="text-sm text-gray-500">Dibuat oleh: {surat.nama_pembuat} ({surat.nama_unit_pembuat})</p>
        </div>

        {/* Form Penomoran */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Input Nomor Surat</h3>
          <div>
            <label htmlFor="nomor_surat" className="block text-sm font-medium text-gray-700">Nomor Surat</label>
            <div className="flex items-center mt-1">
              <input
                id="nomor_surat"
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                required
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm"
              />
              <button type="button" onClick={handleGenerateNomor} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                Otomatis
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex justify-end pt-4 border-t">
            <Link to="/dashboard" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 mr-4">
                Kembali
            </Link>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
              {isLoading ? 'Memproses...' : 'Simpan & Teruskan ke Atasan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}