import React, { createContext, useContext, useState } from 'react';

type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  profilePicture?: string;
}

export const BUILT_IN_ADMIN: User = {
  id: 'admin-0000-0000',
  email: 'admin@institution.edu',
  firstName: 'System',
  lastName: 'Administrator',
  role: 'admin'
};

export const MOCK_TEACHER: User = {
  id: 'teacher-1111-1111',
  email: 'teacher@institution.edu',
  firstName: 'Sarah',
  lastName: 'Williams',
  role: 'teacher'
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => void;
  logout: () => void;
  register: (email: string, firstName: string, lastName: string) => void;
  switchRole: () => void; // Kept for quick preview testing
  updateProfilePicture: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start as null to force login screen, simulating real auth flow
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password?: string) => {
    // Mock Supabase Auth login wrapper
    if (email.toLowerCase() === 'admin@gmail.com') {
      if (password === 'admin123') {
        setUser({ ...BUILT_IN_ADMIN, email });
      } else {
        throw new Error('Invalid administrator credentials.');
      }
    } else if (email.includes('admin')) {
      setUser(BUILT_IN_ADMIN);
    } else {
      setUser({ ...MOCK_TEACHER, email });
    }
  };

  const register = (email: string, firstName: string, lastName: string) => {
    // Mock Supabase Auth signup wrapper
    setUser({
      id: `teacher-${Math.random().toString(36).substr(2, 9)}`,
      email,
      firstName,
      lastName,
      role: 'teacher' // Default role for self-registration
    });
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = () => {
    if (!user) return;
    setUser(prev => prev?.role === 'admin' ? MOCK_TEACHER : BUILT_IN_ADMIN);
  };

  const updateProfilePicture = (url: string) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, profilePicture: url } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, switchRole, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
