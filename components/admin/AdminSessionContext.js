'use client';

import { createContext, useContext } from 'react';

const AdminSessionContext = createContext(null);

export function AdminSessionProvider({ role, name, email, children }) {
  return (
    <AdminSessionContext.Provider value={{ role, name, email }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}