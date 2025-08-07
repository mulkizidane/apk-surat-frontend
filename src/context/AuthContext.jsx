import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../api/api'; // Import fungsi setAuthToken

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokenInStorage = localStorage.getItem('jwt_token');
    if (tokenInStorage) {
      try {
        // PENTING: Saat aplikasi refresh, langsung set token ke header Axios
        setAuthToken(tokenInStorage);
        
        // Decode token untuk mendapatkan data user tanpa harus panggil API lagi
        const decoded = JSON.parse(atob(tokenInStorage.split('.')[1]));
        
        // Cek apakah token sudah kedaluwarsa
        if (decoded.exp * 1000 < Date.now()) {
            throw new Error("Token expired");
        }

        setUser({
            id: decoded.uid,
            nim: decoded.nim,
            name: decoded.name,
            role: decoded.role,
        });
        setToken(tokenInStorage);

      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // Jika token tidak valid atau kedaluwarsa, hapus semuanya
        localStorage.removeItem('jwt_token');
        setAuthToken(null);
        setUser(null);
        setToken(null);
      }
    }
    setIsLoading(false); // Selesai pengecekan awal
  }, []);

  const login = (data) => {
    const { token, user } = data;
    // Fungsi login dari auth.js sudah menangani localStorage dan setAuthToken
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    // Fungsi logout dari auth.js sudah menangani localStorage dan setAuthToken
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  // Jangan render apapun sampai pengecekan token selesai
  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
