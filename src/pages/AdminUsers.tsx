import React from 'react';
import { Shield, UserPlus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const mockUsers = [
  { id: '1', name: 'Sarah Williams', email: 's.williams@institution.edu', role: 'Teacher', status: 'Active', classes: 4 },
  { id: '2', name: 'Dr. John Doe', email: 'j.doe@institution.edu', role: 'Teacher', status: 'Active', classes: 3 },
  { id: '3', name: 'Alex Johnson', email: 'a.johnson@student.edu', role: 'Student', status: 'Active', classes: 6 },
  { id: '4', name: 'Emily Stanton', email: 'e.stanton@institution.edu', role: 'Teacher', status: 'Inactive', classes: 0 },
];

export default function AdminUsers() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">Access Denied</h2>
          <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Shield className="h-6 w-6 text-orange-500 mr-2" />
            User Management
          </h2>
          <p className="mt-2 text-slate-500">Manage institutional access, roles, and privileges.</p>
        </div>
        <button className="flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors">
          <UserPlus className="h-4 w-4 mr-2" />
          Provision Account
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Classes</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {mockUsers.map((mockUser) => (
                <tr key={mockUser.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-medium font-sm">
                        {mockUser.name?.charAt(0) || '?'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{mockUser.name}</div>
                        <div className="text-sm text-slate-500">{mockUser.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {mockUser.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mockUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {mockUser.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {mockUser.classes > 0 ? `${mockUser.classes} active` : 'None'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button className="text-slate-400 hover:text-orange-600 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-slate-400 hover:text-orange-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
