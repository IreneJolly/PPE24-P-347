import { useState } from 'react';
import { Course, Assignment, Evaluation, UserProfile } from '@/lib/types';

interface TeacherDashboardProps {
  courses: Course[];
  pendingEvaluations: Evaluation[];
  students: UserProfile[];
  onUpdateEvaluation: (evaluation: Evaluation) => void;
  onCreateAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  onCreateCourse: (course: { title: string; description: string }) => Promise<Course | null>;
  onAddCourseMaterial: (material: { courseId: number; title: string; fileUrl: string; description: string }) => Promise<void>;
}

export default function TeacherDashboard({
  courses,
  pendingEvaluations,
  students,
  onUpdateEvaluation,
  onCreateAssignment,
  onCreateCourse,
  onAddCourseMaterial,
}: TeacherDashboardProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMaterialFile(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Course Management Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
          <div className="space-x-2">
            <button
              onClick={() => setIsCreateCourseModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Course
            </button>
            <button
              onClick={() => setIsCreateAssignmentModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              disabled={courses.length === 0}
            >
              Create Assignment
            </button>
            <button
              onClick={() => setIsAddMaterialModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              disabled={courses.length === 0}
            >
              Add Material
            </button>
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
          {courses.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>You haven't created any courses yet.</p>
              <button
                onClick={() => setIsCreateCourseModalOpen(true)}
                className="mt-2 text-indigo-600 hover:text-indigo-800"
              >
                Create your first course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pending Evaluations */}
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

      {/* Create Course Modal */}
      {isCreateCourseModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newCourse = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
              };
              
              const createdCourse = await onCreateCourse(newCourse);
              if (createdCourse) {
                setSelectedCourse(createdCourse);
              }
              setIsCreateCourseModalOpen(false);
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
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(false)}
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

      {/* Add Material Modal */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Course Material</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!materialFile) return;
              
              setIsUploadingMaterial(true);
              try {
                const formData = new FormData(e.currentTarget);
                const courseId = parseInt(formData.get('courseId') as string);
                const title = formData.get('title') as string;
                const description = formData.get('description') as string;
                
                // Generate a unique file name
                const fileExt = materialFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const filePath = `course_materials/${courseId}/${fileName}`;
                
                // Simulate file URL (in a real app, you'd upload to Supabase storage)
                const fileUrl = filePath;
                
                await onAddCourseMaterial({
                  courseId,
                  title,
                  fileUrl,
                  description
                });
                
                setIsAddMaterialModalOpen(false);
              } catch (error) {
                console.error('Error uploading material:', error);
              } finally {
                setIsUploadingMaterial(false);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    name="courseId"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    defaultValue={selectedCourse?.id}
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
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
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isUploadingMaterial}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                  disabled={isUploadingMaterial || !materialFile}
                >
                  {isUploadingMaterial ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateAssignmentModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const courseId = parseInt(formData.get('courseId') as string);
              
              // Get start and end dates
              const startDate = formData.get('startDate') as string;
              const endDate = formData.get('endDate') as string;
              
              const newAssignment: Omit<Assignment, 'id'> = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as string,
                course_id: courseId,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                dueDate: new Date(endDate).toISOString(), // For backward compatibility
                max_attempts: parseInt(formData.get('maxAttempts') as string) || null
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
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Attempts (leave empty for unlimited)</label>
                  <input
                    type="number"
                    name="maxAttempts"
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    name="courseId"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    defaultValue={selectedCourse?.id}
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