import { CourseDetailProps } from '../types';

export default function CourseDetail({
  selectedCourse,
  courseMaterials,
  courseCompetence,
  courseAssignments,
  enrolledStudents,
  onAddAssignment,
  onAddMaterial,
  onEnrollStudents,
  onUpdateMaterial,
  onDeleteMaterial,
  onAddCompetence,
  onUpdateCompetence,
  onDeleteCompetence,
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
            onClick={onAddCompetence}
            className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Competence
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
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {new Date(material.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => onUpdateMaterial(material)} 
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit material"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDeleteMaterial(material.id)} 
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete material"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
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

        {/* Course Competence */}
        <div className="p-3 bg-white rounded shadow">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Course Materials</h4>
            <button
              onClick={onAddCompetence}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              + Add
            </button>
          </div>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {courseCompetence.length > 0 ? (
              courseCompetence.map((competence) => (
                <div key={competence.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <div className="font-medium">{competence.competence}</div>
                    <div className="text-xs text-gray-500">{competence.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {new Date(competence.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => onUpdateCompetence(competence)} 
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit material"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDeleteCompetence(competence.id)} 
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete competence"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No competencies added yet</p>
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