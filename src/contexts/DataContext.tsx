import React, { createContext, useContext, useState } from 'react';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Class {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  baseGrade: number; // For mock grade calculation
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface Assignment {
  id: string;
  classId: string;
  name: string;
  maxScore: number;
}

export interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number | null;
}

interface DataContextType {
  classes: Class[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  grades: Grade[];
  saveAttendance: (date: string, classId: string, records: {studentId: string, status: AttendanceStatus}[]) => void;
  addClass: (name: string) => string;
  importStudents: (classId: string, names: string[]) => void;
  addAssignment: (classId: string, name: string, maxScore: number) => string;
  saveGrade: (studentId: string, assignmentId: string, score: number | null) => void;
  updateStudentName: (studentId: string, newName: string) => void;
  getStudentStats: (studentId: string) => { 
    present: number; 
    absent: number; 
    late: number; 
    total: number; 
    attendancePercentage: number;
    currentGrade: number;
  };
}

const MOCK_CLASSES: Class[] = [
  { id: 'c1', name: 'Grade 7 - Mathematics' },
  { id: 'c2', name: 'Grade 9 - Science' },
  { id: 'c3', name: 'Grade 10 - History' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Alex Johnson', classId: 'c1', baseGrade: 82 },
  { id: 's2', name: 'Sarah Williams', classId: 'c1', baseGrade: 75 },
  { id: 's3', name: 'Marcus Chen', classId: 'c1', baseGrade: 88 },
  { id: 's4', name: 'Emily Stanton', classId: 'c2', baseGrade: 92 },
  { id: 's5', name: 'Michael Brown', classId: 'c2', baseGrade: 65 },
  { id: 's6', name: 'Jessica Davis', classId: 'c3', baseGrade: 95 },
];

// Pre-populate some historical attendance
const generateMockAttendance = () => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  MOCK_STUDENTS.forEach(student => {
    // Generate last 10 days of attendance
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      
      const dateStr = d.toISOString().split('T')[0];
      
      // Give Sarah and Michael more absences to make them at-risk
      let status: AttendanceStatus = 'present';
      if ((student.id === 's2' || student.id === 's5') && Math.random() > 0.6) {
        status = 'absent';
      } else if (Math.random() > 0.8) {
        status = 'late';
      }

      records.push({
        id: `${student.id}-${dateStr}`,
        date: dateStr,
        classId: student.classId,
        studentId: student.id,
        status,
      });
    }
  });
  return records;
};

const INITIAL_ATTENDANCE = generateMockAttendance();

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', classId: 'c1', name: 'Midterm Exam', maxScore: 100 },
  { id: 'a2', classId: 'c1', name: 'Homework 1', maxScore: 50 },
  { id: 'a3', classId: 'c2', name: 'Lab Report', maxScore: 100 }
];

const MOCK_GRADES: Grade[] = [
  { id: 'g1', studentId: 's1', assignmentId: 'a1', score: 85 },
  { id: 'g2', studentId: 's1', assignmentId: 'a2', score: 45 },
  { id: 'g3', studentId: 's2', assignmentId: 'a1', score: 70 },
  { id: 'g4', studentId: 's2', assignmentId: 'a2', score: 35 },
  { id: 'g5', studentId: 's3', assignmentId: 'a1', score: 92 },
  { id: 'g6', studentId: 's3', assignmentId: 'a2', score: 48 },
  { id: 'g7', studentId: 's4', assignmentId: 'a3', score: 95 },
  { id: 'g8', studentId: 's5', assignmentId: 'a3', score: 60 }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES);

  const addAssignment = (classId: string, name: string, maxScore: number) => {
    const id = `a-${Date.now()}`;
    setAssignments(prev => [...prev, { id, classId, name, maxScore }]);
    return id;
  };

  const saveGrade = (studentId: string, assignmentId: string, score: number | null) => {
    setGrades(prev => {
      const existing = prev.find(g => g.studentId === studentId && g.assignmentId === assignmentId);
      if (existing) {
        return prev.map(g => g.id === existing.id ? { ...g, score } : g);
      }
      return [...prev, { id: `g-${Date.now()}-${Math.random()}`, studentId, assignmentId, score }];
    });
  };

  const updateStudentName = (studentId: string, newName: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
  };

  const addClass = (name: string) => {
    const id = `c-${Date.now()}`;
    setClasses(prev => [...prev, { id, name }]);
    return id;
  };

  const importStudents = (classId: string, names: string[]) => {
    const newStudents = names.map((name, i) => ({
      id: `s-${Date.now()}-${i}`,
      name,
      classId,
      baseGrade: Math.floor(Math.random() * 21) + 75 // Mock grade 75-95
    }));
    setStudents(prev => [...prev, ...newStudents]);
  };

  const saveAttendance = (date: string, classId: string, records: {studentId: string, status: AttendanceStatus}[]) => {
    setAttendanceRecords(prev => {
      // Remove existing records for this class on this date to overwrite
      const filtered = prev.filter(r => !(r.date === date && r.classId === classId));
      
      const newRecords = records.map(r => ({
        id: `${r.studentId}-${date}`,
        date,
        classId,
        studentId: r.studentId,
        status: r.status
      }));
      
      return [...filtered, ...newRecords];
    });
  };

  const getStudentStats = (studentId: string) => {
    const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
    const total = studentRecords.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    studentRecords.forEach(r => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
    });

    // Assume late counts as partial presence, but let's just use present + late for percentage
    const attendancePercentage = total === 0 ? 100 : Math.round(((present + late) / total) * 100);
    
    const studentInfo = students.find(s => s.id === studentId);

    // Use actual grades for current grade if assignments exist
    const studentAssignments = assignments.filter(a => a.classId === studentInfo?.classId);
    let calculatedGrade = studentInfo ? studentInfo.baseGrade : 0;

    if (studentAssignments.length > 0) {
      let totalScore = 0;
      let totalMax = 0;
      studentAssignments.forEach(a => {
        const g = grades.find(g => g.assignmentId === a.id && g.studentId === studentId);
        if (g && g.score !== null) {
          totalScore += g.score;
          totalMax += a.maxScore;
        }
      });
      if (totalMax > 0) {
        calculatedGrade = Math.round((totalScore / totalMax) * 100);
      }
    }

    // Rough mock logic: grade drops by 2 points per absence
    const currentGrade = Math.max(0, calculatedGrade - (absent * 2));

    return { present, absent, late, total, attendancePercentage, currentGrade };
  };

  return (
    <DataContext.Provider value={{ 
      classes, students, attendanceRecords, assignments, grades,
      saveAttendance, addClass, importStudents, addAssignment, saveGrade, updateStudentName, getStudentStats 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
