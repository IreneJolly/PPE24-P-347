----------------------------------------------------------------
-- 1. Enable Row-Level Security on all tables
----------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_attachments ENABLE ROW LEVEL SECURITY;


----------------------------------------------------------------
-- 2. Policies for the "users" table
----------------------------------------------------------------
-- Allow authenticated users to SELECT their own record
CREATE POLICY "Users can view own record" ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Allow admins to SELECT all records
CREATE POLICY "Admins can view all records" ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow teachers to SELECT student records
CREATE POLICY "Teachers can view student records" ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'teacher' = ANY(u.roles)
  ) AND 'student' = ANY(users.roles)
);

-- Allow INSERT only if the inserted record is for the current user or by an admin
CREATE POLICY "Users insert self or admin" ON public.users
FOR INSERT
WITH CHECK (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow UPDATE if the user is updating their own record or is admin
CREATE POLICY "Users update self or admin" ON public.users
FOR UPDATE
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
)
WITH CHECK (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

----------------------------------------------------------------
-- 3. Policies for the "courses" table
----------------------------------------------------------------
-- Allow all authenticated users to SELECT courses.
CREATE POLICY "Courses select all" ON public.courses
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only an admin can INSERT courses.
CREATE POLICY "Courses insert admin only" ON public.courses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Only an admin can UPDATE courses.
CREATE POLICY "Courses update admin only" ON public.courses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Only an admin can DELETE courses.
CREATE POLICY "Courses delete admin only" ON public.courses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

----------------------------------------------------------------
-- 4. Policies for the "course_teachers" table
----------------------------------------------------------------
-- Allow all authenticated users to SELECT course-teacher assignments.
CREATE POLICY "CourseTeachers select all" ON public.course_teachers
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only an admin can INSERT a teacher into a course.
CREATE POLICY "CourseTeachers insert admin only" ON public.course_teachers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Only an admin can UPDATE course-teacher assignments.
CREATE POLICY "CourseTeachers update admin only" ON public.course_teachers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Only an admin can DELETE course-teacher assignments.
CREATE POLICY "CourseTeachers delete admin only" ON public.course_teachers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

----------------------------------------------------------------
-- 5. Policies for the "enrollments" table
----------------------------------------------------------------
-- Allow a student to SELECT only their own enrollments (or admin to view all).
CREATE POLICY "Enrollments select own or admin" ON public.enrollments
FOR SELECT
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a student to INSERT an enrollment for themselves (or admin).
CREATE POLICY "Enrollments insert self or admin" ON public.enrollments
FOR INSERT
WITH CHECK (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Optionally, only an admin can UPDATE enrollments.
CREATE POLICY "Enrollments update admin only" ON public.enrollments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a student to DELETE their own enrollment (if needed) or allow admin.
CREATE POLICY "Enrollments delete own or admin" ON public.enrollments
FOR DELETE
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

----------------------------------------------------------------
-- 6. Policies for the "competencies" table
----------------------------------------------------------------
-- Allow all authenticated users to SELECT competencies.
CREATE POLICY "Competencies select all" ON public.competencies
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow teachers or admins to INSERT competencies.
CREATE POLICY "Competencies insert teacher/admin" ON public.competencies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND ('teacher' = ANY(u.roles) OR 'admin' = ANY(u.roles))
  )
);

-- Allow teachers or admins to UPDATE competencies.
CREATE POLICY "Competencies update teacher/admin" ON public.competencies
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND ('teacher' = ANY(u.roles) OR 'admin' = ANY(u.roles))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND ('teacher' = ANY(u.roles) OR 'admin' = ANY(u.roles))
  )
);

-- Allow teachers or admins to DELETE competencies.
CREATE POLICY "Competencies delete teacher/admin" ON public.competencies
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND ('teacher' = ANY(u.roles) OR 'admin' = ANY(u.roles))
  )
);

----------------------------------------------------------------
-- 7. Policies for the "assignments" table
----------------------------------------------------------------
-- Allow all authenticated users to SELECT assignments.
CREATE POLICY "Assignments select all" ON public.assignments
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow a teacher (assigned to the course) or an admin to INSERT an assignment.
CREATE POLICY "Assignments insert teacher/course-admin" ON public.assignments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    WHERE u.id = auth.uid() AND ct.course_id = course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a teacher (assigned to the course) or an admin to UPDATE an assignment.
CREATE POLICY "Assignments update teacher/course-admin" ON public.assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    WHERE u.id = auth.uid() AND ct.course_id = assignments.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    WHERE u.id = auth.uid() AND ct.course_id = assignments.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a teacher (assigned to the course) or an admin to DELETE an assignment.
CREATE POLICY "Assignments delete teacher/course-admin" ON public.assignments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    WHERE u.id = auth.uid() AND ct.course_id = assignments.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

