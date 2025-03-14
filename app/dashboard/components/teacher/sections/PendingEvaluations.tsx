import { PendingEvaluationsProps } from '../types';

export default function PendingEvaluations({ 
  pendingEvaluations, 
  students, 
  courses, 
  onUpdateEvaluation 
}: PendingEvaluationsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Evaluations</h2>
      <div className="space-y-4">
        {pendingEvaluations.length > 0 ? (
          pendingEvaluations.map((evaluation) => {
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
          })
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No pending evaluations</p>
          </div>
        )}
      </div>
    </div>
  );
} 