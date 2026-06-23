import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenTool, BookOpen, Library, LogOut, Shield, Users, Award, Settings, X, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

function ProfileSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, updateProfilePicture } = useAuth();
  const [imageUrl, setImageUrl] = useState(user?.profilePicture || '');

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfilePicture(imageUrl);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between xl mb-4 border-b pb-3">
          <h2 className="text-lg font-semibold text-slate-900">Profile Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-2xl border border-slate-200">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Local Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image URL</label>
            <input 
              type="text" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/my-photo.jpg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, switchRole, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!user) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    { name: 'Attendance & SF2', href: '/attendance', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'Gradebook & SF9', href: '/grades', icon: Award, roles: ['admin', 'teacher'] },
    { name: 'Learner Management', href: '/learners', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'Profiles (Reading/Numeracy)', href: '/profiles', icon: Shield, roles: ['admin', 'teacher'] },
    { name: 'Teacher Toolkit', href: '/toolkit', icon: PenTool, roles: ['admin', 'teacher'] },
    { name: 'Curriculum', href: '/curriculum', icon: BookOpen, roles: ['admin', 'teacher'] },
    { name: 'Repository', href: '/repository', icon: Library, roles: ['admin', 'teacher'] },
    { name: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
  ];

  const allowedNav = navigation.filter(item => item.roles.includes(user.role));

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-white/40">
        <img src="https://i.postimg.cc/KjMBHmTL/Mark-IT-Engine-2.png" alt="MarkIt Engine Logo" className="h-8 w-auto object-contain mr-2" referrerPolicy="no-referrer" />
        <span className="font-semibold text-lg tracking-tight text-slate-800">MarkIt Engine</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {allowedNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-white/60 text-orange-700 shadow-sm border border-white/50'
                  : 'text-slate-600 hover:bg-white/40 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                    isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-500'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className={cn(
                "rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm",
                user.role === 'admin' ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"
              )}>
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700 truncate w-32">{user?.firstName} {user?.lastName}</p>
              <div className="flex items-center space-x-3 mt-0.5">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center transition-colors font-medium"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </button>
                <button 
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center transition-colors font-medium"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-transparent text-slate-800">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 glass flex-col z-10 m-3 mr-0 rounded-2xl overflow-hidden shadow-xl">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform glass flex-col overflow-hidden shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden m-3 lg:ml-3 rounded-2xl glass-card">
        <header className="h-16 shrink-0 border-b border-white/40 flex items-center justify-between px-4 lg:px-8 shadow-sm glass">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 lg:hidden p-2 rounded-md text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">Workspace</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/50 text-green-800 border border-green-200">
              Supabase Connected
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <ProfileSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
