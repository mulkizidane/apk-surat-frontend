import React, { useState } from 'react';
// 1. Import useNavigate
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../api/auth';

export default function LoginForm() {
  const { login } = useAuth();
  // 2. Inisialisasi hook navigasi
  const navigate = useNavigate(); 

  const [nim, setNim] = useState('9999');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await apiLogin(nim, password);
      
      if (data.token && data.user) {
        login(data);
        // 3. INI BAGIAN PENTING: Arahkan ke dashboard setelah login sukses
        navigate('/dashboard'); 
      } else {
        setError('Login berhasil tapi tidak menerima data yang valid.');
      }
    } catch (err) {
      setError(err.message || 'NIM atau password salah.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nim" className="block text-sm font-medium text-gray-700">
          NIM / NIP
        </label>
        <div className="mt-1">
          <input
            id="nim"
            name="nim"
            type="text"
            autoComplete="username"
            required
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password"  className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}