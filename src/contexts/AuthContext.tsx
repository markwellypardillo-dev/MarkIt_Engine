import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Role = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, firstName: string, lastName: string, password?: string) => Promise<void>;
  switchRole: () => void;
  updateProfile: (firstName: string, lastName: string, profilePictureUrl?: string) => Promise<void>;
  updateProfilePicture: (url: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      } else if (localStorage.getItem('mockAdminLoggedIn') === 'true') {
        const email = 'admin@gmail.com';
        let profilePicture = undefined;
        try {
          const savedPics = JSON.parse(localStorage.getItem('profilePictures') || '{}');
          profilePicture = savedPics[email] || undefined;
        } catch (e) {}
        
        setUser({
          id: 'mock-admin-id',
          email,
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          profilePicture
        });
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      } else if (localStorage.getItem('mockAdminLoggedIn') !== 'true') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: any) => {
    const meta = supabaseUser.user_metadata || {};
    
    // Check for saved profile pictures in local storage as a fallback, especially for older mock accounts
    let profilePicture = meta.avatar_url;
    if (!profilePicture) {
      try {
        const savedPics = JSON.parse(localStorage.getItem('profilePictures') || '{}');
        profilePicture = savedPics[supabaseUser.email?.toLowerCase() || ''] || undefined;
      } catch (e) {}
    }

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: meta.first_name || 'Admin',
      lastName: meta.last_name || 'User',
      role: meta.role || 'teacher',
      profilePicture: profilePicture
    });
    setLoading(false);
  };

  const login = async (email: string, password?: string) => {
    // Hardcoded bypass for admin to avoid Supabase rate limits on new free tier projects
    if (email.toLowerCase() === 'admin@gmail.com') {
      if (password === 'admin123') {
        localStorage.setItem('mockAdminLoggedIn', 'true');
        
        let profilePicture = undefined;
        try {
          const savedPics = JSON.parse(localStorage.getItem('profilePictures') || '{}');
          profilePicture = savedPics[email.toLowerCase()] || undefined;
        } catch (e) {}
        
        setUser({
          id: 'mock-admin-id',
          email,
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          profilePicture
        });
        return;
      } else {
        throw new Error("Invalid login credentials");
      }
    }

    // Mock Supabase fallback for demoing before ENV vars are set
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder-project-id.supabase.co') {
      console.warn("Using mock auth because VITE_SUPABASE_URL is not set.");
      let profilePicture = undefined;
      try {
        const savedPics = JSON.parse(localStorage.getItem('profilePictures') || '{}');
        profilePicture = savedPics[email.toLowerCase()] || undefined;
      } catch (e) {}
      
      setUser({
        id: 'mock-user',
        email,
        firstName: 'Mock',
        lastName: 'Teacher',
        role: 'teacher',
        profilePicture
      });
      return;
    }

    if (!password) {
      throw new Error("Password is required for Supabase authentication.");
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, firstName: string, lastName: string, password?: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder-project-id.supabase.co') {
      console.warn("Using mock registration because VITE_SUPABASE_URL is not set.");
      setUser({
        id: `teacher-${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        role: 'teacher'
      });
      return;
    }

    if (!password) {
      throw new Error("Password is required for registration.");
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: email.toLowerCase().includes('admin') ? 'admin' : 'teacher',
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }
    
    // Sometimes signUp requires email confirmation and won't log the user in immediately
    alert('Registration successful! Please check your email to confirm your account.');
  };

  const logout = async () => {
    if (localStorage.getItem('mockAdminLoggedIn') === 'true') {
      localStorage.removeItem('mockAdminLoggedIn');
      setUser(null);
      return;
    }

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder-project-id.supabase.co') {
      setUser(null);
      return;
    }
    
    await supabase.auth.signOut();
    setUser(null);
  };

  const switchRole = () => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, role: prev.role === 'admin' ? 'teacher' : 'admin' } : null);
  };

  const updateProfile = async (firstName: string, lastName: string, profilePictureUrl?: string) => {
    if (!user) return;
    
    // Save to local state
    setUser(prev => prev ? { ...prev, firstName, lastName, profilePicture: profilePictureUrl || prev.profilePicture } : null);
    
    // Try to save to Supabase User Metadata if using real auth
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project-id.supabase.co') {
      await supabase.auth.updateUser({
        data: { 
          first_name: firstName,
          last_name: lastName,
          ...(profilePictureUrl ? { avatar_url: profilePictureUrl } : {})
        }
      });
    }

    if (profilePictureUrl) {
      // Always save to local storage as backup
      try {
        const savedPics = JSON.parse(localStorage.getItem('profilePictures') || '{}');
        savedPics[user.email.toLowerCase()] = profilePictureUrl;
        localStorage.setItem('profilePictures', JSON.stringify(savedPics));
      } catch (e) {
        console.error('Failed to save profile picture to local storage', e);
      }
    }
  };

  const updateProfilePicture = async (url: string) => {
    if (!user) return;
    
    // Save to local state
    setUser(prev => prev ? { ...prev, profilePicture: url } : null);
    
    // Try to save to Supabase User Metadata if using real auth
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project-id.supabase.co') {
      await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
    }

    // Always save to local storage as backup
    try {
      const savedPics = JSON.parse(localStorage.getItem('profilePictures') || '{}');
      savedPics[user.email.toLowerCase()] = url;
      localStorage.setItem('profilePictures', JSON.stringify(savedPics));
    } catch (e) {
      console.error('Failed to save profile picture to local storage', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, switchRole, updateProfile, updateProfilePicture, loading }}>
      {!loading && children}
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
