# Storage Migration Instructions

This directory contains SQL migration scripts that set up automated Supabase storage management for teacher files in the learning platform.

## What These Migrations Do

1. **Teacher Bucket Creation**: Automatically creates a storage bucket for each teacher when they are added to the system
2. **Course Folder Handling**: Prepares for course-specific file organization  
3. **Cleanup on Delete**: Automatically removes course files when a course is deleted
4. **Security Policies**: Establishes proper row-level security (RLS) policies for storage

## How to Apply These Migrations

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of each SQL file (in numerical order) 
5. Run the query

## Manual Testing

After applying the migrations, you can test that everything is working:

1. Add a new teacher to the system
2. Verify that a bucket with the teacher's UUID is created
3. Create a course for that teacher
4. Upload a file to that course
5. Delete the course
6. Verify that the course files are removed

## Troubleshooting

- If you see permission errors, make sure your Supabase service role has the necessary permissions
- If triggers fail to create buckets, you may need to adjust the `create_teacher_bucket` function
- For any other issues, check the Postgres logs in the Supabase dashboard

## Reverting Migrations

To revert these migrations, run the following SQL:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS create_teacher_bucket_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_course_folder_trigger ON public.courses;
DROP TRIGGER IF EXISTS cleanup_course_files_trigger ON public.courses;

-- Drop functions
DROP FUNCTION IF EXISTS create_teacher_bucket();
DROP FUNCTION IF EXISTS handle_course_folder();
DROP FUNCTION IF EXISTS cleanup_course_files();

-- Remove policies (adjust names if you changed them)
DROP POLICY IF EXISTS "Teachers can view own bucket" ON storage.buckets;
DROP POLICY IF EXISTS "Teachers can insert into own bucket" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
``` 