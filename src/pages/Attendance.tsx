import React, { useState, useEffect, useRef } from 'react';
import { Users, Upload, Check, X, Clock, Save as SaveIcon, FileSpreadsheet, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData, AttendanceStatus, Student } from '../contexts/DataContext';

export default function Attendance() {
  const { classes, students: allStudents, attendanceRecords, saveAttendance, addClass, importStudents, updateStudentName } = useData();
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<(Student & { status: AttendanceStatus })[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add class state
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // Edit name state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync students when class or date changes
  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].id);
    }

    if (!selectedClass) return;
    const classStudents = allStudents.filter(s => s.classId === selectedClass);
    
    // Check if we have existing records for this date/class
    const existingRecords = attendanceRecords.filter(r => r.date === date && r.classId === selectedClass);
    
    setStudents(classStudents.map(student => {
      const record = existingRecords.find(r => r.studentId === student.id);
      return {
        ...student,
        status: record ? record.status : 'present' // default to present
      };
    }));
  }, [selectedClass, date, allStudents, attendanceRecords, classes]);

  const handleAddClass = () => {
    if (newClassName.trim()) {
      const newId = addClass(newClassName.trim());
      setSelectedClass(newId);
      setIsAddingClass(false);
      setNewClassName('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // Use dynamic import for xlsx to avoid blocking initial load if possible,
      // but standard import at top is fine too. Let's just import it dynamically here:
      const XLSX = await import('xlsx');
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      const names = json
        .map(row => row[0]) // Assumes names are in the first column
        .filter(name => {
          if (!name || typeof name !== 'string') return false;
          const lower = name.toLowerCase().trim();
          return lower !== 'name' && lower !== 'student name' && lower !== 'student' && lower !== 'students';
        })
        .map(name => name.trim());

      if (names.length > 0) {
        importStudents(selectedClass, names);
      } else {
        alert('No valid names found in the file. Make sure names are in the first column.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to parse file. Please make sure it is a valid Excel or CSV file.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const startEditName = (studentId: string, currentName: string) => {
    setEditingStudentId(studentId);
    setEditNameValue(currentName);
  };

  const saveEditName = () => {
    if (editingStudentId && editNameValue.trim()) {
      updateStudentName(editingStudentId, editNameValue.trim());
    }
    setEditingStudentId(null);
  };

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveAttendance(date, selectedClass, students.map(s => ({ studentId: s.id, status: s.status })));
      setIsSaving(false);
      alert('Attendance saved successfully!');
    }, 1000);
  };

  const stats = {
    present: students.filter(s => s.status === 'present').length,
    late: students.filter(s => s.status === 'late').length,
    absent: students.filter(s => s.status === 'absent').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Users className="h-6 w-6 text-orange-500 mr-2" />
            Daily Attendance Tracker
          </h2>
          <p className="mt-2 text-slate-500">Select a class, import roster, and track daily attendance.</p>
        </div>
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 w-full xl:w-auto">
          {isAddingClass ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <input
                type="text"
                autoFocus
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="e.g. Grade 11 - Art"
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none flex-1 w-full min-w-0 sm:min-w-[150px]"
              />
              <div className="flex items-center gap-2 sm:mt-0">
                <button onClick={handleAddClass} className="text-white bg-orange-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 flex-1 justify-center sm:flex-none">Save</button>
                <button onClick={() => setIsAddingClass(false)} className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm font-medium flex-1 justify-center sm:flex-none">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white flex-1 w-full min-w-0 sm:min-w-[200px]"
              >
                {classes.length === 0 && <option value="" disabled>No classes yet</option>}
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button onClick={() => setIsAddingClass(true)} className="flex items-center justify-center px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full sm:w-auto">
                + Add Class
              </button>
            </div>
          )}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-full sm:w-auto min-w-0"
          />
          <div className="relative w-full sm:w-auto">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-header"
            />
            <label
              htmlFor="file-upload-header"
              className={cn(
                "inline-flex justify-center items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors cursor-pointer w-full sm:w-auto",
                isImporting ? "opacity-70 pointer-events-none" : ""
              )}
              title="Import additional students via Excel/CSV"
            >
              <Upload className="h-4 w-4 mr-2 text-slate-500" />
              Import Roster
            </label>
          </div>
        </div>
      </div>

      {allStudents.filter(s => s.classId === selectedClass).length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Students Loaded</h3>
          <p className="text-slate-500 mb-6 max-w-md">
            Import an Excel (.xlsx, .xls) or CSV file containing your students' names for this class to start taking attendance.
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={cn(
                "inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition-colors cursor-pointer",
                isImporting ? "opacity-70 pointer-events-none" : ""
              )}
            >
              {isImporting ? 'Importing...' : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Class Roster
                </>
              )}
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col items-center justify-center">
              <span className="text-emerald-600 text-sm font-medium mb-1">Present</span>
              <span className="text-2xl font-bold text-emerald-700">{stats.present}</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex flex-col items-center justify-center">
              <span className="text-amber-600 text-sm font-medium mb-1">Late</span>
              <span className="text-2xl font-bold text-amber-700">{stats.late}</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex flex-col items-center justify-center">
              <span className="text-rose-600 text-sm font-medium mb-1">Absent</span>
              <span className="text-2xl font-bold text-rose-700">{stats.absent}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Name</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
                            {student?.name?.charAt(0) || '?'}
                          </div>
                          <div className="ml-3 group flex items-center">
                            {editingStudentId === student.id ? (
                               <div className="flex items-center space-x-2">
                                  <input 
                                    type="text" 
                                    value={editNameValue} 
                                    onChange={(e) => setEditNameValue(e.target.value)} 
                                    className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-orange-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEditName();
                                      if (e.key === 'Escape') setEditingStudentId(null);
                                    }}
                                  />
                                  <button onClick={saveEditName} className="text-orange-600 hover:text-orange-800"><SaveIcon className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingStudentId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                               </div>
                            ) : (
                              <>
                                <span className="font-medium text-slate-900">{student.name}</span>
                                <button 
                                  onClick={() => startEditName(student.id, student.name)}
                                  className="ml-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-orange-500"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                          <button
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={cn(
                              "flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                              student.status === 'present' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            <Check className="w-4 h-4 mr-1.5" />
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={cn(
                              "flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                              student.status === 'late' ? "bg-white text-amber-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            <Clock className="w-4 h-4 mr-1.5" />
                            Late
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={cn(
                              "flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                              student.status === 'absent' ? "bg-white text-rose-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            <X className="w-4 h-4 mr-1.5" />
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none transition-colors disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