----------------------------------------------------------------
-- 8. Policies for the "assignment_competencies" table
----------------------------------------------------------------
-- Allow all authenticated users to SELECT assignment-competency links.
CREATE POLICY "AssignmentCompetencies select all" ON public.assignment_competencies
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow a teacher (assigned to the course) or an admin to INSERT an assignment_competency link.
CREATE POLICY "AssignmentCompetencies insert teacher/course-admin" ON public.assignment_competencies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    JOIN public.assignments a ON a.id = assignment_id
    WHERE u.id = auth.uid() AND ct.course_id = a.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a teacher (assigned to the course) or an admin to UPDATE assignment_competencies.
CREATE POLICY "AssignmentCompetencies update teacher/course-admin" ON public.assignment_competencies
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    JOIN public.assignments a ON a.id = assignment_competencies.assignment_id
    WHERE u.id = auth.uid() AND ct.course_id = a.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    JOIN public.assignments a ON a.id = assignment_competencies.assignment_id
    WHERE u.id = auth.uid() AND ct.course_id = a.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a teacher (assigned to the course) or an admin to DELETE an assignment_competency link.
CREATE POLICY "AssignmentCompetencies delete teacher/course-admin" ON public.assignment_competencies
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    JOIN public.assignments a ON a.id = assignment_competencies.assignment_id
    WHERE u.id = auth.uid() AND ct.course_id = a.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

----------------------------------------------------------------
-- 9. Policies for the "submissions" table
----------------------------------------------------------------
-- Allow a student to SELECT only their own submissions, or a teacher/admin to view submissions for courses they teach.
CREATE POLICY "Submissions select own, teacher, or admin" ON public.submissions
FOR SELECT
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 
    FROM public.users u
    JOIN public.course_teachers ct ON ct.teacher_id = u.id
    JOIN public.assignments a ON a.id = submissions.assignment_id
    WHERE u.id = auth.uid() AND ct.course_id = a.course_id
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a student to INSERT their own submission.
CREATE POLICY "Submissions insert own" ON public.submissions
FOR INSERT
WITH CHECK (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow UPDATE of submissions if:
--   • The student is updating their own submission and it hasn't been graded (score is NULL), or
--   • A teacher (assigned to the course) or an admin is updating the submission.
CREATE POLICY "Submissions update own if not graded or teacher/admin" ON public.submissions
FOR UPDATE
USING (
    (student_id = auth.uid() AND score IS NULL)
    OR EXISTS (
      SELECT 1 
      FROM public.users u
      JOIN public.course_teachers ct ON ct.teacher_id = u.id
      JOIN public.assignments a ON a.id = submissions.assignment_id
      WHERE u.id = auth.uid() AND ct.course_id = a.course_id
    )
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
    )
)
WITH CHECK (
    (student_id = auth.uid() AND score IS NULL)
    OR EXISTS (
      SELECT 1 
      FROM public.users u
      JOIN public.course_teachers ct ON ct.teacher_id = u.id
      JOIN public.assignments a ON a.id = submissions.assignment_id
      WHERE u.id = auth.uid() AND ct.course_id = a.course_id
    )
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
    )
);

-- Allow a student to DELETE their own submission if not yet graded, or allow admin to DELETE.
CREATE POLICY "Submissions delete own if not graded or admin" ON public.submissions
FOR DELETE
USING (
  (student_id = auth.uid() AND score IS NULL)
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

----------------------------------------------------------------
-- 10. Policies for the "course_attachments" table
----------------------------------------------------------------
-- Allow all authenticated users to SELECT attachments.
CREATE POLICY "Attachments select all" ON public.course_attachments
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow only a teacher (if they are the uploader) or an admin to INSERT an attachment.
CREATE POLICY "Attachments insert teacher (uploader) or admin" ON public.course_attachments
FOR INSERT
WITH CHECK (
  (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND 'teacher' = ANY(u.roles)
    ) AND uploaded_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow only an admin to UPDATE attachments.
CREATE POLICY "Attachments update admin only" ON public.course_attachments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);

-- Allow a teacher to DELETE an attachment if they are the uploader, or allow an admin.
CREATE POLICY "Attachments delete uploader or admin" ON public.course_attachments
FOR DELETE
USING (
  (uploaded_by = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND 'admin' = ANY(u.roles)
  )
);