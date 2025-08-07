import apiClient, { setAuthToken } from './api'; // Import instance apiClient

/**
 * Fungsi untuk login user.
 * @param {string} nim - NIM atau NIP user.
 * @param {string} password - Password user.
 * @returns {Promise<object>} - Data user dan token.
 */
export const login = async (nim, password) => {
  try {
    const response = await apiClient.post('/login', { nim, password });
    
    if (response.data && response.data.token) {
      const { token, user } = response.data;
      
      // 1. Simpan token ke localStorage
      localStorage.setItem('jwt_token', token);
      
      // 2. PENTING: Langsung set token ke header Axios untuk request selanjutnya
      setAuthToken(token);

      // 3. Kembalikan data lengkap
      return { token, user };
    }
    // Jika response tidak sesuai format yang diharapkan
    throw new Error("Respons dari server tidak valid.");

  } catch (error) {
    // Tangani error dari Axios dan berikan pesan yang jelas
    const message = error.response?.data?.messages?.error || 'NIM atau Password salah.';
    throw new Error(message);
  }
};

/**
 * Fungsi untuk logout user.
 */
export const logout = () => {
    localStorage.removeItem('jwt_token');
    setAuthToken(null); // Hapus token dari header Axios
};
