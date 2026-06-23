import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, TrendingUp, AlertCircle, BookOpen, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const mockAttendanceData = [
  { month: 'Sep', attendance: 98 },
  { month: 'Oct', attendance: 96 },
  { month: 'Nov', attendance: 95 },
  { month: 'Dec', attendance: 92 },
  { month: 'Jan', attendance: 94 },
  { month: 'Feb', attendance: 97 },
];

const mockGradeDistribution = [
  { grade: 'A', count: 45 },
  { grade: 'B', count: 68 },
  { grade: 'C', count: 32 },
  { grade: 'D', count: 12 },
  { grade: 'F', count: 4 },
];

export default function Dashboard() {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const { students, getStudentStats, classes } = useData();

  const toggleStudent = (id: string) => {
    if (expandedStudent === id) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(id);
    }
  };

  // Process real stats from the context
  const studentsWithStats = students.map(student => {
    const stats = getStudentStats(student.id);
    return {
      ...student,
      stats
    };
  });

  // Simple risk heuristic based on absences or grades
  const atRiskStudents = studentsWithStats.filter(s => s.stats.absent >= 3 || s.stats.attendancePercentage < 80);

  const handleExportWatchlist = () => {
    let csv = 'Student Name,Class,Absences,Attendance %,Projected Grade %\n';
    atRiskStudents.forEach(student => {
      const studentClass = classes.find(c => c.id === student.classId)?.name || 'Unknown Class';
      csv += `"${student.name}","${studentClass}",${student.stats.absent},${student.stats.attendancePercentage},${student.stats.currentGrade}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `at_risk_watchlist_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={students.length.toString()} icon={Users} color="bg-blue-500" />
        <StatCard title="Average GPA" value="3.4" icon={TrendingUp} color="bg-green-500" />
        <StatCard title="At-Risk Students" value={atRiskStudents.length.toString()} icon={AlertCircle} color="bg-orange-500" />
        <StatCard title="Active Classes" value={classes.length.toString()} icon={BookOpen} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Attendance Trends</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Grade Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockGradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-medium text-slate-800">At-Risk Students Watchlist</h3>
            <p className="mt-1 text-sm text-slate-500">Students with recent absences or dropping grades.</p>
          </div>
          <button 
            onClick={handleExportWatchlist}
            className="hidden sm:flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Watchlist
          </button>
        </div>
        <div className="divide-y divide-slate-200">
          {atRiskStudents.length === 0 && (
             <div className="px-6 py-4 text-sm text-slate-500 text-center">No at-risk students right now.</div>
          )}
          {atRiskStudents.map((student) => {
            const studentClass = classes.find(c => c.id === student.classId);
            const history = Array.from({length: 6}).map((_, i) => ({
              week: `Week ${i + 1}`,
              score: Math.max(0, student.stats.currentGrade + (5 - i) * (Math.random() > 0.5 ? 1 : -1))
            }));
            
            return (
            <div key={student.id} className="flex flex-col hover:bg-slate-50 transition-colors">
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleStudent(student.id)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium shrink-0">
                    {student?.name?.charAt(0) || '?'}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-slate-900">{student?.name}</div>
                    <div className="text-sm text-slate-500">{studentClass?.name || 'Class'} | Absences: <span className="font-medium text-rose-500">{student.stats.absent}</span></div>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-right hidden sm:block">
                    <div className="text-slate-500">Proj. Grade</div>
                    <div className="font-medium text-slate-900">{student.stats.currentGrade}%</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-slate-500">Attendance</div>
                    <div className="font-medium text-slate-900">{student.stats.attendancePercentage}%</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* Handle intervene */ }}
                      className="text-orange-600 hover:text-orange-900 font-medium"
                    >
                      Intervene
                    </button>
                    {expandedStudent === student.id ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedStudent === student.id && (
                <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                      6-Week Grade Trend
                    </h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis domain={['auto', 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px' }}
                          />
                          <Line type="monotone" dataKey="score" name="Grade %" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
      <div className={`p-4 rounded-lg text-white ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-5">
        <div className="text-sm font-medium text-slate-500">{title}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
