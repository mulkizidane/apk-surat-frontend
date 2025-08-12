import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fungsi untuk menempelkan token ke header default Axios.
 * @param {string | null} token - Token JWT dari localStorage.
 */
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/*
 * ====================================================================
 * KUMPULAN FUNGSI API (SESUAI BACKEND BARU KITA)
 * ====================================================================
 */

// --- API UNTUK OTENTIKASI ---
export const login = (nim, password) => {
  return apiClient.post('/login', { nim, password });
};

// --- API UNTUK SURAT ---
export const getSuratKeluar = () => apiClient.get('/surat/keluar');
export const getSuratMasuk = () => apiClient.get('/surat/masuk');
export const getSuratDetail = (id) => apiClient.get(`/surat/${id}`);
export const createSurat = (suratData) => apiClient.post('/surat', suratData);
export const getInbox = () => apiClient.get('/surat/inbox');

// --- API UNTUK DATA PENDUKUNG ---
export const getUnitTree = () => apiClient.get('/units/tree');
export const getKategoriSurat = () => apiClient.get('/kategori-surat');
export const getJenisSurat = (kategoriId) => apiClient.get(`/jenis-surat?kategori_id=${kategoriId}`);
export const getInternalUsers = () => apiClient.get('/users/internal');
export const getApprovers = () => apiClient.get('/approvers');
export const submitVerifikasi = (suratId, verifikasiData) => apiClient.put(`/verifikasi/${suratId}`, verifikasiData);
export const submitDisposisi = (suratId, disposisiData) => apiClient.post(`/disposisi/${suratId}`, disposisiData);
export const getDashboardData = () => apiClient.get('/dashboard');
export const submitDistribusi = (suratId, distribusiData) => apiClient.post(`/distribusi/${suratId}`, distribusiData);
export const getVerifikasiKeluar = () => apiClient.get('/surat/verifikasi-keluar');
export const updateSurat = (id, suratData) => apiClient.put(`/surat/${id}`, suratData);

export default apiClient;