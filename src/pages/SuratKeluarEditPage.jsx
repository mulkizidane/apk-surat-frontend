import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient, { getSuratKeluarDetail } from '../api/api';

export default function SuratKeluarEditPage() {
  const { id: suratId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ isi: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSuratData = async () => {
      try {
        const response = await getSuratKeluarDetail(suratId);
        // Kita hanya ambil 'isi' karena hanya itu yang bisa diedit
        setFormData({ isi: response.data.isi });
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat data surat untuk diedit.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSuratData();
  }, [suratId]);

  const handleChange = (e) => {
    setFormData({ isi: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Panggil endpoint update yang sudah kita siapkan
      await apiClient.put(`/surat-keluar/${suratId}`, formData);
      alert('Surat berhasil direvisi dan diajukan kembali ke Admin TU!');
      navigate('/dashboard/surat-keluar');
    } catch (err) {
      setError(err.response?.data?.messages?.error || 'Gagal menyimpan revisi.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) return <div className="text-center p-8">Memuat data surat...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Revisi Surat Keluar</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
            <label htmlFor="isi" className="block text-sm font-medium text-gray-700">Isi Ringkas Surat</label>
            <textarea id="isi" name="isi" rows="6" value={formData.isi} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
            <Link to={`/dashboard/surat-keluar/${suratId}`} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Batal
            </Link>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {isLoading ? 'Menyimpan...' : 'Simpan dan Ajukan Ulang'}
            </button>
        </div>
      </form>
    </div>
  );
}