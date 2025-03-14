-- 01_storage_triggers.sql
-- Functions and triggers to automate Supabase storage management for teachers and courses

-- 1. Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "plpgsql_check";

-- 2. Create a function to create a storage bucket for a new teacher
CREATE OR REPLACE FUNCTION create_teacher_bucket()
RETURNS TRIGGER AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if the user has a teacher role
  IF NEW.roles IS NULL OR NOT 'teacher' = ANY(NEW.roles) THEN
    RETURN NEW;
  END IF;
  
  -- Create a bucket for the teacher using their UUID
  BEGIN
    -- Check if bucket already exists (to prevent errors on updates)
    SELECT EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = NEW.id
    ) INTO bucket_exists;
    
    IF NOT bucket_exists THEN
      INSERT INTO storage.buckets (id, name, public)
      VALUES (NEW.id, NEW.id, TRUE);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to create storage bucket for teacher: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a trigger to call the function when a new teacher is added
DROP TRIGGER IF EXISTS create_teacher_bucket_trigger ON auth.users;
CREATE TRIGGER create_teacher_bucket_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_teacher_bucket();

-- 4. Create a function to handle course creation (creating a folder)
CREATE OR REPLACE FUNCTION handle_course_folder()
RETURNS TRIGGER AS $$
DECLARE
  teacher_id TEXT;
BEGIN
  -- Get the teacher ID for this course
  SELECT teacher_id INTO teacher_id FROM courses WHERE id = NEW.id;
  
  -- We don't actually need to create folders in Supabase storage
  -- as folders are virtual and created when files are uploaded
  -- but we can add logging or other operations if needed
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a trigger for course creation
DROP TRIGGER IF EXISTS handle_course_folder_trigger ON public.courses;
CREATE TRIGGER handle_course_folder_trigger
AFTER INSERT ON public.courses
FOR EACH ROW EXECUTE FUNCTION handle_course_folder();

-- 6. Function to clean up course files when a course is deleted
CREATE OR REPLACE FUNCTION cleanup_course_files()
RETURNS TRIGGER AS $$
DECLARE
  teacher_id TEXT;
  course_files RECORD;
BEGIN
  -- Get the teacher ID for this course
  SELECT teacher_id INTO teacher_id FROM courses WHERE id = OLD.id;
  
  -- Delete all files in the course folder
  -- This is a bit complex as we need to query storage.objects
  -- and remove files with a path that starts with the course ID
  IF teacher_id IS NOT NULL THEN
    -- Delete from storage.objects (need appropriate permissions)
    FOR course_files IN 
      SELECT name FROM storage.objects 
      WHERE bucket_id = teacher_id AND name LIKE OLD.id || '/%'
    LOOP
      -- Delete each file
      BEGIN
        DELETE FROM storage.objects 
        WHERE bucket_id = teacher_id AND name = course_files.name;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to delete file % for course %: %', 
          course_files.name, OLD.id, SQLERRM;
      END;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a trigger for course deletion
DROP TRIGGER IF EXISTS cleanup_course_files_trigger ON public.courses;
CREATE TRIGGER cleanup_course_files_trigger
BEFORE DELETE ON public.courses
FOR EACH ROW EXECUTE FUNCTION cleanup_course_files();

-- 8. Create RLS policies for bucket access

-- Allow teachers to read their own bucket
CREATE POLICY "Teachers can view own bucket"
ON storage.buckets
FOR SELECT
USING (auth.uid()::text = name);

-- Allow teachers to insert into their own bucket
CREATE POLICY "Teachers can insert into own bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = bucket_id);

-- Allow teachers to update their own files
CREATE POLICY "Teachers can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid()::text = bucket_id);

-- Allow teachers to delete their own files
CREATE POLICY "Teachers can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid()::text = bucket_id);

-- Allow public read access to all files (or adjust as needed)
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (true); 