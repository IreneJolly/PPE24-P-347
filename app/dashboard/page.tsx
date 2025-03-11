'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const courses = [
  { id: 1, title: 'Cours 1', progress: 75 },
  { id: 2, title: 'Cours 2', progress: 50 },
  { id: 3, title: 'Cours 3', progress: 30 },
  { id: 4, title: 'Cours 4', progress: 10 },
  { id: 5, title: 'Cours 5', progress: 100 },
  { id: 6, title: 'Cours 6', progress: 90 },
  { id: 7, title: 'Cours 7', progress: 5 },
];

const upcomingAssignments = [
  { id: 1, title: 'Rendu 1', dueDate: '2025-02-15' },
  { id: 2, title: 'Rendu 2', dueDate: '2025-02-12' },
];

const sortAssignments = (assignments: { id: number; title: string; dueDate: string }[]) => {
  return assignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()
  const carouselRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 4;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }

    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const scrollLeft = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - itemsToShow);
    }
  };

  const scrollRight = () => {
    if (startIndex + itemsToShow < courses.length) {
      setStartIndex(startIndex + itemsToShow);
    }
  };

  const sortedAssignments = sortAssignments(upcomingAssignments);

  return (
    <div className="grid gap-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome to Auto-Evaluation
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        {user && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              User Information
            </h2>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Last Sign In:</span> {new Date(user.last_sign_in_at).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modules Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Modules en cours</h2>
        <div className="carousel-container relative flex items-center">
          {/* Boutons de navigation */}
          <button 
            onClick={scrollLeft} 
            disabled={startIndex === 0} 
            className="nav-button absolute left-0 z-10 bg-white shadow-md"
          >
            ◀
          </button>

          <div className="carousel-items flex space-x-4 overflow-hidden px-8" ref={carouselRef}>
            {courses.slice(startIndex, startIndex + itemsToShow).map(course => (
              <div key={course.id} className="carousel-item flex-none w-1/4 text-center p-4">
                <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold inline-block text-indigo-600">
                      Progression : {course.progress}%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div 
                      style={{ width: `${course.progress}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={scrollRight} 
            disabled={startIndex + itemsToShow >= courses.length} 
            className="nav-button absolute right-0 z-10 bg-white shadow-md"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Prochains rendus Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Prochains rendus obligatoires
        </h2>
        <div className="space-y-4">
          {sortedAssignments.map((assignment, index) => (
            <div 
              key={assignment.id} 
              className={`flex justify-between items-center ${
                index !== sortedAssignments.length - 1 ? 'border-b pb-4' : ''
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{assignment.title}</p>
                <p className="text-sm text-gray-500">Échéance : {assignment.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 