import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Plus, Upload, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

export default function Learners() {
  const { classes, students, addClass, importStudents } = useData();
  const [newClassName, setNewClassName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const id = addClass(newClassName);
    setSelectedClass(id);
    setNewClassName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClass) {
      alert("Please select or create a class first.");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          // Flatten results and take the first non-empty column as names, or join if needed
          // Assuming simple CSV with names in one column, or just join them
          const newNames: string[] = [];
          results.data.forEach((row: any) => {
            if (Array.isArray(row)) {
              const name = row.filter(cell => typeof cell === 'string' && cell.trim()).join(' ');
              if (name) newNames.push(name.trim());
            } else if (typeof row === 'object' && row !== null) {
              // If it has headers
              const vals = Object.values(row).filter(val => typeof val === 'string' && val.trim());
              const name = vals.join(' ');
              if (name) newNames.push(name.trim());
            }
          });
          
          if (newNames.length > 0) {
            importStudents(selectedClass, newNames);
          } else {
            alert('No valid student names found in the CSV.');
          }
        },
        error: (err) => {
          console.error(err);
          alert('Failed to parse CSV file.');
        },
        skipEmptyLines: true
      });
      // reset input
      e.target.value = '';
    }
  };

  const currentStudents = students.filter(s => s.classId === selectedClass);

  if (classes.length === 0) {
    return (
      <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm text-center">
        <Users className="w-16 h-16 text-orange-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Classes Found</h2>
        <p className="text-slate-500 mb-6">Create your first class to start managing learners.</p>
        <form onSubmit={handleAddClass} className="flex max-w-sm mx-auto items-center space-x-2">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="e.g. Math 101"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Create
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Learner Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your classes and student rosters.</p>
        </div>
        
        <form onSubmit={handleAddClass} className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="New class name..."
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm w-full sm:w-48"
          />
          <button type="submit" className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 flex items-center shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Class
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Classes</h3>
          {classes.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedClass(c.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedClass === c.id ? 'bg-orange-50 text-orange-700 border border-orange-200 font-medium' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">
              {classes.find(c => c.id === selectedClass)?.name || 'Select a class'} Roster
            </h3>
            
            <div className="flex items-center">
              <label className="cursor-pointer flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                <Upload className="w-4 h-4 mr-1.5" />
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
          
          <div className="divide-y divide-slate-200">
            {currentStudents.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                This class has no students yet. Import a CSV file to add learners.
              </div>
            ) : (
              currentStudents.map(student => (
                <div key={student.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50">
                  <span className="font-medium text-slate-900">{student.name}</span>
                  <button className="text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
