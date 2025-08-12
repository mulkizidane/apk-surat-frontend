import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSuratDetail, getApprovers, submitDistribusi } from '../api/api';

export default function DistribusiDetailPage() {
  const { suratId } = useParams();
  const navigate = useNavigate();

  const [surat, setSurat] = useState(null);
  const [approverOptions, setApproverOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    approvers: [],
    catatan: '',
  });

  // PERBAIKAN #1: Tentukan urutan yang benar
  const approverOrder = ['atasan_terkait', 'pimpinan_unit'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [suratRes, approversRes] = await Promise.all([
          getSuratDetail(suratId),
          getApprovers(),
        ]);
        setSurat(suratRes.data);
        setApproverOptions(approversRes.data || {});
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Gagal memuat data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [suratId]);

  const handleApproverChange = (e) => {
    const { value, checked } = e.target;
    const [tipe, userId] = value.split('|');
    let newApprovers = [...formData.approvers];

    if (checked) {
      newApprovers.push({ user_id: userId, tipe });
    } else {
      newApprovers = newApprovers.filter(app => app.user_id !== userId);
    }
    
    // PERBAIKAN #2: Urutkan array approvers setiap kali ada perubahan
    newApprovers.sort((a, b) => {
        const aKey = Object.keys(approverOptions).find(key => approverOptions[key].id.toString() === a.user_id);
        const bKey = Object.keys(approverOptions).find(key => approverOptions[key].id.toString() === b.user_id);
        return approverOrder.indexOf(aKey) - approverOrder.indexOf(bKey);
    });

    setFormData(prev => ({ ...prev, approvers: newApprovers }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.approvers.length === 0) {
      setError('Pilih minimal satu approver untuk distribusi.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await submitDistribusi(suratId, formData);
      alert('Surat berhasil didistribusikan!');
      navigate('/dashboard/verifikasi-keluar');
    } catch (err) {
      setError(err.response?.data?.messages?.error || 'Gagal mendistribusikan surat.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !surat) return <div className="text-center p-8">Loading...</div>;
  if (error && !surat) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!surat) return <div className="text-center p-8">Data surat tidak ditemukan.</div>;

  return (
    <div>
      <Link to="/dashboard/verifikasi-keluar" className="text-indigo-600 hover:underline mb-6 inline-block">
        &larr; Kembali ke Daftar Verifikasi
      </Link>
      <h1 className="text-3xl font-bold mb-4">Proses & Distribusi Surat Keluar</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-sm font-medium text-gray-500">Perihal</h3>
        <p className="mt-1 text-lg text-gray-900">{surat.perihal}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">Formulir Distribusi Persetujuan</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Pilih Approver (urutkan sesuai alur)</label>
          <div className="mt-2 space-y-2 border p-4 rounded-md">
            {/* PERBAIKAN #3: Tampilkan checkbox sesuai urutan yang sudah ditentukan */}
            {approverOrder.map(key => {
              const approver = approverOptions[key];
              if (!approver) return null; // Jika approver tidak ada, lewati
              
              const approverType = key.includes('pimpinan') ? 'TANDA_TANGAN' : 'PARAF';
              return (
                <div key={approver.id} className="flex items-center">
                  <input id={`approver-${approver.id}`} type="checkbox" value={`${approverType}|${approver.id}`} onChange={handleApproverChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                  <label htmlFor={`approver-${approver.id}`} className="ml-3 block text-sm text-gray-800">
                    {approver.name} <span className="text-xs text-gray-500">({key.replace(/_/g, ' ')}) - {approverType}</span>
                  </label>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea id="catatan" name="catatan" rows="3" value={formData.catatan} onChange={(e) => setFormData(prev => ({...prev, catatan: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
            {isLoading ? 'Menyimpan...' : 'Distribusikan & Mulai Proses Persetujuan'}
          </button>
        </div>
      </form>
    </div>
  );
}
