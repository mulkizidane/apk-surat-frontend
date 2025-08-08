import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSuratKeluar, getKategoriSurat, getJenisSurat, getUnitTree } from '../api/api';

export default function SuratKeluarForm() {
  const navigate = useNavigate();

  // State untuk data form utama
  const [formData, setFormData] = useState({
    kategori_surat_id: '',
    jenis_surat_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    isi: '',
    // Hapus 'approvers' dari state
  });

  // State untuk menampung data master dari API (tidak berubah)
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [jenisOptions, setJenisOptions] = useState([]);
  const [unitTree, setUnitTree] = useState([]);

  // State untuk mengelola pilihan dropdown tujuan (tidak berubah)
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedSubUnitId, setSelectedSubUnitId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [subUnitOptions, setSubUnitOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // useEffects untuk memuat data master (tidak ada perubahan di sini)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [kategoriRes, unitTreeRes] = await Promise.all([
          getKategoriSurat(),
          getUnitTree() 
        ]);
        setKategoriOptions(kategoriRes.data || []);
        setUnitTree(unitTreeRes.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal memuat data awal. Pastikan Anda terhubung ke server.");
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.kategori_surat_id) {
      const loadJenisSurat = async () => {
        try {
          const response = await getJenisSurat(formData.kategori_surat_id);
          setJenisOptions(response.data || []);
          setFormData(prev => ({ ...prev, jenis_surat_id: '' }));
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          setError("Gagal memuat jenis surat.");
        }
      };
      loadJenisSurat();
    } else {
      setJenisOptions([]);
    }
  }, [formData.kategori_surat_id]);

  useEffect(() => {
    setSelectedSubUnitId('');
    setSelectedUserId('');
    setSubUnitOptions([]);
    setUserOptions([]);

    if (selectedUnitId) {
      const selectedUnit = unitTree.find(unit => unit.id === selectedUnitId);
      if (selectedUnit) {
        if (selectedUnit.sub_units && selectedUnit.sub_units.length > 0) {
          setSubUnitOptions(selectedUnit.sub_units);
        } else {
          setUserOptions(selectedUnit.users || []);
        }
      }
    }
  }, [selectedUnitId, unitTree]);

  useEffect(() => {
    setSelectedUserId('');
    if (selectedSubUnitId) {
      const selectedSubUnit = subUnitOptions.find(sub => sub.id === selectedSubUnitId);
      setUserOptions(selectedSubUnit ? (selectedSubUnit.users || []) : []);
    }
  }, [selectedSubUnitId, subUnitOptions]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler untuk approver sudah tidak diperlukan lagi, jadi dihapus.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validasi disederhanakan
    if (!formData.isi || !formData.kategori_surat_id || !formData.jenis_surat_id || !selectedUnitId) {
      setError("Semua field wajib diisi, termasuk tujuan.");
      setIsLoading(false);
      return;
    }

    try {
      // Hapus 'approvers' dari payload
      const payload = {
        ...formData,
        tujuan: [{
          tipe_tujuan: 'utama',
          unit_id: selectedSubUnitId || selectedUnitId, 
          user_id: selectedUserId || null,
        }]
      };
      
      await createSuratKeluar(payload);
      alert('Draf surat berhasil dibuat & dikirim ke Admin TU!');
      navigate('/dashboard/surat-keluar');
    } catch (err) {
      setError(err.message || "Gagal membuat draf surat.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Buat Draf Surat Keluar</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {/* Bagian Kategori, Jenis Surat, Isi, dan Tujuan tidak berubah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="kategori_surat_id" className="block text-sm font-medium text-gray-700">Kategori Surat</label>
                <select id="kategori_surat_id" name="kategori_surat_id" value={formData.kategori_surat_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriOptions.map(kat => (
                        <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="jenis_surat_id" className="block text-sm font-medium text-gray-700">Jenis Surat</label>
                <select id="jenis_surat_id" name="jenis_surat_id" value={formData.jenis_surat_id} onChange={handleChange} required disabled={!formData.kategori_surat_id} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100">
                    <option value="">-- Pilih Jenis --</option>
                    {jenisOptions.map(jenis => (
                        <option key={jenis.id} value={jenis.id}>{jenis.nama_jenis}</option>
                    ))}
                </select>
            </div>
        </div>
        <div>
            <label htmlFor="isi" className="block text-sm font-medium text-gray-700">Isi Ringkas Surat</label>
            <textarea id="isi" name="isi" rows="4" value={formData.isi} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Tujuan Surat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label htmlFor="tujuan_unit_id" className="block text-sm font-medium text-gray-700">Unit</label>
              <select id="tujuan_unit_id" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="">-- Pilih Unit --</option>
                {unitTree.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            {subUnitOptions.length > 0 && (
              <div>
                <label htmlFor="tujuan_subunit_id" className="block text-sm font-medium text-gray-700">Sub Unit</label>
                <select id="tujuan_subunit_id" value={selectedSubUnitId} onChange={(e) => setSelectedSubUnitId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                  <option value="">-- Pilih Sub Unit --</option>
                  {subUnitOptions.map(subunit => (
                    <option key={subunit.id} value={subunit.id}>{subunit.name}</option>
                  ))}
                </select>
              </div>
            )}
            {userOptions.length > 0 && (
              <div>
                <label htmlFor="tujuan_user_id" className="block text-sm font-medium text-gray-700">User (Opsional)</label>
                <select id="tujuan_user_id" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                  <option value="">-- Kirim ke Seluruh Unit/Sub-Unit --</option>
                  {userOptions.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* HAPUS BAGIAN ALUR PERSETUJUAN DARI SINI */}

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={() => navigate('/dashboard/surat-keluar')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                {isLoading ? 'Mengajukan...' : 'Ajukan Draf Surat'}
            </button>
        </div>
      </form>
    </div>
  );
}