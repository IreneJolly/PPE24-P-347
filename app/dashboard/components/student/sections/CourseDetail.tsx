import { CourseDetailProps } from '../types';

export default function CourseDetail({
  selectedCourse,
  courseMaterials,
  courseAssignments
}: CourseDetailProps) {
  if (!selectedCourse) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{selectedCourse.title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">{selectedCourse.description}</p>
      
      {/* Tabs for course content */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Course Materials */}
        <div className="p-3 bg-white rounded shadow">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Course Materials</h4>
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
      </div>
    </div>
  );
} 