import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TeacherDashboardProps } from './types';

// Import sections
import CourseList from './sections/CourseList';
import PendingEvaluations from './sections/PendingEvaluations';
import CourseDetail from './sections/CourseDetail';

// Import modals
import CreateCourseModal from './modals/CreateCourseModal';
import AddMaterialModal from './modals/AddMaterialModal';
import CreateAssignmentModal from './modals/CreateAssignmentModal';
import EnrollStudentsModal from './modals/EnrollStudentsModal';
import UpdateMaterialModal from './modals/UpdateMaterialModal';

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
  // State for data
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<null | any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState(initialStudents);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);
  
  // State for modals
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
  const [isEnrollStudentsModalOpen, setIsEnrollStudentsModalOpen] = useState(false);
  const [isUpdateMaterialModalOpen, setIsUpdateMaterialModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const supabase = createClient();

  // Fetch course materials when selected course changes
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
  
  // Fetch course assignments when selected course changes
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

  // Fetch enrolled students
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
            roles,
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

  // Fetch data when selected course changes
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

  // Fetch all courses if not provided
  useEffect(() => {
    async function fetchCourses() {
      try {
        console.log('Fetching courses for teacher...');
        
        // First try to get courses that this teacher is associated with
        const { data: teacherCourses, error: teacherCoursesError } = await supabase
          .from('course_teachers')
          .select(`
            course_id,
            courses:course_id (
              id,
              title,
              description
            )
          `)
          .eq('teacher_id', user?.id);
        
        if (teacherCoursesError) {
          console.error('Error fetching teacher courses:', teacherCoursesError);
          
          // Fallback to direct courses query
          const { data, error } = await supabase
            .from('courses')
            .select('*');
          
          if (error) {
            console.error('Detailed error fetching courses:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            });
            throw error;
          }
          
          console.log('Courses fetched successfully:', data?.length || 0);
          setCourses(data || []);
        } else {
          console.log('Teacher courses fetched successfully:', teacherCourses?.length || 0);
          
          if (teacherCourses && teacherCourses.length > 0) {
            const formattedCourses = teacherCourses
              .filter(tc => tc.courses) // Filter out any null entries
              .map(tc => {
                // Safely extract course data with type checking
                const courseData = tc.courses as unknown as { 
                  id: number; 
                  title: string; 
                  description: string | null;
                };
                
                return {
                  id: courseData.id,
                  title: courseData.title,
                  description: courseData.description || ''
                };
              });
            
            setCourses(formattedCourses);
          } else {
            setCourses([]);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    
    // Only fetch courses if no initial courses were provided
    if (initialCourses.length === 0) {
      fetchCourses();
    }
  }, [initialCourses, user]);

  // Fetch all students if not provided
  useEffect(() => {
    async function fetchStudents() {
      try {
        // Fetch users where the 'roles' array contains 'student'
        const { data, error } = await supabase
          .from('users')
          .select('*')
          // Use contains filter for the roles array
          .contains('roles', ['student']); 

        if (error) {
          console.error('Supabase error fetching students:', error);
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} students`);
        setStudents(data || []);
      } catch (error) {
        // Log the error but don't necessarily crash the component
        console.error('Error in fetchStudents logic:', error);
        setStudents([]); // Reset students on error
      }
    }

    // Only fetch students if no initial students were provided
    // Or maybe fetch always if the list might change?
    // For now, sticking to initial check.
    if (initialStudents.length === 0) {
      fetchStudents();
    }
  }, [initialStudents, supabase]); // Added supabase dependency

  // Enroll students in a course
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

      // Refresh enrolled students after enrollment
      fetchEnrolledStudents();
    } catch (error) {
      console.error('Error enrolling students:', error);
      throw error;
    }
  }

  // Handle creating a course
  const handleCreateCourse = async (courseData: { title: string; description: string }) => {
    const newCourse = await onCreateCourse(courseData);
    if (newCourse) {
      setCourses([...courses, newCourse]);
      setSelectedCourse(newCourse);
    }
    return newCourse;
  };

  // Handle adding material to a course
  const handleAddMaterial = async (material: { courseId: number; title: string; fileUrl: string; description: string; file: File }) => {
    try {
      // Upload file to Supabase Storage
      const { courseId, title, description, file } = material;
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Use teacher UUID as bucket name and course ID as folder
      const bucketName = user.id;
      const filePath = `${courseId}/${fileName}`;
      
      console.log(`Uploading new file to ${bucketName}/${filePath}`);
      
      // Upload the file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      // Save the material info to the database
      await onAddCourseMaterial({
        courseId,
        title,
        fileUrl: publicUrl,
        description
      });
      
      // Refresh the materials list
      fetchMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Failed to upload file. Please try again or contact support.');
    }
  };

  // Handle updating a material
  const handleUpdateMaterial = async (material: any) => {
    setSelectedMaterial(material);
    setIsUpdateMaterialModalOpen(true);
  };
  
  // Handle updating an existing material
  const updateMaterial = async (updatedMaterial: any) => {
    try {
      // If there's a new file, upload it and update the URL
      if (updatedMaterial.file) {
        // Delete old file if it exists
        if (updatedMaterial.file_url) {
          // Extract the path from the URL
          let oldFilePath = '';
          let courseId = updatedMaterial.course_id;
          
          // Parse the URL to get the file path
          if (updatedMaterial.file_url.includes('/object/')) {
            // Example: https://xxx.supabase.co/storage/v1/object/public/teacher-uuid/course-id/filename.ext
            const pathParts = updatedMaterial.file_url.split('/');
            // Find the bucket name in the URL
            const bucketIndex = pathParts.findIndex((part: string) => part === user.id);
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              // Reconstruct the path after the bucket name
              oldFilePath = pathParts.slice(bucketIndex + 1).join('/');
            }
          }
          
          if (oldFilePath) {
            console.log('Deleting old file:', oldFilePath);
            const { error: deleteError } = await supabase.storage
              .from(user.id)
              .remove([oldFilePath]);
              
            if (deleteError) {
              console.error('Error deleting old file:', deleteError);
              // Continue anyway to upload the new file
            }
          }
        }
        
        // Upload new file
        const fileExt = updatedMaterial.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${updatedMaterial.course_id}/${fileName}`;
        
        console.log(`Uploading new file to ${user.id}/${filePath}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(user.id)
          .upload(filePath, updatedMaterial.file);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from(user.id)
          .getPublicUrl(filePath);
        
        updatedMaterial.fileUrl = publicUrl;
      }
      
      // Update the material in the database
      const { error } = await supabase
        .from('course_attachments')
        .update({
          title: updatedMaterial.title,
          description: updatedMaterial.description,
          file_url: updatedMaterial.fileUrl || updatedMaterial.file_url,
        })
        .eq('id', updatedMaterial.id);
      
      if (error) {
        throw error;
      }
      
      // Refresh materials
      fetchMaterials();
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Failed to update material. Please try again or contact support.');
    }
  };
  
  // Handle deleting a material
  const handleDeleteMaterial = async (materialId: number) => {
    try {
      // First get the material to find the file URL
      const { data: material, error: fetchError } = await supabase
        .from('course_attachments')
        .select('*')
        .eq('id', materialId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Delete the file from storage if it exists
      if (material && material.file_url) {
        // Extract the path from the URL
        let filePath = '';
        
        // Parse the URL to get the file path
        if (material.file_url.includes('/object/')) {
          // Example: https://xxx.supabase.co/storage/v1/object/public/teacher-uuid/course-id/filename.ext
          const pathParts = material.file_url.split('/');
          // Find the bucket name in the URL
          const bucketIndex = pathParts.findIndex((part: string) => part === user.id);
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            // Reconstruct the path after the bucket name
            filePath = pathParts.slice(bucketIndex + 1).join('/');
          }
        }
        
        if (filePath) {
          console.log(`Deleting file: ${user.id}/${filePath}`);
          const { error: deleteError } = await supabase.storage
            .from(user.id)
            .remove([filePath]);
            
          if (deleteError) {
            console.error('Error deleting file:', deleteError);
            // Continue anyway to delete the database entry
          }
        }
      }
      
      // Delete the material from the database
      const { error } = await supabase
        .from('course_attachments')
        .delete()
        .eq('id', materialId);
      
      if (error) {
        throw error;
      }
      
      // Refresh materials
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material. Please try again or contact support.');
    }
  };

  // Handle creating an assignment
  const handleCreateAssignment = (assignmentData: any) => {
    onCreateAssignment(assignmentData);
    fetchAssignments();
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Course List Section */}
      <CourseList 
        courses={courses}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        onCreateCourse={() => setIsCreateCourseModalOpen(true)}
      />

      {/* Pending Evaluations Section */}
      <PendingEvaluations 
        pendingEvaluations={pendingEvaluations}
        students={students}
        courses={courses}
        onUpdateEvaluation={onUpdateEvaluation}
      />

      {/* Course Detail Section (visible when a course is selected) */}
      {selectedCourse && (
        <CourseDetail 
          selectedCourse={selectedCourse}
          courseMaterials={courseMaterials}
          courseAssignments={courseAssignments}
          enrolledStudents={enrolledStudents}
          onAddAssignment={() => setIsCreateAssignmentModalOpen(true)}
          onAddMaterial={() => setIsAddMaterialModalOpen(true)}
          onEnrollStudents={() => setIsEnrollStudentsModalOpen(true)}
          onUpdateMaterial={handleUpdateMaterial}
          onDeleteMaterial={handleDeleteMaterial}
        />
      )}

      {/* Modals */}
      <CreateCourseModal 
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onCreateCourse={handleCreateCourse}
      />

      <AddMaterialModal 
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        selectedCourse={selectedCourse}
        onAddCourseMaterial={handleAddMaterial}
      />

      <CreateAssignmentModal 
        isOpen={isCreateAssignmentModalOpen}
        onClose={() => setIsCreateAssignmentModalOpen(false)}
        selectedCourse={selectedCourse}
        onCreateAssignment={handleCreateAssignment}
      />

      <EnrollStudentsModal 
        isOpen={isEnrollStudentsModalOpen}
        onClose={() => setIsEnrollStudentsModalOpen(false)}
        selectedCourse={selectedCourse}
        students={students}
        enrolledStudents={enrolledStudents}
        onEnrollStudents={onEnrollStudents}
      />

      <UpdateMaterialModal
        isOpen={isUpdateMaterialModalOpen}
        onClose={() => setIsUpdateMaterialModalOpen(false)}
        material={selectedMaterial}
        onUpdateMaterial={updateMaterial}
      />
    </div>
  );
} 