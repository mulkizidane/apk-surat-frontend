import axios from 'axios';

// Definisikan URL base dari backend kita di satu tempat
const API_URL = 'http://localhost:8080/api';

// 1. Buat instance Axios yang akan kita gunakan di mana-mana
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
    // Terapkan token ke header untuk semua request selanjutnya
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Hapus token dari header jika logout
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/*
 * ====================================================================
 * KUMPULAN FUNGSI API
 * Semua fungsi di bawah ini sekarang otomatis membawa token jika user sudah login.
 * ====================================================================
 */

// --- API UNTUK SURAT KELUAR ---
export const getSuratKeluar = () => apiClient.get('/surat-keluar');
export const getSuratKeluarDetail = (id) => apiClient.get(`/surat-keluar/${id}`);
export const createSuratKeluar = (suratData) => apiClient.post('/surat-keluar', suratData);
export const getVerifikasiDetail = (parafId) => apiClient.get(`/verifikasi/${parafId}`);

// --- API Surat Masuk ---
export const getSuratMasuk = () => apiClient.get('/surat-masuk');
export const getSuratMasukDetail = (id) => apiClient.get(`/surat-masuk/${id}`);


// --- API UNTUK DATA PENDUKUNG ---
export const getApprovers = () => apiClient.get('/approvers');
export const getKategoriSurat = () => apiClient.get('/kategori-surat');
export const getJenisSurat = (kategoriId) => apiClient.get(`/jenis-surat?kategori_id=${kategoriId}`);
export const getUnitTree = () => apiClient.get('/units/tree'); // Endpoint baru untuk dropdown
export const getUsers = () => apiClient.get('/users');

// --- API UNTUK DASHBOARD ---
export const getDashboardData = () => apiClient.get('/dashboard');


export default apiClient;
