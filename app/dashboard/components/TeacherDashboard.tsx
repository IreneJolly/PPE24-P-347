import { useState } from 'react';
import { Course, Assignment, Evaluation, UserProfile } from '@/lib/types';

interface TeacherDashboardProps {
  courses: Course[];
  pendingEvaluations: Evaluation[];
  students: UserProfile[];
  onUpdateEvaluation: (evaluation: Evaluation) => void;
  onCreateAssignment: (assignment: Omit<Assignment, 'id'>) => void;
}

export default function TeacherDashboard({
  courses,
  pendingEvaluations,
  students,
  onUpdateEvaluation,
  onCreateAssignment,
}: TeacherDashboardProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Courses Management */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
          <button
            onClick={() => setIsCreateAssignmentModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Assignment
          </button>
        </div>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{course.description}</p>
              <div className="mt-2">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div
                      style={{ width: `${course.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Evaluations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Evaluations</h2>
        <div className="space-y-4">
          {pendingEvaluations.map((evaluation) => {
            const student = students.find(s => s.id === evaluation.student_id);
            const course = courses.find(c => c.id === evaluation.course_id);

            return (
              <div key={evaluation.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {student?.first_name} {student?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{course?.title}</p>
                  </div>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex space-x-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Grade"
                      className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      onChange={(e) => {
                        const grade = parseInt(e.target.value);
                        if (!isNaN(grade)) {
                          onUpdateEvaluation({
                            ...evaluation,
                            grade,
                            evaluated_at: new Date().toISOString(),
                          });
                        }
                      }}
                    />
                    <textarea
                      placeholder="Feedback"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      onChange={(e) => {
                        onUpdateEvaluation({
                          ...evaluation,
                          feedback: e.target.value,
                          evaluated_at: new Date().toISOString(),
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {isCreateAssignmentModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newAssignment = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                dueDate: formData.get('dueDate') as string,
                course_id: parseInt(formData.get('courseId') as string),
                status: 'pending' as const,
              };
              onCreateAssignment(newAssignment);
              setIsCreateAssignmentModalOpen(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    name="courseId"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateAssignmentModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 