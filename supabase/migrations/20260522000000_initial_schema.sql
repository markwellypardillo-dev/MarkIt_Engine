-- Institutional Growth Engine Schema & RLS Setup

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- USERS Table (extending auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'student'::user_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CLASSES Table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    subject TEXT,
    academic_year varchar(9),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENROLLMENTS Table
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, student_id)
);

-- GRADES Table
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    assignment_name TEXT NOT NULL,
    score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
    max_score DECIMAL(5,2) DEFAULT 100,
    graded_by UUID REFERENCES public.users(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- LESSON PLANS & RESOURCES Table
CREATE TABLE public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    subject TEXT,
    grade_level TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Users can read their own profile, admins can read all, teachers can read students
CREATE POLICY "Users can view own profile." ON public.users FOR SELECT USING (auth.uid() = id);

-- Classes: Teachers see their own, admins see all, students see their enrolled classes
CREATE POLICY "Teachers view their classes" ON public.classes FOR SELECT
USING (teacher_id = auth.uid() OR auth.uid() IN (SELECT student_id FROM public.enrollments WHERE class_id = public.classes.id));

-- Lesson Plans: Authors can manage their own, everyone can view public ones
CREATE POLICY "Public lesson plans are viewable by all" ON public.lesson_plans FOR SELECT USING (is_public = true);
CREATE POLICY "Authors manage own lesson plans" ON public.lesson_plans FOR ALL USING (author_id = auth.uid());

-- Function for predicting "At-Risk" students (basic logic based on moving average grades)
CREATE OR REPLACE FUNCTION get_at_risk_students()
RETURNS TABLE (student_id UUID, average_score DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT e.student_id, AVG(g.score) as average_score
    FROM public.enrollments e
    JOIN public.grades g ON e.id = g.enrollment_id
    GROUP BY e.student_id
    HAVING AVG(g.score) < 65.0; -- Threshold for "At-Risk"
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
