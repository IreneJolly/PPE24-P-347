import { useState, useEffect } from 'react';
import { Course, Assignment, Evaluation, UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface TeacherDashboardProps {
  user: UserProfile;
  courses?: Course[];
  pendingEvaluations?: Evaluation[];
  students?: UserProfile[];
  onUpdateEvaluation?: (evaluation: Evaluation) => void;
  onCreateAssignment?: (assignment: Omit<Assignment, 'id'>) => void;
  onCreateCourse?: (course: { title: string; description: string }) => Promise<Course | null>;
  onAddCourseMaterial?: (material: { courseId: number; title: string; fileUrl: string; description: string }) => Promise<void>;
}

export default function TeacherDashboard({ 
  user,
  courses: initialCourses = [],
  pendingEvaluations = [],
  students: initialStudents = [],
  onUpdateEvaluation = () => {},
  onCreateAssignment = () => {},
  onCreateCourse = async () => null,
  onAddCourseMaterial = async () => {}
}: TeacherDashboardProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>(initialStudents);
  const [enrolledStudents, setEnrolledStudents] = useState<UserProfile[]>([]);
  const [isEnrollStudentsModalOpen, setIsEnrollStudentsModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const supabase = createClient();
  
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMaterialFile(e.target.files[0]);
    }
  };

  // Fetch course materials
  async function fetchMaterials() {
    if (!selectedCourse) return;
    
    try {
      const { data, error } = await supabase
        .from('course_attachments')
        .select('*')
        .eq('course_id', selectedCourse.id);
      
      if (error) {
        throw error;
      }
      
      setMaterials(data || []);
      setCourseMaterials(data || []);
    } catch (error) {
      console.error('Error fetching course materials:', error);
    }
  }
  
  // Fetch course assignments
  async function fetchAssignments() {
    if (!selectedCourse) return;
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', selectedCourse.id);
      
      if (error) {
        throw error;
      }
      
      setAssignments(data || []);
      setCourseAssignments(data || []);
    } catch (error) {
      console.error('Error fetching course assignments:', error);
    }
  }

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials();
      fetchAssignments();
      fetchEnrolledStudents();
    } else {
      setCourseMaterials([]);
      setCourseAssignments([]);
      setEnrolledStudents([]);
    }
  }, [selectedCourse]);

  // Fetch all courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    
    // Only fetch courses if no initial courses were provided
    if (initialCourses.length === 0) {
      fetchCourses();
    }
  }, [initialCourses]);

  // Fetch all students when the component mounts
  useEffect(() => {
    async function fetchStudents() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student');

        if (error) {
          throw error;
        }

        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    }

    // Only fetch students if no initial students were provided
    if (initialStudents.length === 0) {
      fetchStudents();
    }
  }, [initialStudents]);

  async function fetchEnrolledStudents() {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          users:student_id (
            id, 
            first_name, 
            last_name, 
            email,
            role,
            created_at
          )
        `)
        .eq('course_id', selectedCourse.id);

      if (error) {
        throw error;
      }

      // Flatten the nested structure
      const students = data?.map((enrollment: any) => enrollment.users) || [];
      setEnrolledStudents(students);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  }

  async function onEnrollStudents(courseId: number, studentIds: string[]) {
    try {
      // Create an array of enrollment objects
      const enrollments = studentIds.map(studentId => ({
        course_id: courseId,
        student_id: studentId,
      }));

      // Insert the enrollments in a single batch
      const { error } = await supabase
        .from('enrollments')
        .insert(enrollments);

      if (error) {
        throw error;
      }

      // Show success notification or message here if needed
    } catch (error) {
      console.error('Error enrolling students:', error);
      throw error; // Rethrow to handle in the calling context
    }
  }

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
            {selectedCourse ? (
              <>
                <button
                  onClick={() => setIsCreateAssignmentModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Assignment
                </button>
                <button
                  onClick={() => setIsAddMaterialModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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
                  onClick={() => setIsCreateCourseModalOpen(true)}
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
              if (!materialFile || !selectedCourse) return;
              
              setIsUploadingMaterial(true);
              try {
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const description = formData.get('description') as string;
                
                // Use the selected course ID directly
                const courseId = selectedCourse.id;
                
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
                  <div className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700">
                    {selectedCourse?.title}
                    <input type="hidden" name="courseId" value={selectedCourse?.id} />
                  </div>
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
              // Use the selected course ID directly
              const courseId = selectedCourse?.id;
              
              if (!courseId) {
                console.error('No course selected');
                return;
              }
              
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
                  <div className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700">
                    {selectedCourse?.title}
                    <input type="hidden" name="courseId" value={selectedCourse?.id} />
                  </div>
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

      {/* Course Detail Section */}
      {selectedCourse && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">{selectedCourse.title}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsCreateAssignmentModalOpen(true)}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Assignment
              </button>
              <button
                onClick={() => setIsAddMaterialModalOpen(true)}
                className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Material
              </button>
              <button
                onClick={() => setIsEnrollStudentsModalOpen(true)}
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
                  onClick={() => setIsAddMaterialModalOpen(true)}
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
                  onClick={() => setIsCreateAssignmentModalOpen(true)}
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
                  onClick={() => setIsEnrollStudentsModalOpen(true)}
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
      )}

      {/* Enroll Students Modal */}
      {isEnrollStudentsModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enroll Students in {selectedCourse.title}</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Select students to enroll in this course. Students already enrolled are not shown.
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto mb-4 border rounded-md divide-y">
              {students
                .filter(student => 
                  student.role === 'student' && 
                  !enrolledStudents.some(enrolled => enrolled.id === student.id)
                )
                .map(student => (
                  <div 
                    key={student.id} 
                    className="flex items-center p-3 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => {
                        if (selectedStudents.includes(student.id)) {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        } else {
                          setSelectedStudents([...selectedStudents, student.id]);
                        }
                      }}
                    />
                    <label htmlFor={`student-${student.id}`} className="ml-3 flex-1 cursor-pointer">
                      <div className="font-medium">{student.first_name} {student.last_name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </label>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEnrollStudentsModalOpen(false);
                    setSelectedStudents([]);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isEnrolling}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (selectedStudents.length === 0) return;
                    
                    setIsEnrolling(true);
                    try {
                      await onEnrollStudents(selectedCourse.id, selectedStudents);
                      
                      // Update the enrolled students list
                      const newlyEnrolledStudents = students.filter(student => 
                        selectedStudents.includes(student.id)
                      );
                      setEnrolledStudents([...enrolledStudents, ...newlyEnrolledStudents]);
                      
                      setIsEnrollStudentsModalOpen(false);
                      setSelectedStudents([]);
                    } catch (error) {
                      console.error('Error enrolling students:', error);
                    } finally {
                      setIsEnrolling(false);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                  disabled={isEnrolling || selectedStudents.length === 0}
                >
                  {isEnrolling ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Selected Students'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 