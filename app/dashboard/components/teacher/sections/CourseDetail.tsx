import { CourseDetailProps } from '../types';

export default function CourseDetail({
  selectedCourse,
  courseMaterials,
  courseAssignments,
  enrolledStudents,
  onAddAssignment,
  onAddMaterial,
  onEnrollStudents
}: CourseDetailProps) {
  if (!selectedCourse) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{selectedCourse.title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={onAddAssignment}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Assignment
          </button>
          <button
            onClick={onAddMaterial}
            className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Material
          </button>
          <button
            onClick={onEnrollStudents}
            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            Enroll Students
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">{selectedCourse.description}</p>
      
      {/* Tabs for course content */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Course statistics */}
        <div className="p-3 bg-white rounded shadow">
          <h4 className="text-sm font-medium text-gray-500 uppercase">Course Progress</h4>
          <div className="mt-2">
            <div className="relative pt-1">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    {selectedCourse.progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${selectedCourse.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Materials */}
        <div className="p-3 bg-white rounded shadow">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Course Materials</h4>
            <button
              onClick={onAddMaterial}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              + Add
            </button>
          </div>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {courseMaterials.length > 0 ? (
              courseMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <div className="font-medium">{material.title}</div>
                    <div className="text-xs text-gray-500">{material.description}</div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(material.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No materials added yet</p>
            )}
          </div>
        </div>
        
        {/* Course Assignments */}
        <div className="p-3 bg-white rounded shadow">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Assignments</h4>
            <button
              onClick={onAddAssignment}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              + Add
            </button>
          </div>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {courseAssignments.length > 0 ? (
              courseAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <div className="font-medium">{assignment.title}</div>
                    <div className="text-xs text-gray-500">{assignment.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">
                      Due: {new Date(assignment.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {assignment.max_attempts ? `${assignment.max_attempts} attempts` : 'Unlimited attempts'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No assignments added yet</p>
            )}
          </div>
        </div>
        
        {/* Enrolled Students */}
        <div className="p-3 bg-white rounded shadow">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Enrolled Students ({enrolledStudents.length})</h4>
            <button
              onClick={onEnrollStudents}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              + Enroll
            </button>
          </div>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-indigo-800">
                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{student.first_name} {student.last_name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No students enrolled yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 