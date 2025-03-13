-- 1. Users table (extended profile)
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    roles text[] NOT NULL DEFAULT ARRAY['student'],  -- Default role is student
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, roles)
    VALUES (new.id, new.email, ARRAY['student'])
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Courses table
CREATE TABLE public.courses (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Course Teachers (many-to-many relationship between courses and teachers)
CREATE TABLE public.course_teachers (
    id serial PRIMARY KEY,
    course_id integer NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
    teacher_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (course_id, teacher_id)
);

-- 4. Enrollments (many-to-many relationship between courses and students)
CREATE TABLE public.enrollments (
    id serial PRIMARY KEY,
    course_id integer NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    enrollment_date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (course_id, student_id)
);

-- 5. Competencies (linked to a course)
CREATE TABLE public.competencies (
    id serial PRIMARY KEY,
    course_id integer NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Assignments (linked to a course)
CREATE TABLE public.assignments (
    id serial PRIMARY KEY,
    course_id integer NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    type text,  -- e.g. 'quiz', 'assignment'
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    max_attempts integer,  -- NULL means unlimited attempts
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. Assignment Competencies (many-to-many relationship between assignments and competencies)
CREATE TABLE public.assignment_competencies (
    id serial PRIMARY KEY,
    assignment_id integer NOT NULL REFERENCES public.assignments (id) ON DELETE CASCADE,
    competency_id integer NOT NULL REFERENCES public.competencies (id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (assignment_id, competency_id)
);

-- 8. Submissions (student attempts at assignments)
CREATE TABLE public.submissions (
    id serial PRIMARY KEY,
    assignment_id integer NOT NULL REFERENCES public.assignments (id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    attempt_number integer NOT NULL,
    content jsonb,  -- Can also be text or a file reference
    score numeric,
    feedback text,
    graded_by uuid REFERENCES public.users (id) ON DELETE SET NULL,  -- Set by teacher/admin after grading
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 9. Course Attachments (uploaded by teacher/admin only)
CREATE TABLE public.course_attachments (
    id serial PRIMARY KEY,
    course_id integer NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
    file_url text NOT NULL,  -- Reference to a file in Supabase Storage
    title text NOT NULL,
    description text,
    uploaded_by uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);