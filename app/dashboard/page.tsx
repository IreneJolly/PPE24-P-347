'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserProfile, Course, Assignment, Evaluation, Competence, UserRole } from '@/lib/types'
import AdminDashboard from './components/admin/index'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDashboard from './components/StudentDashboard'
import DashboardLayout from './components/DashboardLayout'

// Initialize Supabase client ONCE outside the component
const supabase = createClient();

type DatabaseUser = {
  id: string;
  email: string;
  roles: UserRole[];
  full_name: string | null;
  created_at: string;
  is_first_login: boolean;
  status: 'active' | 'suspended';
  suspended_reason?: string;
  suspended_at?: string;
}

type DatabaseEnrollment = {
  courses: {
    id: number;
    title: string;
    progress: number;
    description?: string | null;
    teacher_id?: string | null;
  };
}

type TeacherCourseResponse = {
  courses: {
    id: number;
    title: string;
    description: string | null;
    progress: number | null;
  };
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [competence, setCompetence] = useState<Competence[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Starting user profile fetch...')
        
        // First, get the authenticated user
        const authResponse = await supabase.auth.getUser()
        console.log('Auth response:', {
          hasUser: !!authResponse.data.user,
          userId: authResponse.data.user?.id,
          error: authResponse.error
        })
        
        if (authResponse.error) {
          console.error('Auth error:', authResponse.error)
          setError(authResponse.error.message)
          return
        }

        const user = authResponse.data.user
        if (!user) {
          console.log('No authenticated user found')
          router.push('/login')
          return
        }

        // Then, fetch user profile with role
        console.log('Fetching user data from users table...')
        console.log('User ID:', user.id)
        
        // First try to get the user's own record
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, roles, full_name, created_at')
          .eq('id', user.id)
          .single()
        
        console.log('User data response:', {
          hasData: !!userData,
          roles: userData?.roles,
          error: userError ? {
            message: userError.message,
            code: userError.code,
            details: userError.details,
            hint: userError.hint
          } : null
        })

        if (userError) {
          console.error('Error fetching user data:', {
            message: userError.message,
            code: userError.code,
            details: userError.details,
            hint: userError.hint
          })
          setError(userError.message)
          return
        }

        let userProfileData: UserProfile;

        if (!userData) {
          console.error('No user data found')
          // Try to create the user record if it doesn't exist
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              id: user.id,
              email: user.email,
              roles: ['student'],
              full_name: user.user_metadata?.full_name || ''
            }])
            .select()
            .single()

          if (createError) {
            console.error('Error creating user:', createError)
            setError('Failed to create user profile')
            return
          }

          if (!newUser) {
            setError('Failed to create user profile')
            return
          }

          // Use the newly created user data
          const userRole = newUser.roles[0] || 'student'
          const [firstName, lastName] = (newUser.full_name || '').split(' ')

          userProfileData = {
            id: newUser.id,
            email: newUser.email,
            role: userRole,
            first_name: firstName || '',
            last_name: lastName || '',
            created_at: newUser.created_at,
          }
        } else {
          // Use the existing user data
          const userRole = userData.roles[0] || 'student'
          const [firstName, lastName] = (userData.full_name || '').split(' ')

          userProfileData = {
            id: userData.id,
            email: userData.email,
            role: userRole,
            first_name: firstName || '',
            last_name: lastName || '',
            created_at: userData.created_at,
          }
        }

        setUserProfile(userProfileData)

        // Fetch relevant data based on role
        if (userProfileData.role === 'admin') {
          // Fetch all users for admin
          const { data: allUsers } = await supabase
            .from('users')
            .select('*')
          
          if (allUsers) {
            setUsers(allUsers.map(u => ({
              id: u.id,
              email: u.email,
              role: u.roles[0] || 'student',
              first_name: (u.full_name || '').split(' ')[0] || '',
              last_name: (u.full_name || '').split(' ')[1] || '',
              created_at: u.created_at,
            })))
          }
        }

        if (userProfileData.role === 'teacher') {
          // Fetch courses taught by this teacher
          try {
            console.log('Fetching teacher courses...');
            
            // Using a simpler query syntax that should be more stable
            const { data: teacherCourses, error } = await supabase
              .from('course_teachers')
              .select(`
                course_id,
                courses:course_id (
                  id,
                  title,
                  description
                )
              `)
              .eq('teacher_id', user.id);
            
            if (error) {
              console.error('Error fetching teacher courses:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
              });
              throw error;
            }
            
            console.log('Teacher courses result:', teacherCourses);
            
            if (teacherCourses && teacherCourses.length > 0) {
              const courses: Course[] = teacherCourses.map(ct => {
                // Safely extract course data with type checking
                const courseData = ct.courses as unknown as { 
                  id: number; 
                  title: string; 
                  description: string | null;
                };
                
                return {
                  id: courseData.id,
                  title: courseData.title,
                  description: courseData.description || undefined,
                  progress: 0  // Default value for progress
                };
              });
              setCourses(courses);
              
              // Fetch pending evaluations for teacher's courses
              try {
                const { data: pendingEvals } = await supabase
                  .from('submissions')
                  .select('*')
                  .is('score', null)
                  .in('assignment_id', courses.map(c => c.id))
                setEvaluations(pendingEvals || [])
              } catch (evalError) {
                console.error('Error fetching pending evaluations:', evalError);
              }
            }
          } catch (error) {
            console.error('Error processing teacher courses:', error);
          }

          // Fetch students for the teacher's courses
          const { data: courseStudents } = await supabase
            .from('users')
            .select('*')
            .contains('roles', ['student'])
          
          if (courseStudents) {
            setUsers(courseStudents.map(u => ({
              id: u.id,
              email: u.email,
              role: 'student',
              first_name: (u.full_name || '').split(' ')[0] || '',
              last_name: (u.full_name || '').split(' ')[1] || '',
              created_at: u.created_at,
            })))
          }
        }

        if (userProfileData.role === 'student') {
          // Fetch courses the student is enrolled in
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('courses (id, title, progress, description)')
            .eq('student_id', user.id)
          
          if (enrollments) {
            const enrolledCourses: Course[] = (enrollments as unknown as DatabaseEnrollment[]).map(enrollment => ({
              id: enrollment.courses.id,
              title: enrollment.courses.title,
              progress: enrollment.courses.progress,
              description: enrollment.courses.description || undefined,
            }))
            setCourses(enrolledCourses)

            // Fetch assignments for enrolled courses
            const { data: courseAssignments } = await supabase
              .from('assignments')
              .select('*')
              .in('course_id', enrolledCourses.map(c => c.id))

            if (courseAssignments) {
              // Transform the assignments to match our interface
              const formattedAssignments: Assignment[] = courseAssignments.map(assignment => ({
                id: assignment.id,
                title: assignment.title,
                course_id: assignment.course_id,
                description: assignment.description,
                type: assignment.type,
                dueDate: assignment.end_date, // Use end_date as dueDate for backward compatibility
                start_date: assignment.start_date,
                end_date: assignment.end_date,
                max_attempts: assignment.max_attempts,
                status: 'pending' // Will be updated based on submissions
              }))
              setAssignments(formattedAssignments)
            } else {
              setAssignments([])
            }

            // Fetch student's submissions
            const { data: studentSubmissions } = await supabase
              .from('submissions')
              .select('*')
              .eq('student_id', user.id)
            setEvaluations(studentSubmissions || [])
            
            const { data: courseCompetence } = await supabase
              .from('competence')
              .select('*')
              .in('course_id', enrolledCourses.map(c => c.id))
            setCompetence(courseCompetence || [])
          }

          
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      }
    }

    fetchUserProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUpdateUser = async (user: UserProfile) => {
    const { error } = await supabase
      .from('users')
      .update({
        roles: [user.role],
        full_name: `${user.first_name} ${user.last_name}`.trim(),
      })
      .eq('id', user.id)

    if (!error) {
      setUsers(users.map(u => u.id === user.id ? user : u))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase // Use global client
        .from('users')
        .delete()
        .eq('id', userId);
      // ... rest of handler
    } catch (err) {
      // ... error handling
    }
  };

  const handleUpdateEvaluation = async (evaluation: Evaluation) => {
    const { error } = await supabase
      .from('submissions')
      .update({
        score: evaluation.grade,
        feedback: evaluation.feedback,
        graded_by: userProfile?.id,
      })
      .eq('id', evaluation.id)

    if (!error) {
      setEvaluations(evaluations.map(e => e.id === evaluation.id ? evaluation : e))
    }
  }

  const handleCreateCourse = async (course: { title: string; description: string }) => {
    try {
      console.log('Creating course with data:', course);
      
      // Insert the course
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert([
          {
            title: course.title,
            description: course.description,
          },
        ])
        .select()
        .single()

      if (courseError) {
        console.error('Detailed error creating course:', {
          message: courseError.message,
          code: courseError.code,
          details: courseError.details,
          hint: courseError.hint
        });
        return null;
      }

      console.log('Course created successfully:', newCourse);

      // Associate the course with the teacher
      const { error: teacherError } = await supabase
        .from('course_teachers')
        .insert([
          {
            course_id: newCourse.id,
            teacher_id: userProfile?.id,
          },
        ])

      if (teacherError) {
        console.error('Detailed error associating teacher with course:', {
          message: teacherError.message,
          code: teacherError.code,
          details: teacherError.details,
          hint: teacherError.hint
        });
        // We could delete the course here if needed
        return null;
      }

      // Add the new course to the state
      const createdCourse: Course = {
        id: newCourse.id,
        title: newCourse.title,
        description: newCourse.description || undefined,
        progress: 0,
        teacher_id: userProfile?.id,
      }
      
      setCourses([...courses, createdCourse])
      return createdCourse
    } catch (error) {
      console.error('Error in handleCreateCourse:', error)
      return null
    }
  }

  const handleAddCourseMaterial = async (material: { courseId: number; title: string; fileUrl: string; description: string }) => {
    try {
      // In a real app, you would first upload the file to Supabase Storage
      // For this example, we'll assume the fileUrl is already generated

      const { error } = await supabase
        .from('course_attachments')
        .insert([
          {
            course_id: material.courseId,
            title: material.title,
            description: material.description,
            file_url: material.fileUrl,
            uploaded_by: userProfile?.id,
          },
        ])

      if (error) {
        console.error('Error adding course material:', error)
        throw error
      }

      // Success notification could be added here
    } catch (error) {
      console.error('Error in handleAddCourseMaterial:', error)
      throw error
    }
  }

  const handleAddCompetence = async (competenceData: { courseId: number; competence: string; description: string }) => {
    try {
      // Use competenceData.competence instead of competenceData.title
      const { error } = await supabase
        .from('competence')
        .insert([{
            course_id: competenceData.courseId,
            competence: competenceData.competence, // Use the correct field name
            description: competenceData.description
          }])

      if (error) {
        console.error('Error adding competence:', error) // Changed log message
        throw error
      }
      // Success notification could be added here
    } catch (error) {
      console.error('Error in handleAddCompetence:', error) // Changed log message
      throw error
    }
  }

  const handleCreateAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    try {
      // Convert the Assignment type to match the database schema
      const dbAssignment = {
        course_id: assignment.course_id,
        title: assignment.title,
        description: assignment.description || null,
        type: assignment.type || 'assignment',
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        max_attempts: assignment.max_attempts || null,
      }
      
      const { data, error } = await supabase
        .from('assignments')
        .insert([dbAssignment])
        .select()

      if (error) {
        console.error('Error creating assignment:', error)
        return
      }

      if (data) {
        // Convert the database response to match the Assignment type
        const newAssignment: Assignment = {
          id: data[0].id,
          title: data[0].title,
          course_id: data[0].course_id,
          description: data[0].description,
          dueDate: data[0].end_date,
          status: 'pending',
        }
        
        setAssignments([...assignments, newAssignment])
      }
    } catch (error) {
      console.error('Error in handleCreateAssignment:', error)
    }
  }

  const handleSubmitAssignment = async (assignmentId: number, submission: { content: string }) => {
    if (!userProfile) return

    const { error } = await supabase
      .from('submissions')
      .insert([{
        assignment_id: assignmentId,
        student_id: userProfile.id,
        attempt_number: 1,
        content: submission.content,
      }])

    if (!error) {
      // Refresh submissions
      const { data: updatedSubmissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', userProfile.id)
      setEvaluations(updatedSubmissions || [])
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  const dashboardContent = (
    <>
      {userProfile.role === 'admin' && (
        <AdminDashboard
          users={users}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {userProfile.role === 'teacher' && (
        <TeacherDashboard
          user={userProfile}
          courses={courses}
          pendingEvaluations={evaluations}
          students={users}
          onUpdateEvaluation={handleUpdateEvaluation}
          onCreateAssignment={handleCreateAssignment}
          onCreateCourse={handleCreateCourse}
          onAddCourseMaterial={handleAddCourseMaterial}
          onAddCompetence={handleAddCompetence}
        />
      )}

      {userProfile.role === 'student' && (
        <StudentDashboard
        user={userProfile}
          courses={courses}
          assignments={assignments}
          evaluations={evaluations}
          competence={competence}
          onSubmitAssignment={handleSubmitAssignment}
        />
      )}
    </>
  )

  return (
    <DashboardLayout user={userProfile} onSignOut={handleSignOut}>
      {dashboardContent}
    </DashboardLayout>
  )
} 