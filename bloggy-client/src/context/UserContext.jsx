// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check current session
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        // unwrap the `user` field
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}
