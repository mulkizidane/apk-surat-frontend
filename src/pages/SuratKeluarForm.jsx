import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApprovers, createSuratKeluar, getKategoriSurat, getJenisSurat, getUnitTree } from '../api/api';

export default function SuratKeluarForm() {
  const navigate = useNavigate();

  // State untuk data form utama
  const [formData, setFormData] = useState({
    kategori_surat_id: '',
    jenis_surat_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    isi: '',
    approvers: [],
  });

  // State untuk menampung data master dari API
  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [jenisOptions, setJenisOptions] = useState([]);
  const [approverOptions, setApproverOptions] = useState({});
  const [unitTree, setUnitTree] = useState([]);

  // State untuk mengelola pilihan dropdown tujuan
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedSubUnitId, setSelectedSubUnitId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // State untuk mengisi pilihan di dropdown turunan
  const [subUnitOptions, setSubUnitOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. useEffect untuk mengambil semua data master saat komponen dimuat
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [kategoriRes, approverRes, unitTreeRes] = await Promise.all([
          getKategoriSurat(),
          getApprovers(),
          getUnitTree() 
        ]);
        
        // PERBAIKAN: Ambil properti .data dari setiap response
        setKategoriOptions(kategoriRes.data || []);
        setApproverOptions(approverRes.data || {});
        setUnitTree(unitTreeRes.data || []);

      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal memuat data awal. Pastikan Anda terhubung ke server.");
      }
    };
    loadInitialData();
  }, []);

  // 2. useEffect untuk mengambil Jenis Surat setiap kali Kategori Surat berubah
  useEffect(() => {
    if (formData.kategori_surat_id) {
      const loadJenisSurat = async () => {
        try {
          const response = await getJenisSurat(formData.kategori_surat_id);
          setJenisOptions(response.data || []); // Ambil .data
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

  // 3. useEffect untuk mengatur dropdown Sub-Unit & User saat Unit Utama berubah
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

  // 4. useEffect untuk mengatur dropdown User saat Sub-Unit berubah
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

  const handleApproverChange = (e) => {
      const { value, checked } = e.target;
      const [tipe, userId, nama] = value.split('|');
      let newApprovers = [...formData.approvers];
      if(checked) {
          newApprovers.push({ user_id: userId, tipe, nama });
      } else {
          newApprovers = newApprovers.filter(app => app.user_id !== userId);
      }
      setFormData(prev => ({...prev, approvers: newApprovers}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.isi || !formData.kategori_surat_id || !formData.jenis_surat_id || formData.approvers.length === 0 || !selectedUnitId) {
      setError("Semua field wajib diisi, termasuk tujuan dan alur persetujuan.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        tujuan: [{
          tipe_tujuan: 'utama',
          unit_id: selectedSubUnitId || selectedUnitId, 
          user_id: selectedUserId || null,
        }]
      };
      
      await createSuratKeluar(payload);
      alert('Surat keluar berhasil dibuat!');
      navigate('/dashboard/surat-keluar');
    } catch (err) {
      setError(err.message || "Gagal membuat surat keluar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Buat Surat Keluar Baru</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
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

        <div>
            <h3 className="text-lg font-medium text-gray-900">Alur Persetujuan</h3>
            <div className="mt-4 space-y-2">
                {Object.keys(approverOptions).map(key => {
                    const approver = approverOptions[key];
                    if (!approver) return null;
                    return (
                        <div key={approver.id} className="flex items-center">
                            <input id={`approver-${approver.id}`} name="approvers" type="checkbox" value={`paraf|${approver.id}|${approver.nama}`} onChange={handleApproverChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor={`approver-${approver.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                {approver.nama} <span className="text-xs text-gray-500">({key.replace(/_/g, ' ')})</span>
                            </label>
                        </div>
                    )
                })}
            </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={() => navigate('/dashboard/surat-keluar')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                {isLoading ? 'Menyimpan...' : 'Simpan & Ajukan Surat'}
            </button>
        </div>
      </form>
    </div>
  );
}
