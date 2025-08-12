import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSuratDetail, getInternalUsers, submitDisposisi } from '../api/api';

export default function SuratMasukDetailPage() {
  const { suratId } = useParams();
  const navigate = useNavigate();

  const [surat, setSurat] = useState(null);
  const [internalUsers, setInternalUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk form disposisi
  const [formData, setFormData] = useState({
    nomor_agenda_masuk: '',
    penerima_disposisi: [], // Akan berisi array of user IDs
    catatan: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Ambil detail surat dan daftar user secara bersamaan
        const [suratRes, usersRes] = await Promise.all([
          getSuratDetail(suratId),
          getInternalUsers()
        ]);
        setSurat(suratRes.data);
        setInternalUsers(usersRes.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat data detail surat atau daftar user.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [suratId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePenerimaChange = (e) => {
    const { value, checked } = e.target;
    let newPenerima = [...formData.penerima_disposisi];
    if (checked) {
      newPenerima.push(value);
    } else {
      newPenerima = newPenerima.filter(id => id !== value);
    }
    setFormData(prev => ({ ...prev, penerima_disposisi: newPenerima }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.penerima_disposisi.length === 0) {
      setError('Pilih minimal satu penerima disposisi.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await submitDisposisi(suratId, formData);
      alert('Surat berhasil didisposisikan!');
      navigate('/dashboard/verifikasi-masuk'); // Kembali ke daftar verifikasi
    } catch (err) {
      setError(err.response?.data?.messages?.error || 'Gagal menyimpan disposisi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !surat) return <div className="text-center p-8">Loading...</div>;
  if (error && !surat) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!surat) return <div className="text-center p-8">Data surat tidak ditemukan.</div>;

  return (
    <div>
      <Link to="/dashboard/verifikasi-masuk" className="text-indigo-600 hover:underline mb-6 inline-block">
        &larr; Kembali ke Daftar Verifikasi
      </Link>
      <h1 className="text-3xl font-bold mb-4">Detail & Disposisi Surat Masuk</h1>
      
      {/* Bagian Detail Surat */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Perihal</h3>
            <p className="mt-1 text-lg text-gray-900">{surat.perihal}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Tanggal Surat</h3>
            <p className="mt-1 text-lg text-gray-900">{surat.tanggal_surat}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-lg text-gray-900 capitalize">{surat.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Bagian Form Disposisi (Hanya muncul jika surat masih perlu diproses) */}
      {surat.status === 'TERKIRIM' && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">Formulir Disposisi</h2>
          <div>
            <label htmlFor="nomor_agenda_masuk" className="block text-sm font-medium text-gray-700">Nomor Agenda Masuk (Opsional)</label>
            <input id="nomor_agenda_masuk" name="nomor_agenda_masuk" type="text" value={formData.nomor_agenda_masuk} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Penerima Disposisi (Pilih satu atau lebih)</label>
            <div className="mt-2 space-y-2 border p-4 rounded-md max-h-48 overflow-y-auto">
              {internalUsers.map(user => (
                <div key={user.id} className="flex items-center">
                  <input 
                    id={`user-${user.id}`} 
                    type="checkbox" 
                    value={user.id}
                    onChange={handlePenerimaChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded" 
                  />
                  <label htmlFor={`user-${user.id}`} className="ml-3 block text-sm text-gray-800">
                    {user.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Catatan Disposisi</label>
            <textarea id="catatan" name="catatan" rows="3" value={formData.catatan} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
              {isLoading ? 'Menyimpan...' : 'Submit Disposisi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
