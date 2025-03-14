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

  // Fetch all students if not provided
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
  const handleAddMaterial = async (material: { courseId: number; title: string; fileUrl: string; description: string }) => {
    await onAddCourseMaterial(material);
    fetchMaterials();
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
    </div>
  );
} 