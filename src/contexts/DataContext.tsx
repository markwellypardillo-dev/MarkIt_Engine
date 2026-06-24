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

export interface ReadingNumeracyProfile {
  id: string;
  studentId: string;
  readingLevel: 'frustration' | 'instructional' | 'independent' | null;
  numeracyLevel: 'non-numerate' | 'emergent' | 'numerate' | null;
  remarks: string;
}

interface DataContextType {
  classes: Class[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  grades: Grade[];
  profiles: ReadingNumeracyProfile[];
  saveAttendance: (date: string, classId: string, records: {studentId: string, status: AttendanceStatus}[]) => void;
  addClass: (name: string) => string;
  importStudents: (classId: string, names: string[]) => void;
  addAssignment: (classId: string, name: string, maxScore: number) => string;
  saveGrade: (studentId: string, assignmentId: string, score: number | null) => void;
  updateStudentName: (studentId: string, newName: string) => void;
  saveProfile: (studentId: string, readingLevel: any, numeracyLevel: any, remarks: string) => void;
  getStudentStats: (studentId: string) => { 
    present: number; 
    absent: number; 
    late: number; 
    total: number; 
    attendancePercentage: number;
    currentGrade: number;
  };
}

const MOCK_CLASSES: Class[] = [];

const MOCK_STUDENTS: Student[] = [];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

const MOCK_ASSIGNMENTS: Assignment[] = [];

const MOCK_GRADES: Grade[] = [];

const INITIAL_PROFILES: ReadingNumeracyProfile[] = [];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES);
  const [profiles, setProfiles] = useState<ReadingNumeracyProfile[]>(INITIAL_PROFILES);

  const saveProfile = (studentId: string, readingLevel: any, numeracyLevel: any, remarks: string) => {
    setProfiles(prev => {
      const existing = prev.find(p => p.studentId === studentId);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, readingLevel, numeracyLevel, remarks } : p);
      }
      return [...prev, { id: `p-${Date.now()}-${Math.random()}`, studentId, readingLevel, numeracyLevel, remarks }];
    });
  };

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
      classes, students, attendanceRecords, assignments, grades, profiles,
      saveAttendance, addClass, importStudents, addAssignment, saveGrade, updateStudentName, saveProfile, getStudentStats 
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
