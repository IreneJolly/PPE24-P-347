import { useState } from 'react';
import { Course, Assignment, Evaluation } from '@/lib/types';

interface StudentDashboardProps {
  courses: Course[];
  assignments: Assignment[];
  evaluations: Evaluation[];
  onSubmitAssignment: (assignmentId: number, submission: { content: string }) => void;
}

export default function StudentDashboard({
  courses,
  assignments,
  evaluations,
  onSubmitAssignment,
}: StudentDashboardProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const getAssignmentStatus = (assignment: Assignment) => {
    const evaluation = evaluations.find(e => e.course_id === assignment.course_id);
    if (!evaluation) return 'pending';
    if (evaluation.grade) return 'graded';
    if (evaluation.submitted_at) return 'submitted';
    return 'pending';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Progress Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Progress</h2>
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium text-gray-900">{course.title}</h3>
                <span className="text-sm text-gray-500">{course.progress}%</span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${course.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">
                  {course.description || 'No description available'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Assignments</h2>
        <div className="space-y-4">
          {sortedAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const course = courses.find(c => c.id === assignment.course_id);
            const evaluation = evaluations.find(e => e.course_id === assignment.course_id);

            return (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{assignment.title}</h3>
                    <p className="text-xs text-gray-500">{course?.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      status === 'graded'
                        ? 'bg-green-100 text-green-800'
                        : status === 'submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                {status === 'graded' && evaluation && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium text-gray-900">Grade: {evaluation.grade}%</div>
                    {evaluation.feedback && (
                      <div className="mt-1 text-gray-500">{evaluation.feedback}</div>
                    )}
                  </div>
                )}
                {status === 'pending' && (
                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Assignment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Submit Assignment: {selectedAssignment.title}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onSubmitAssignment(selectedAssignment.id, {
                  content: formData.get('content') as string,
                });
                setSelectedAssignment(null);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Submission Content
                  </label>
                  <textarea
                    name="content"
                    rows={6}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your submission here..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 