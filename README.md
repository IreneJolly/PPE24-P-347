# PPE24-P-347: Auto-Evaluation Platform

## Overview
A modern web-based auto-evaluation platform built with Next.js 14, React, and Supabase. The platform provides a user-friendly interface for students to track their course progress and upcoming assignments.

## Features
- 🔐 Secure Authentication with Supabase
- 📊 Interactive Course Progress Dashboard
- 🎠 Carousel View of Current Modules
- 📅 Upcoming Assignments Tracker
- 👤 User Profile Information
- 🎨 Modern UI with Tailwind CSS

## Project Structure
```
projet-autoevaluation/
├── app/                    # Next.js application directory
│   ├── dashboard/         # Protected dashboard route
│   │   └── page.tsx      # Main dashboard component
│   ├── login/            # Authentication routes
│   │   └── page.tsx      # Login page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page (handles redirects)
├── lib/                   # Shared utilities
│   ├── context/          # React context providers
│   └── supabase/         # Supabase client configuration
├── styles/               # Global styles
└── configuration files   # Various config files
```

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Development Tools**: 
  - ESLint
  - TypeScript
  - PostCSS
  - Autoprefixer

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn package manager
- Supabase account and project

### Environment Setup
1. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
1. Clone the repository:
```bash
git clone https://github.com/IreneJolly/PPE24-P-347.git
cd PPE24-P-347
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features in Detail

### Authentication
- Secure login system using Supabase Auth
- Protected routes with middleware
- Automatic redirects for authenticated/unauthenticated users

### Dashboard
- Welcome section with user information
- Interactive course modules carousel
- Progress tracking for each module
- Upcoming assignments list with due dates
- Responsive design for all screen sizes

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Styling
The project uses Tailwind CSS for styling with a custom configuration. Global styles are defined in `styles/globals.css`.


## License
This project is private and proprietary.

## Contact
Project Link: [https://github.com/IreneJolly/PPE24-P-347](https://github.com/IreneJolly/PPE24-P-347)

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database
- Supabase account

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup
1. Run the database schema creation script:
   ```sql
   psql -U your_username -d your_database -f database_scripts/tables.sql
   ```

2. Apply the policies for proper row-level security:
   ```sql
   psql -U your_username -d your_database -f database_scripts/policies.sql
   ```
   
### Important Database Updates
The `policies.sql` file has been updated to allow teachers to create courses. Make sure to run the updated script to enable this functionality.

The database uses Row-Level Security (RLS) policies to restrict access:
- Teachers can now create courses and associate themselves with those courses
- Teachers can only update/delete their own courses
- Admins have full access to all courses

## Features

### For Students
- Enroll in courses
- View assignments and submit work
- Track progress across courses

### For Teachers
- Create and manage courses
- Create assignments and materials
- Evaluate student submissions
- Track student progress

### For Administrators
- Manage all users (students, teachers)
- Oversee all courses
- System-wide analytics

## Technologies Used
- Next.js (React framework)
- Supabase (backend and authentication)
- PostgreSQL (database)
- Tailwind CSS (styling)

## Troubleshooting

### Database Permission Errors (403/400)

If you encounter permission errors when accessing or modifying data:

1. **Verify RLS Policies**
   Run the verification script to check if all policies are properly applied:
   ```sql
   psql -U your_username -d your_database -f database_scripts/verify_policies.sql
   ```

2. **Check User Roles**
   Make sure users have the correct roles assigned:
   ```sql
   psql -U your_username -d your_database -f database_scripts/fix_user_roles.sql
   ```
   
   To fix a specific user's role (e.g., making them a teacher):
   ```sql
   UPDATE users 
   SET roles = ARRAY['teacher']::text[]
   WHERE id = 'user-uuid-here';
   ```

3. **Common Issues:**
   - Error 403: Permission denied - RLS policies are preventing access
   - Error 400: Bad request - Check query syntax, especially when filtering by array fields

### Fixing 403 "Permission Denied for Table Courses" Error

If you're getting a 403 error specifically for the courses table:

1. **Apply the comprehensive fix script**:
   ```sql
   psql -U your_username -d your_database -f database_scripts/fix_all_policies.sql
   ```
   
   This script will:
   - Temporarily disable RLS on the problematic tables
   - Fix user roles for the teacher account
   - Drop conflicting policies
   - Create simpler, more permissive policies
   - Re-enable RLS with the proper configuration

2. **Specific table fixes**:
   If you only want to fix specific tables:
   ```sql
   psql -U your_username -d your_database -f database_scripts/fix_courses_policies.sql
   psql -U your_username -d your_database -f database_scripts/fix_course_teachers_policies.sql
   ```

3. **Emergency workaround** (for development only):
   If you're still having issues, you can temporarily disable RLS for testing:
   ```sql
   ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.course_teachers DISABLE ROW LEVEL SECURITY;
   ```
   **Important**: Remember to re-enable RLS before deploying to production:
   ```sql
   ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.course_teachers ENABLE ROW LEVEL SECURITY;
   ```

### Query Syntax for Array Fields

When querying users by role, use the `contains` operator instead of `eq` since `roles` is an array:

```javascript
// Incorrect
supabase.from('users').select('*').eq('role', 'student')

