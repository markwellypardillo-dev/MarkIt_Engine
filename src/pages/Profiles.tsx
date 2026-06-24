import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Shield, BookOpen, AlertCircle, Save } from 'lucide-react';

export default function Profiles() {
  const { classes, students, profiles, saveProfile } = useData();
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');

  const currentStudents = students.filter(s => s.classId === selectedClass);

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Classes Found</h3>
        <p className="text-slate-500 mb-6 max-w-md">
          Start by adding a class in Learner Management before managing reading & numeracy profiles.
        </p>
      </div>
    );
  }

  if (currentStudents.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Reading & Numeracy Profiles</h2>
                <p className="text-xs text-slate-500">Record literacy and numeracy assessment levels.</p>
              </div>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-full sm:w-auto"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Students</h3>
            <p className="text-slate-500 mb-6 max-w-md">
              Import students first so you can start recording their profiles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Reading & Numeracy Profiles</h2>
              <p className="text-xs text-slate-500">Record literacy and numeracy assessment levels.</p>
            </div>
          </div>
          
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none w-full sm:w-auto"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold text-center">Reading Level</th>
                <th className="px-6 py-4 font-semibold text-center">Numeracy Level</th>
                <th className="px-6 py-4 font-semibold w-1/4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStudents.map(student => {
                const profile = profiles.find(p => p.studentId === student.id);
                const readingLevel = profile?.readingLevel || '';
                const numeracyLevel = profile?.numeracyLevel || '';
                const remarks = profile?.remarks || '';

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {student.name}
                    </td>
                    <td className="px-6 py-3">
                      <select 
                        value={readingLevel}
                        onChange={(e) => saveProfile(student.id, e.target.value || null, numeracyLevel, remarks)}
                        className={`w-full px-2 py-1.5 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          readingLevel === 'frustration' ? 'bg-red-50 border-red-200 text-red-700' :
                          readingLevel === 'instructional' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                          readingLevel === 'independent' ? 'bg-green-50 border-green-200 text-green-700' :
                          'bg-white border-slate-300'
                        }`}
                      >
                        <option value="">Unassessed</option>
                        <option value="frustration">Frustration</option>
                        <option value="instructional">Instructional</option>
                        <option value="independent">Independent</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <select 
                        value={numeracyLevel}
                        onChange={(e) => saveProfile(student.id, readingLevel, e.target.value || null, remarks)}
                        className={`w-full px-2 py-1.5 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          numeracyLevel === 'non-numerate' ? 'bg-red-50 border-red-200 text-red-700' :
                          numeracyLevel === 'emergent' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                          numeracyLevel === 'numerate' ? 'bg-green-50 border-green-200 text-green-700' :
                          'bg-white border-slate-300'
                        }`}
                      >
                        <option value="">Unassessed</option>
                        <option value="non-numerate">Non-numerate</option>
                        <option value="emergent">Emergent</option>
                        <option value="numerate">Numerate</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <input 
                        type="text"
                        value={remarks}
                        placeholder="Add note..."
                        onChange={(e) => saveProfile(student.id, readingLevel, numeracyLevel, e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-300 focus:border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
        <div className="text-sm text-orange-800">
          <p className="font-medium mb-1">About Profiles</p>
          <p className="opacity-90">
            Changes are saved automatically as you update them. These profiles can be used during parent-teacher conferences and when generating reading program interventions.
          </p>
        </div>
      </div>
    </div>
  );
}
