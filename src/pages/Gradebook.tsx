import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { BookOpen, Plus, Save, Award, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Gradebook() {
  const { classes, students, assignments, grades, saveGrade, addAssignment } = useData();
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentScore, setNewAssignmentScore] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  // Sync when class changes
  useEffect(() => {
    if (!selectedClass && classes.length > 0) {
      setSelectedClass(classes[0].id);
    }
  }, [selectedClass, classes]);

  const handleAddAssignment = () => {
    if (newAssignmentName.trim()) {
      addAssignment(selectedClass, newAssignmentName.trim(), newAssignmentScore);
      setIsAddingAssignment(false);
      setNewAssignmentName('');
      setNewAssignmentScore(100);
    }
  };

  const handleExport = () => {
    // Generate CSV export
    let csv = 'Student Name';
    const classAssignments = assignments.filter(a => a.classId === selectedClass);
    
    // Header row
    classAssignments.forEach(a => {
      csv += `,${a.name} (/${a.maxScore})`;
    });
    csv += ',Final Grade\n';

    // Data rows
    const classStudents = students.filter(s => s.classId === selectedClass);
    classStudents.forEach(student => {
      csv += `"${student.name}"`;
      
      let totalScore = 0;
      let totalMax = 0;

      classAssignments.forEach(a => {
        const grade = grades.find(g => g.studentId === student.id && g.assignmentId === a.id);
        const score = grade?.score ?? '';
        csv += `,${score}`;
        
        if (grade?.score != null) {
          totalScore += grade.score;
          totalMax += a.maxScore;
        }
      });
      
      const finalGrade = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : '';
      csv += `,${finalGrade}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradebook_${selectedClass}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currentStudents = students.filter(s => s.classId === selectedClass);
  const currentAssignments = assignments.filter(a => a.classId === selectedClass);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Award className="h-6 w-6 text-orange-500 mr-2" />
            Class Gradebook
          </h2>
          <p className="mt-2 text-slate-500">Manage assignments and track student performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white w-full sm:w-auto min-w-[200px]"
          >
            {classes.length === 0 && <option value="" disabled>No classes yet</option>}
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors w-full sm:w-auto justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Classes Found</h3>
          <p className="text-slate-500 mb-6 max-w-md">
            Start by adding a class in Learner Management before managing grades.
          </p>
        </div>
      ) : currentStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Students</h3>
          <p className="text-slate-500 mb-6 max-w-md">
            Import students first so you can start assigning grades.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-slate-200 bg-slate-50 gap-3">
            <h3 className="font-medium text-slate-800">Assignments</h3>
          {isAddingAssignment ? (
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  autoFocus
                  value={newAssignmentName}
                  onChange={e => setNewAssignmentName(e.target.value)}
                  placeholder="Assignment Name"
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none flex-1 min-w-0"
                />
                <input
                  type="number"
                  value={newAssignmentScore}
                  onChange={e => setNewAssignmentScore(parseInt(e.target.value) || 0)}
                  placeholder="Max Score"
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none w-full sm:w-24"
                />
                <div className="flex items-center gap-2 sm:mt-0">
                  <button onClick={handleAddAssignment} className="text-white bg-orange-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700 flex-1 justify-center sm:flex-none">Save</button>
                  <button onClick={() => setIsAddingAssignment(false)} className="text-slate-600 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium flex-1 justify-center sm:flex-none transition-colors">Cancel</button>
                </div>
             </div>
          ) : (
            <button
              onClick={() => setIsAddingAssignment(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Assignment
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 w-64">
                  Student Name
                </th>
                {currentAssignments.map(assignment => (
                  <th key={assignment.id} scope="col" className="px-6 py-4 text-center text-xs font-medium text-slate-500 tracking-wider whitespace-nowrap">
                    <div className="font-semibold text-slate-700">{assignment.name}</div>
                    <div className="text-[10px] mt-0.5 text-slate-400 uppercase">Out of {assignment.maxScore}</div>
                  </th>
                ))}
                <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-100">
                  Grade So Far
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={currentAssignments.length + 2} className="px-6 py-12 text-center text-slate-500">
                    No students in this class yet. Go to Attendance to import students.
                  </td>
                </tr>
              ) : currentStudents.map((student) => {
                let totalScore = 0;
                let totalMax = 0;

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap sticky left-0 bg-white border-r border-slate-100 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-medium text-sm mr-3 shrink-0">
                        {student?.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-slate-900">{student?.name}</span>
                    </td>
                    
                    {currentAssignments.map(assignment => {
                      const grade = grades.find(g => g.studentId === student.id && g.assignmentId === assignment.id);
                      if (grade && grade.score !== null) {
                         totalScore += grade.score;
                         totalMax += assignment.maxScore;
                      }

                      return (
                        <td key={assignment.id} className="px-6 py-3 whitespace-nowrap text-center">
                          <input
                            type="number"
                            value={grade?.score ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : parseInt(e.target.value);
                              saveGrade(student.id, assignment.id, val);
                            }}
                            className="w-16 text-center border-b border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none bg-transparent py-1 transition-colors"
                            placeholder="-"
                          />
                        </td>
                      );
                    })}

                    <td className="px-6 py-3 whitespace-nowrap text-center bg-slate-50 font-semibold text-slate-700">
                      {totalMax > 0 ? `${Math.round((totalScore / totalMax) * 100)}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
