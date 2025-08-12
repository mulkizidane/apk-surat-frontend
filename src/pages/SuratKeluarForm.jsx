import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUnitTree, createSurat, getKategoriSurat, getJenisSurat, getSuratDetail, updateSurat } from '../api/api'; 
import { useAuth } from '../context/AuthContext';

export default function SuratKeluarForm() {
  const { id: suratId } = useParams();
  const isEditMode = Boolean(suratId);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nomor_surat: '',
    perihal: '',
    kategori_surat_id: '',
    jenis_surat_id: '',
    tujuan: '', // Field baru
    tembusan: '', // Field baru
    isi_ringkas: '',
    tanggal_surat: new Date().toISOString().split('T')[0],
    id_unit_penerima: '',
    id_user_penerima_akhir: null,
  });

  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [jenisOptions, setJenisOptions] = useState([]);
  const [unitTree, setUnitTree] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedSubUnitId, setSelectedSubUnitId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [subUnitOptions, setSubUnitOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect untuk mengambil data awal (Kategori & Unit)
  useEffect(() => {
    setIsLoading(true);
    const loadInitialData = async () => {
      try {
        const [unitRes, kategoriRes] = await Promise.all([
          getUnitTree(),
          getKategoriSurat(),
        ]);
        setUnitTree(unitRes.data || []);
        setKategoriOptions(kategoriRes.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Gagal memuat data awal.");
      }
    };
    loadInitialData().finally(() => {
        // Hanya set loading false setelah data awal selesai, 
        // biarkan useEffect edit mode yang mengontrol loading selanjutnya
        if (!isEditMode) setIsLoading(false);
    });
  }, [isEditMode]);

  // useEffect untuk mengisi form jika ini adalah mode edit
  useEffect(() => {
    if (isEditMode && unitTree.length > 0) {
      const loadSuratData = async () => {
        try {
          const response = await getSuratDetail(suratId);
          const d = response.data;
          setFormData({
            nomor_surat: d.nomor_surat || '',
            perihal: d.perihal || '',
            kategori_surat_id: d.kategori_surat_id || '',
            jenis_surat_id: d.jenis_surat_id || '',
            tujuan: d.tujuan || '',
            tembusan: d.tembusan || '',
            isi_ringkas: d.isi_ringkas || '',
            tanggal_surat: d.tanggal_surat || '',
            id_unit_penerima: d.id_unit_penerima || '',
            id_user_penerima_akhir: d.id_user_penerima_akhir || null,
          });
          // Logic untuk set dropdown tujuan bisa ditambahkan di sini jika diperlukan
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          setError('Gagal memuat data surat untuk diedit.');
        } finally {
            setIsLoading(false);
        }
      };
      loadSuratData();
    }
  }, [suratId, isEditMode, unitTree]);

  // useEffect untuk mengambil Jenis Surat saat Kategori berubah
  useEffect(() => {
    if (formData.kategori_surat_id) {
      getJenisSurat(formData.kategori_surat_id)
        .then(res => setJenisOptions(res.data || []));
    }
  }, [formData.kategori_surat_id]);

  // useEffects untuk dropdown tujuan (tidak berubah)
  useEffect(() => {
    setSelectedSubUnitId('');
    setSelectedUserId('');
    setSubUnitOptions([]);
    setUserOptions([]);
    if (selectedUnitId) {
        const selectedUnit = unitTree.find(unit => unit.id.toString() === selectedUnitId);
        if (selectedUnit) {
            if (selectedUnit.sub_units && selectedUnit.sub_units.length > 0) {
                setSubUnitOptions(selectedUnit.sub_units);
            } else if (selectedUnit.users && selectedUnit.users.length > 0) {
                setUserOptions(selectedUnit.users);
            }
        }
    }
    setFormData(prev => ({ ...prev, id_unit_penerima: selectedUnitId, id_user_penerima_akhir: null }));
  }, [selectedUnitId, unitTree]);

  useEffect(() => {
      setSelectedUserId('');
      if (selectedSubUnitId) {
          const selectedSubUnit = subUnitOptions.find(sub => sub.id.toString() === selectedSubUnitId);
          setUserOptions(selectedSubUnit?.users || []);
      }
      setFormData(prev => ({ ...prev, id_unit_penerima: selectedSubUnitId || selectedUnitId, id_user_penerima_akhir: null }));
  }, [selectedSubUnitId, selectedUnitId, subUnitOptions]);

  useEffect(() => {
      setFormData(prev => ({ ...prev, id_user_penerima_akhir: selectedUserId || null }));
  }, [selectedUserId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenerateNomor = () => {
    const noUrut = Date.now().toString().slice(-4);
    const kodeUnit = user?.unit_id || 'XXX'; 
    const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const bulan = bulanRomawi[new Date().getMonth()];
    const tahun = new Date().getFullYear();
    setFormData(prev => ({ ...prev, nomor_surat: `${noUrut}/UNIT-${kodeUnit}/${bulan}/${tahun}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!formData.perihal || !formData.tujuan) {
      setError("Perihal dan Tujuan wajib diisi.");
      setIsLoading(false);
      return;
    }
    try {
      if (isEditMode) {
        await updateSurat(suratId, formData);
        alert('Surat berhasil direvisi dan dikirim ulang!');
      } else {
        await createSurat(formData);
        alert('Surat berhasil dibuat dan dikirim ke Admin Unit!');
      }
      navigate('/dashboard/surat-keluar');
    } catch (err) {
      setError(err.response?.data?.messages?.error || "Gagal menyimpan surat.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p className="text-center p-8">Loading form...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Surat Keluar' : 'Buat Surat Keluar'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="kategori_surat_id" className="block text-sm font-medium text-gray-700">Kategori Surat</label>
                <select id="kategori_surat_id" name="kategori_surat_id" value={formData.kategori_surat_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriOptions.map(kat => (<option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>))}
                </select>
            </div>
            <div>
                <label htmlFor="jenis_surat_id" className="block text-sm font-medium text-gray-700">Jenis Surat</label>
                <select id="jenis_surat_id" name="jenis_surat_id" value={formData.jenis_surat_id} onChange={handleChange} required disabled={!formData.kategori_surat_id || jenisOptions.length === 0} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
                    <option value="">-- Pilih Jenis --</option>
                    {jenisOptions.map(jenis => (<option key={jenis.id} value={jenis.id}>{jenis.nama_jenis}</option>))}
                </select>
            </div>
        </div>
        <div>
          <label htmlFor="nomor_surat" className="block text-sm font-medium text-gray-700">Nomor Surat</label>
          <div className="flex items-center mt-1">
            <input id="nomor_surat" name="nomor_surat" type="text" value={formData.nomor_surat} onChange={handleChange} className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm" placeholder="Isi manual atau generate otomatis"/>
            <button type="button" onClick={handleGenerateNomor} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">Otomatis</button>
          </div>
        </div>
        
        <div>
            <label htmlFor="perihal" className="block text-sm font-medium text-gray-700">Perihal Surat</label>
            <input id="perihal" name="perihal" type="text" value={formData.perihal} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
            <label htmlFor="tujuan" className="block text-sm font-medium text-gray-700">Tujuan (Manual)</label>
            <textarea id="tujuan" name="tujuan" rows="2" value={formData.tujuan} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
            <label htmlFor="tembusan" className="block text-sm font-medium text-gray-700">Tembusan (Manual)</label>
            <textarea id="tembusan" name="tembusan" rows="2" value={formData.tembusan} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
            <label htmlFor="isi_ringkas" className="block text-sm font-medium text-gray-700">Isi Ringkas Surat</label>
            <textarea id="isi_ringkas" name="isi_ringkas" rows="4" value={formData.isi_ringkas} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Tujuan Unit (Sistem)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label htmlFor="tujuan_unit_id" className="block text-sm font-medium text-gray-700">Unit Utama</label>
              <select id="tujuan_unit_id" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="">-- Pilih Unit --</option>
                {unitTree.map(unit => (<option key={unit.id} value={unit.id}>{unit.name}</option>))}
              </select>
            </div>
            {subUnitOptions.length > 0 && (
              <div>
                <label htmlFor="tujuan_subunit_id" className="block text-sm font-medium text-gray-700">Sub Unit (Opsional)</label>
                <select id="tujuan_subunit_id" value={selectedSubUnitId} onChange={(e) => setSelectedSubUnitId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                  <option value="">-- Kirim ke Seluruh Unit Utama --</option>
                  {subUnitOptions.map(subunit => (<option key={subunit.id} value={subunit.id}>{subunit.name}</option>))}
                </select>
              </div>
            )}
            {userOptions.length > 0 && (
              <div>
                <label htmlFor="tujuan_user_id" className="block text-sm font-medium text-gray-700">User Tujuan (Opsional)</label>
                <select id="tujuan_user_id" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                  <option value="">-- Kirim ke Seluruh Unit/Sub-Unit --</option>
                  {userOptions.map(user => (<option key={user.id} value={user.id}>{user.name}</option>))}
                </select>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={() => navigate('/dashboard/surat-keluar')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                {isLoading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan & Kirim Ulang' : 'Kirim ke Admin Unit')}
            </button>
        </div>
      </form>
    </div>
  );
}
