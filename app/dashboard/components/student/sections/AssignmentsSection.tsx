import React from 'react';
import { AssignmentsSectionProps } from '../types';

export default function AssignmentsSection({
  courses,
  assignments,
  evaluations,
  onOpenSubmitModal,
  formatAssignmentDate,
  getAssignmentStatus
}: AssignmentsSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Assignments</h2>
      <div className="space-y-4">
        {assignments.map((assignment) => {
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
                    Due: {formatAssignmentDate(assignment)}
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
                  onClick={() => onOpenSubmitModal(assignment)}
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
  );
} 