import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TeacherToolkit from './pages/TeacherToolkit';
import Curriculum from './pages/Curriculum';
import Repository from './pages/Repository';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import Gradebook from './pages/Gradebook';
import Learners from './pages/Learners';
import Profiles from './pages/Profiles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="grades" element={<Gradebook />} />
              <Route path="learners" element={<Learners />} />
              <Route path="profiles" element={<Profiles />} />
              <Route path="toolkit" element={<TeacherToolkit />} />
              <Route path="curriculum" element={<Curriculum />} />
              <Route path="repository" element={<Repository />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="*" element={<div className="p-8 text-center text-slate-500">Module under construction.</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

