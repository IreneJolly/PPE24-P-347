import { CourseListProps } from '../types';

// Example Icon (replace with actual icon component if available, e.g., from heroicons)
const CourseIcon = () => (
  <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const PlusIcon = () => (
    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

export default function CourseList({ 
  courses, 
  selectedCourse, 
  setSelectedCourse, 
  onCreateCourse 
}: CourseListProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
        <button
          onClick={onCreateCourse}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
        >
          <PlusIcon />
          New Course
        </button>
      </div>
      
      <div className="space-y-3 mt-4">
        {courses.length > 0 ? courses.map((course) => (
          <div
            key={course.id}
            className={`flex items-center border rounded-lg p-4 transition-colors duration-150 ease-in-out cursor-pointer hover:bg-gray-50 ${ 
              selectedCourse?.id === course.id 
              ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
              : 'border-gray-200'
            }`}
            onClick={() => setSelectedCourse(course)}
          >
            <CourseIcon />
            <div>
                <h3 className="text-md font-medium text-gray-900">{course.title}</h3>
                {course.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{course.description}</p>
                )}
            </div>
          </div>
        )) : (
          <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m-3 1.5a3.375 3.375 0 1 1 6.75 0v6a3.375 3.375 0 1 1-6.75 0v-6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 18.75h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.5a2.25 2.25 0 0 0-2.25-2.25h-1.5m-6 0v-1.5a2.25 2.25 0 0 1 2.25-2.25h1.5" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No courses yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first course.
            </p>
            <div className="mt-6">
              <button
                onClick={onCreateCourse}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon />
                Create New Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 