'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserProfile, Course, Assignment, Evaluation } from '@/lib/types'
import AdminDashboard from './components/AdminDashboard'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDashboard from './components/StudentDashboard'
import DashboardLayout from './components/DashboardLayout'

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
  const [users, setUsers] = useState<UserProfile[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log('Fetching user profile...')
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth user:', user)
      
      if (!user) {
        console.log('No user found, redirecting to login...')
        router.push('/login')
        return
      }

      // Fetch user profile with role
      console.log('Fetching user data...')
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      console.log('User data:', { userData, error })

      if (userData) {
        // Convert roles array to single role for the frontend
        const role = userData.roles[0] || 'student' // Default to student if no role
        const [firstName, lastName] = (userData.full_name || '').split(' ')

        setUserProfile({
          id: user.id,
          email: user.email!,
          role,
          first_name: firstName || '',
          last_name: lastName || '',
          created_at: userData.created_at,
        })

        // Fetch relevant data based on role
        if (role === 'admin') {
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

        if (role === 'teacher') {
          // Fetch courses taught by this teacher
          const { data: teacherCourses } = await supabase
            .from('course_teachers')
            .select('course:courses (id, title, description, progress)')
            .eq('teacher_id', user.id)
          
          if (teacherCourses) {
            const courses: Course[] = teacherCourses.map(ct => ({
              id: (ct.course as any).id,
              title: (ct.course as any).title,
              description: (ct.course as any).description || undefined,
              progress: (ct.course as any).progress || 0
            }))
            setCourses(courses)

            if (courses.length > 0) {
              // Fetch pending evaluations for teacher's courses
              const { data: pendingEvals } = await supabase
                .from('submissions')
                .select('*')
                .is('score', null)
                .in('assignment_id', courses.map(c => c.id))
              setEvaluations(pendingEvals || [])
            }
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

        if (role === 'student') {
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
            setAssignments(courseAssignments || [])

            // Fetch student's submissions
            const { data: studentSubmissions } = await supabase
              .from('submissions')
              .select('*')
              .eq('student_id', user.id)
            setEvaluations(studentSubmissions || [])
          }
        }
      }
    }

    fetchUserProfile()
  }, [supabase, router])

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
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (!error) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

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

  const handleCreateAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()

    if (!error && data) {
      setAssignments([...assignments, data[0]])
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
          courses={courses}
          pendingEvaluations={evaluations}
          students={users}
          onUpdateEvaluation={handleUpdateEvaluation}
          onCreateAssignment={handleCreateAssignment}
        />
      )}

      {userProfile.role === 'student' && (
        <StudentDashboard
          courses={courses}
          assignments={assignments}
          evaluations={evaluations}
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