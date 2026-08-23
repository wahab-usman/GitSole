import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();

const ADMIN_STORAGE_KEY = 'gitsole_admin_auth_v1';
const CREDS_STORAGE_KEY = 'gitsole_admin_creds_v1';

const DEFAULT_CREDS = {
  username: 'admin',
  password: 'gitsole123'
};

export function AdminAuthProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [credentials, setCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem(CREDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.username && parsed?.password) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_CREDS;
  });

  const login = (usernameInput, passwordInput) => {
    const validUser = credentials.username.trim().toLowerCase();
    const validPass = credentials.password;

    if (usernameInput.trim().toLowerCase() === validUser && passwordInput === validPass) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } catch (e) {}
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const updateCredentials = (newUsername, newPassword) => {
    const newCreds = {
      username: newUsername.trim(),
      password: newPassword
    };
    setCredentials(newCreds);
    try {
      localStorage.setItem(CREDS_STORAGE_KEY, JSON.stringify(newCreds));
    } catch (e) {}
    return { success: true };
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, credentials, login, logout, updateCredentials }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
