export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'admin' | 'teacher' | 'student'
          created_at: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          teacher_id: string | null
          subject: string | null
          academic_year: string | null
          created_at: string
        }
      }
      enrollments: {
        Row: {
          id: string
          class_id: string
          student_id: string
          enrolled_at: string
        }
      }
      grades: {
        Row: {
          id: string
          enrollment_id: string
          assignment_name: string
          score: number | null
          max_score: number | null
          graded_by: string | null
          recorded_at: string
        }
      }
      lesson_plans: {
        Row: {
          id: string
          title: string
          content: string | null
          subject: string | null
          grade_level: string | null
          author_id: string | null
          is_public: boolean | null
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          subject?: string | null
          grade_level?: string | null
          author_id?: string | null
          is_public?: boolean | null
          rating?: number | null
          created_at?: string
        }
      }
    }
  }
}