// Correct
supabase.from('users').select('*').contains('roles', ['student'])
```

### Emergency Troubleshooting for 403/400 Errors

If you're still experiencing 403 Forbidden errors with various tables like courses, course_teachers, or course_attachments, follow these steps:

1. **Run the comprehensive RLS policy fix script**:
   ```sql
   psql -U your_username -d your_database -f database_scripts/fix_all_rls_policies.sql
   ```
   
   This script will:
   - Temporarily disable RLS on all tables
   - Fix user roles for your account
   - Drop all conflicting policies
   - Create simplified, properly working policies for all tables
   - Re-enable RLS with the correct configuration

2. **For specific tables, you can run individual fix scripts**:
   ```sql
   psql -U your_username -d your_database -f database_scripts/fix_courses_policies.sql
   psql -U your_username -d your_database -f database_scripts/fix_course_teachers_policies.sql
   psql -U your_username -d your_database -f database_scripts/fix_course_attachments_policies.sql
   ```

3. **If you need a temporary emergency workaround**:
   ```sql
   psql -U your_username -d your_database -f database_scripts/emergency_fix.sql
   ```
   
   ⚠️ Remember to restore RLS after testing:
   ```sql
   psql -U your_username -d your_database -f database_scripts/restore_rls.sql
   ```
   
4. **Common Permission Error Sources**:
   - `courses` table - Needed for viewing/creating courses
   - `course_teachers` table - Used for teacher-course relationships
   - `course_attachments` table - Used for course materials
   - User role issues - Make sure your user has the correct 'teacher' role

5. **For non-existent columns issues**:
   We've fixed references to the non-existent `progress` column in the courses table by using a default value of 0.

### Last Resort: Removing All Row Level Security Policies

If you're still experiencing permission issues despite all the fixes, you can temporarily remove all Row Level Security policies from the database:

1. **Remove all RLS policies from the database**:
   ```sql
   psql -U your_username -d your_database -f database_scripts/remove_all_policies.sql
   ```
   
   This script will:
   - Disable RLS on all tables
   - Drop all existing policies
   - Grant full access to all tables for development purposes
   
   ⚠️ **WARNING**: Use this only in development environments! This completely removes all security restrictions.

2. **Test your application**:
   - With all RLS policies removed, your application should work without permission errors
   - This confirms that the issue is with the RLS policies and not something else

3. **When ready to restore security**:
   ```sql
   psql -U your_username -d your_database -f database_scripts/restore_all_policies.sql
   ```
   
   This creates a simplified set of policies that should work correctly.

4. **For course_attachments specifically**:
   We've simplified the course_attachments policies to use a single policy for teachers:
   ```sql
   CREATE POLICY "Teachers can manage their course attachments" ON public.course_attachments
       FOR ALL
       USING (
           EXISTS (
               SELECT 1 FROM public.course_teachers
               WHERE course_teachers.course_id = course_attachments.course_id
               AND course_teachers.teacher_id = auth.uid()
           )
       );
   ```
   This is simpler and more likely to work than separate policies for INSERT/UPDATE/DELETE.