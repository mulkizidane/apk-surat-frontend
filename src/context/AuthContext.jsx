import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokenInStorage = localStorage.getItem('jwt_token');
    if (tokenInStorage) {
      try {
        setAuthToken(tokenInStorage);
        const decoded = JSON.parse(atob(tokenInStorage.split('.')[1]));
        
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
        localStorage.removeItem('jwt_token');
        setAuthToken(null);
        setUser(null);
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (data) => {
    const { token, user } = data;
    localStorage.setItem('jwt_token', token);
    setAuthToken(token);
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};