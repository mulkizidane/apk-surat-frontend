// Import instance apiClient yang sudah kita buat, bukan apiFetch
import apiClient from './api';

/**
 * Fungsi untuk mengambil data dashboard dari backend.
 * @returns {Promise<any>} - Data JSON dari response
 */
export const getDashboardData = () => {
  // Gunakan apiClient untuk melakukan request GET
  return apiClient.get('/dashboard');
};

// Jika ada fungsi API lain yang berhubungan dengan dashboard,
// letakkan di sini dan pastikan menggunakan apiClient.
