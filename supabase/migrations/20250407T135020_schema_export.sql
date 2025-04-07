-- Drop existing tables (in correct dependency order)
DROP TABLE IF EXISTS "assignment_competencies" CASCADE;
DROP TABLE IF EXISTS "submissions" CASCADE;
DROP TABLE IF EXISTS "assignments" CASCADE;
DROP TABLE IF EXISTS "competencies" CASCADE;
DROP TABLE IF EXISTS "course_attachments" CASCADE;
DROP TABLE IF EXISTS "course_teachers" CASCADE;
DROP TABLE IF EXISTS "enrollments" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Table: assignment_competencies
CREATE TABLE IF NOT EXISTS assignment_competencies (\n  id int4 NOT NULL DEFAULT nextval('assignment_competencies_id_seq'::regclass),
  assignment_id int4 NOT NULL,
  competency_id int4 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (assignment_id, competency_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE,
  PRIMARY KEY (id)\n);

-- Table: assignments
CREATE TABLE IF NOT EXISTS assignments (\n  id int4 NOT NULL DEFAULT nextval('assignments_id_seq'::regclass),
  course_id int4 NOT NULL,
  title text NOT NULL,
  description text,
  type text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  max_attempts int4,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (id)\n);

-- Table: competencies
CREATE TABLE IF NOT EXISTS competencies (\n  id int4 NOT NULL DEFAULT nextval('competencies_id_seq'::regclass),
  course_id int4 NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (id)\n);

-- Table: course_attachments
CREATE TABLE IF NOT EXISTS course_attachments (\n  id int4 NOT NULL DEFAULT nextval('course_attachments_id_seq'::regclass),
  course_id int4 NOT NULL,
  file_url text NOT NULL,
  title text NOT NULL,
  description text,
  uploaded_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE\n);

-- Table: course_teachers
CREATE TABLE IF NOT EXISTS course_teachers (\n  id int4 NOT NULL DEFAULT nextval('course_teachers_id_seq'::regclass),
  course_id int4 NOT NULL,
  teacher_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (course_id, teacher_id),
  PRIMARY KEY (id),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE\n);

-- Table: courses
CREATE TABLE IF NOT EXISTS courses (\n  id int4 NOT NULL DEFAULT nextval('courses_id_seq'::regclass),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  progress int2 NOT NULL DEFAULT '0'::smallint,
  PRIMARY KEY (id)\n);

-- Table: enrollments
CREATE TABLE IF NOT EXISTS enrollments (\n  id int4 NOT NULL DEFAULT nextval('enrollments_id_seq'::regclass),
  course_id int4 NOT NULL,
  student_id uuid NOT NULL,
  enrollment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (course_id, student_id),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE\n);

-- Table: submissions
CREATE TABLE IF NOT EXISTS submissions (\n  id int4 NOT NULL DEFAULT nextval('submissions_id_seq'::regclass),
  assignment_id int4 NOT NULL,
  student_id uuid NOT NULL,
  attempt_number int4 NOT NULL,
  content jsonb,
  score numeric,
  feedback text,
  graded_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE\n);

-- Table: users
CREATE TABLE IF NOT EXISTS users (\n  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  roles _text NOT NULL DEFAULT ARRAY['student'::text],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_first_login bool DEFAULT true,
  UNIQUE (email),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (id)\n);

