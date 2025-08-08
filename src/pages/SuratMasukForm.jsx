import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/api'; // Menggunakan apiClient untuk request

export default function SuratMasukForm() {
  const navigate = useNavigate();

  // State untuk menampung data dari form
  const [formData, setFormData] = useState({
    nomor_surat_asli: '',
    tanggal_surat: new Date().toISOString().split('T')[0],
    pengirim: '',
    perihal: '',
  });
  // State khusus untuk file yang akan di-upload
  const [fileSurat, setFileSurat] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handler untuk perubahan pada input teks
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler khusus untuk input file
  const handleFileChange = (e) => {
    // Ambil file pertama yang dipilih user
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFileSurat(file);
      setError(''); // Hapus pesan error jika ada
    } else {
      setFileSurat(null);
      setError('File harus berformat PDF.');
    }
  };

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!fileSurat || !formData.nomor_surat_asli || !formData.pengirim || !formData.perihal) {
      setError('Semua field wajib diisi dan file surat harus dipilih.');
      setIsLoading(false);
      return;
    }

    // Gunakan FormData karena kita akan mengirim file
    const dataToSubmit = new FormData();
    dataToSubmit.append('nomor_surat_asli', formData.nomor_surat_asli);
    dataToSubmit.append('tanggal_surat', formData.tanggal_surat);
    dataToSubmit.append('pengirim', formData.pengirim);
    dataToSubmit.append('perihal', formData.perihal);
    dataToSubmit.append('file_surat', fileSurat);

    try {
      // Kirim data menggunakan apiClient dengan header 'multipart/form-data'
      await apiClient.post('/surat-masuk', dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert('Surat masuk berhasil diunggah!');
      navigate('/dashboard/surat-masuk');
    } catch (err) {
      setError(err.response?.data?.messages?.error || "Gagal mengunggah surat.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Surat Masuk Eksternal</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="nomor_surat_asli" className="block text-sm font-medium text-gray-700">Nomor Surat Asli</label>
                <input type="text" id="nomor_surat_asli" name="nomor_surat_asli" value={formData.nomor_surat_asli} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
                <label htmlFor="tanggal_surat" className="block text-sm font-medium text-gray-700">Tanggal Surat</label>
                <input type="date" id="tanggal_surat" name="tanggal_surat" value={formData.tanggal_surat} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
        </div>

        <div>
            <label htmlFor="pengirim" className="block text-sm font-medium text-gray-700">Pengirim</label>
            <input type="text" id="pengirim" name="pengirim" value={formData.pengirim} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>

        <div>
            <label htmlFor="perihal" className="block text-sm font-medium text-gray-700">Perihal</label>
            <textarea id="perihal" name="perihal" rows="4" value={formData.perihal} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>

        <div>
            <label htmlFor="file_surat" className="block text-sm font-medium text-gray-700">File Surat (PDF)</label>
            <input type="file" id="file_surat" name="file_surat" onChange={handleFileChange} required accept="application/pdf" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={() => navigate('/dashboard/surat-masuk')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                {isLoading ? 'Mengunggah...' : 'Simpan Surat'}
            </button>
        </div>
      </form>
    </div>
  );
}