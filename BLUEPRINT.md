# MarkIt Engine - Expansion Blueprint (ECRS Updates)

This document outlines the software architectural roadmap, UI/UX changes, AI integration strategy, and development logic to incorporate advanced ECRS requirements into the MarkIt Engine platform.

---

## 1. Database Schema & DAO Structure

The current database structure will be expanded to encompass rigorous learner profiling, granular performance tracking, and standardized form generation. We recommend a document-based NoSQL configuration (like Firestore/Supabase JSONB) or a heavily relational SQL (PostgreSQL via Supabase) where profiles and records branch off the core `Student` entity.

### Schemas

**1. Learners (Students) Profile Expansion**
*   `Student` (Entity)
    *   `id`: UUID (Primary Key)
    *   `lrn`: String (Learner Reference Number)
    *   `firstName`, `lastName`, `dob`, `gender`
    *   `classId`: foreign_key -> Classes
*   `LearnerProfile` (Entity - 1:1 with Student)
    *   `studentId`: foreign_key (Primary Key)
    *   `numeracyLevel`: Enum (`Non-Numerate`, `Instructional`, `Independent`)
    *   `readingLevel`: Enum (`Frustration`, `Instructional`, `Independent`)
    *   `readingSpeedWPM`: Integer
    *   `comprehensionScore`: Integer
    *   `bmi`: Float
    *   `height`: Float
    *   `weight`: Float
    *   `nutritionalStatus`: Enum (`Severely Wasted`, `Wasted`, `Normal`, `Overweight`, `Obese`)
*   `QuarterlyGrades` (Entity)
    *   `id`: UUID
    *   `studentId`: foreign_key
    *   `subject`: String
    *   `quarter`: Integer (1-4)
    *   `score`: Float
*   `Assessments` (Entity) & `ItemAnalysis` (Entity)
    *   Store individual test meta-data (total items) and student's correct/incorrect counts to fuel Mean & MPS generation.

### DAO Structure (Data Access Objects)
To cleanly separate the database integrations from the UI logic using modern TS/Java structural concepts:

```typescript
// Core DAOs for the Application Interface
export interface LearnerDao {
  enrollLearner(student: Student, profile: LearnerProfile): Promise<void>;
  updateLearner(studentId: string, updates: Partial<Student>): Promise<void>;
  getLearnerWithProfile(studentId: string): Promise<Student & LearnerProfile>;
}

export interface AdvancedProfileDao {
  updateReadingProfile(studentId: string, readingData: any): Promise<void>;
  updateNumeracyProfile(studentId: string, numeracyData: any): Promise<void>;
  updateNutritionalSF8(studentId: string, sf8Data: any): Promise<void>;
}

export interface AnalyticsDao {
  getQuarterlyGrades(classId: string, quarter: number): Promise<QuarterlyGrades[]>;
  calculateMPS(assessmentId: string): Promise<number>;
  getClassRanking(classId: string, quarter: number): Promise<ClassRank[]>;
}
```

---

## 2. UI/UX Flow (Glassmorphic Design Principles)

Expanding a system with substantial data-entry requirements (SF2, SF8, SF9, Profiling) risks overwhelming the end-user. 

**The Glassmorphic Aesthetic:**
We are implementing a frosted-glass UI (`backdrop-blur`) over a dynamic, light, or fluid background. This helps organize the app spatially by prioritizing depth (z-index) over harsh borders or rigid grid lines. 

**Structural Menu Map (Sidebar)**

*   **Workspace Layer (Primary View)**
    *   **Overview/Dashboard**: High-level statistical views (At-Risk metrics, MPS averages).
    *   **Learner Management**: Tabbed navigation inside for `Enroll` vs `Update`.
    *   **Gradebook & SF9**: Traditional tabular spreadsheet UI, with an "Export to SF9" contextual button.
    *   **Attendance & SF2**: Interactive seating chart / list view with direct SF2 rendering modes.
    *   **Advanced Profiles**: Grid-layout cards dividing students by Numeracy, Reading, and Nutritional health.

**UX Trick:** Instead of exposing individual forms, we use a single `Student View Context` sidebar—clicking any student opens a sliding panel to adjust their specific components, keeping the context tied closely to the user's focus without page-refreshing.

---

## 3. Gemini AI Integration (Generative Insights)

The current text/email generation system using Gemini will be upgraded to act as an automated diagnostic tool for the new profile forms.

1.  **AI Profile Assessment**: The system will serialize a student's `Numeracy`, `Reading`, and `Quarterly Grade` object into JSON.
2.  **Contextual Prompts**:
    *   *"Teacher, here is the JSON data. Learner's Reading Level is Frustration, Speed is 45 WPM, but their Math grades are high. Suggest a 3-week tactical intervention strategy with parent communication templates."*
3.  **Output Channels**:
    *   **Automated "Risk" Tagging**: Gemini identifies contradictory or dangerous trends (e.g., Nutritional status dipping alongside grades).
    *   **Intervention Generator**: Generates custom PDF lesson worksheets explicitly targeted to elevate a student from `Instructional` to `Independent` reading levels based on their specific weaknesses.

---

## 4. Implementation Logic

### Calculating Mean and MPS (Mean Percentage Score)
A crucial standard for educational analytics.

```typescript
// Pseudo-code for calculating MPS of a specific Assessment
function generateMPSReport(assessmentScores: number[], totalItemsOfTest: number) {
    if (assessmentScores.length === 0) return { mean: 0, mps: 0 };
    
    // 1. Calculate Mean (Average Score)
    const totalScoreSum = assessmentScores.reduce((acc, score) => acc + score, 0);
    const meanScore = totalScoreSum / assessmentScores.length;
    
    // 2. Calculate MPS (Mean Percentage Score)
    const mps = (meanScore / totalItemsOfTest) * 100;
    
    return {
        mean: parseFloat(meanScore.toFixed(2)),
        mps: parseFloat(mps.toFixed(2)) + '%'
    };
}
```

### Class Ranking Logic
Needs to handle standard hierarchical ranking and tied grades smoothly.

```typescript
// Pseudo-code for calculating Quarterly Class Ranking
function calculateQuarterlyClassRanking(studentGrades: {studentId: string, average: number}[]) {
    // Sort descending by average
    const sortedGrades = [...studentGrades].sort((a, b) => b.average - a.average);
    
    let currentRank = 1;
    let actualRank = 1;
    
    const rankedStudents = sortedGrades.map((student, index, array) => {
        // Handle ties
        if (index > 0 && student.average < array[index - 1].average) {
            currentRank = actualRank;
        }
        actualRank++;
        
        return {
            ...student,
            rank: currentRank
        };
    });
    
    return rankedStudents;
}
```
