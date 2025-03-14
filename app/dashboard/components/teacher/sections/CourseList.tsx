import { CourseListProps } from '../types';

export default function CourseList({ 
  courses, 
  selectedCourse, 
  setSelectedCourse, 
  onCreateCourse 
}: CourseListProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
        <div className="space-x-2">
          <button
            onClick={onCreateCourse}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Course
          </button>
          {selectedCourse ? (
            <>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                title="Use Add Assignment button in the course detail section"
              >
                Add Assignment
              </button>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                title="Use Add Material button in the course detail section"
              >
                Add Material
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                title="Please select a course first"
              >
                Add Assignment
              </button>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                title="Please select a course first"
              >
                Add Material
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
              selectedCourse?.id === course.id ? 'border-indigo-500 bg-indigo-50' : ''
            }`}
            onClick={() => setSelectedCourse(course)}
          >
            <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{course.description}</p>
          </div>
        ))}
        
        {courses.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first course.
            </p>
            <div className="mt-6">
              <button
                onClick={onCreateCourse}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg 
                  className="-ml-1 mr-2 h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                New Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 