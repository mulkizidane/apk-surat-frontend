import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadSuratEksternal } from '../api/api';

export default function SuratEksternalForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    perihal: '',
    tanggal_surat: new Date().toISOString().split('T')[0],
    nama_pengirim_eksternal: '',
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('File surat wajib diunggah.');
      return;
    }

    setIsLoading(true);
    setError('');

    const data = new FormData();
    data.append('perihal', formData.perihal);
    data.append('tanggal_surat', formData.tanggal_surat);
    data.append('nama_pengirim_eksternal', formData.nama_pengirim_eksternal);
    data.append('file_surat', file);

    try {
      await uploadSuratEksternal(data);
      alert('Surat eksternal berhasil diunggah dan siap untuk didisposisi.');
      navigate('/dashboard/verifikasi-masuk');
    } catch (err) {
      setError(err.response?.data?.messages?.error || 'Gagal mengunggah surat eksternal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Surat Masuk Eksternal</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        
        <div>
          <label htmlFor="nama_pengirim_eksternal" className="block text-sm font-medium text-gray-700">Nama Pengirim Eksternal</label>
          <input
            id="nama_pengirim_eksternal"
            name="nama_pengirim_eksternal"
            type="text"
            value={formData.nama_pengirim_eksternal}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="perihal" className="block text-sm font-medium text-gray-700">Perihal Surat</label>
          <input
            id="perihal"
            name="perihal"
            type="text"
            value={formData.perihal}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="tanggal_surat" className="block text-sm font-medium text-gray-700">Tanggal Surat</label>
          <input
            id="tanggal_surat"
            name="tanggal_surat"
            type="date"
            value={formData.tanggal_surat}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="file_surat" className="block text-sm font-medium text-gray-700">File Surat (PDF, DOCX)</label>
          <input
            id="file_surat"
            name="file_surat"
            type="file"
            onChange={handleFileChange}
            required
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            accept=".pdf,.doc,.docx"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/dashboard/verifikasi-masuk')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isLoading ? 'Mengunggah...' : 'Upload & Simpan Surat'}
          </button>
        </div>
      </form>
    </div>
  );
}