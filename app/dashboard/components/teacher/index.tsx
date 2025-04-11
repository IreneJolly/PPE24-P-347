import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  TeacherDashboardProps,
  Course,
  Evaluation,
  UserProfile,
  CentralCompetence as Competence,
  Assignment,
  UserRole
} from './types';
import FeaturePlaceholder from '@/app/components/FeaturePlaceholder';

// Import sections and modals
import CourseList from './sections/CourseList';
import PendingEvaluations from './sections/PendingEvaluations';
import CourseDetail from './sections/CourseDetail';
import CreateCourseModal from './modals/CreateCourseModal';
import AddMaterialModal from './modals/AddMaterialModal';
import AddCompetenceModal from './modals/AddCompetenceModal';
import CreateAssignmentModal from './modals/CreateAssignmentModal';
import EnrollStudentsModal from './modals/EnrollStudentsModal';
import UpdateMaterialModal from './modals/UpdateMaterialModal';
import UpdateCompetenceModal from './modals/UpdateCompetenceModal';

// Initialize Supabase client ONCE outside the component
const supabase = createClient();

export default function TeacherDashboard({
  user,
  courses: initialCourses = [],
  pendingEvaluations = [],
  students: initialStudents = [],
  onUpdateEvaluation = () => { },
  onCreateAssignment = async () => { },
  onCreateCourse = async () => null,
  onAddCourseMaterial = async () => { },
  onAddCompetence = async () => { },
  onUpdateCompetence = async () => { },
  onDeleteCompetence = async () => { },
  onDeleteMaterial = async () => { },
  onEnrollStudentsHandler = async () => { }
}: TeacherDashboardProps) {
  // State declarations
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>(initialStudents);
  const [enrolledStudents, setEnrolledStudents] = useState<UserProfile[]>([]);

  // Modal states...
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddCompetenceModalOpen, setIsAddCompetenceModalOpen] = useState(false);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
  const [isEnrollStudentsModalOpen, setIsEnrollStudentsModalOpen] = useState(false);
  const [isUpdateMaterialModalOpen, setIsUpdateMaterialModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [isUpdateCompetenceModalOpen, setIsUpdateCompetenceModalOpen] = useState(false);
  const [selectedCompetence, setSelectedCompetence] = useState<Competence | null>(null);

  // Helper function to determine UserRole
  const determineUserRole = (roles: string[] | null | undefined): UserRole => {
    if (roles?.includes('admin')) return 'admin';
    if (roles?.includes('teacher')) return 'teacher';
    return 'student'; // Default to student
  };

  // Fetch course details (materials, competences, assignments)
  async function fetchCourseDetails() {
    if (!selectedCourse) return;
    console.log(`Fetching details for course: ${selectedCourse.id}`);
    try {
      // Fetch materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_attachments').select('*').eq('course_id', selectedCourse.id);
      if (materialsError) {
        console.error('Materials fetch error:', materialsError);
        throw materialsError;
      }
      setMaterials(materialsData || []);
      console.log(`Fetched ${materialsData?.length || 0} materials`);

      // Fetch competences
      const { data: competenceData, error: competenceError } = await supabase
        .from('competence').select('*').eq('course_id', selectedCourse.id);
      if (competenceError) throw competenceError;
      
      // Map to the CENTRAL Competence type (@/lib/types)
      const fetchedCompetences: Competence[] = (competenceData || []).map(c => ({
        id: c.id,
        // course_id is optional in central type, handle accordingly
        course_id: c.course_id, 
        // Use 'title' as defined in @/lib/types/Competence
        title: c.title || c.competence || '', // Use title field, fallback to competence if needed
        description: c.description || '',
        // created_at is not part of the central type, omit it
      })).filter(c => typeof c.id === 'number' && typeof c.title === 'string'); // Add filter for safety
      
      setCompetences(fetchedCompetences); // State type now matches prop type

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments').select('*').eq('course_id', selectedCourse.id);
      if (assignmentsError) {
        console.error('Assignments fetch error:', assignmentsError);
        throw assignmentsError;
      }
      const fetchedAssignments: Assignment[] = (assignmentsData || []).map(a => ({
        id: a.id,
        title: a.title || '',
        course_id: a.course_id,
        description: a.description,
        dueDate: a.end_date,
        status: 'pending',
        type: a.type,
        start_date: a.start_date,
        end_date: a.end_date,
        max_attempts: a.max_attempts
      }));
      setAssignments(fetchedAssignments);
      console.log(`Fetched ${fetchedAssignments.length} assignments`);

    } catch (error) {
      console.error(`Error fetching course details for course ${selectedCourse.id}:`, error);
      setMaterials([]);
      setCompetences([]);
      setAssignments([]);
    }
  }

  // Fetch enrolled students with corrected type mapping
  async function fetchEnrolledStudents() {
    if (!selectedCourse) return;
    console.log(`Fetching enrolled students for course: ${selectedCourse.id}`);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`student_id, users:users!inner (id, email, full_name, roles, created_at)`)
        .eq('course_id', selectedCourse.id);
      if (error) {
          console.error('Enrolled students fetch error:', error);
          throw error;
      }

      const fetchedStudents: UserProfile[] = data?.map((enrollment: any) => ({
        id: enrollment.users.id,
        email: enrollment.users.email,
        full_name: enrollment.users.full_name || '',
        first_name: enrollment.users.full_name?.split(' ')[0] || '',
        last_name: enrollment.users.full_name?.split(' ').slice(1).join(' ') || '',
        role: determineUserRole(enrollment.users.roles),
        roles: enrollment.users.roles || [],
        created_at: enrollment.users.created_at || new Date().toISOString(),
      })) || [];
      setEnrolledStudents(fetchedStudents);
      console.log(`Fetched ${fetchedStudents.length} enrolled students`);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      setEnrolledStudents([]);
    }
  }

  // Fetch data when selected course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseDetails();
      fetchEnrolledStudents();
    } else {
      // Clear data when no course is selected
      setMaterials([]);
      setCompetences([]);
      setAssignments([]);
      setEnrolledStudents([]);
    }
  }, [selectedCourse]);

  // Fetch courses taught by the current teacher
  useEffect(() => {
    async function fetchCourses() {
      if (!user?.id) return;
      try {
        const { data: teacherCourses, error: teacherCoursesError } = await supabase
          .from('course_teachers')
          // Select needed fields, including the joined course fields
          .select(`course_id, courses:courses!inner (id, title, description)`) 
          .eq('teacher_id', user.id);

        if (teacherCoursesError) throw teacherCoursesError;

        // Map precisely to the Course type, respecting optional fields
        const formattedCourses: Course[] = teacherCourses?.map(tc => {
            const courseData = tc.courses as any; // Cast to any for intermediate access
            
            // Construct the Course object conditionally
            const courseObject: Course = {
                id: courseData.id,         // Required
                title: courseData.title,     // Required
            };
            
            // Add optional fields only if they exist in the fetched data
            if (courseData.description !== null && courseData.description !== undefined) {
                courseObject.description = courseData.description;
            }
            // Add teacher_id (which is optional in Course type)
            courseObject.teacher_id = user.id; 
            // Add progress if needed/fetched, otherwise it remains undefined (optional)
            // courseObject.progress = courseData.progress; 
            
            // Basic validation - ensure id and title are present
            if (typeof courseObject.id !== 'number' || typeof courseObject.title !== 'string') {
                console.warn('Skipping invalid course data:', courseData);
                return null; // Skip this entry if essential fields are missing
            }
            
            return courseObject;
        }).filter((course): course is Course => course !== null) || []; // Filter out nulls
          
        setCourses(formattedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }
    }
    if (initialCourses.length === 0 && user?.id) {
      fetchCourses();
    }
  }, [initialCourses, user?.id]);

  // Fetch all students for enrollment modal
  useEffect(() => {
    async function fetchStudents() {
        console.log('Fetching all students');
      try {
        const { data, error } = await supabase
          .from('users').select('id, email, full_name, roles, created_at')
          .contains('roles', ['student']);
        if (error) {
            console.error('All students fetch error:', error);
            throw error;
        }
        
        const fetchedStudents: UserProfile[] = data?.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name || '',
          first_name: u.full_name?.split(' ')[0] || '',
          last_name: u.full_name?.split(' ').slice(1).join(' ') || '',
          role: determineUserRole(u.roles),
          roles: u.roles || [],
          created_at: u.created_at || new Date().toISOString(),
        })) || [];
        setStudents(fetchedStudents);
        console.log(`Fetched ${fetchedStudents.length} total students`);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }
    }
    // Fetch students only if the initial list is empty
    if (initialStudents.length === 0) {
      fetchStudents();
    }
  }, [initialStudents]);

  // --- Handlers for Modals/Actions ---

  const handleCreateCourse = async (courseData: { title: string; description: string }) => {
    console.log('Attempting to create course:', courseData.title);
    try {
        const newCourse = await onCreateCourse(courseData); // Call prop function
        if (newCourse) {
          setCourses(prev => [...prev, newCourse]);
          setIsCreateCourseModalOpen(false);
          setSelectedCourse(newCourse); 
          console.log('Course created successfully:', newCourse.id);
          // Return the created course to match Promise<Course | null>
          return newCourse; 
        } else {
            console.error('onCreateCourse prop did not return a course object.');
            alert('Failed to create course. Please check console.');
            return null; // Return null on failure
        }
    } catch (error) {
        console.error('Error in handleCreateCourse:', error);
        alert(`Error creating course: ${error instanceof Error ? error.message : String(error)}`);
        return null; // Return null on error
    }
  };

  const handleAddMaterial = async (materialData: { courseId: number; title: string; fileUrl: string; description: string; file?: File }) => {
    console.log('Adding material:', materialData.title);
     try {
       await onAddCourseMaterial(materialData);
       fetchCourseDetails();
       setIsAddMaterialModalOpen(false);
       console.log('Material added successfully');
     } catch (error) {
       console.error('Error adding material:', error);
       alert(`Error adding material: ${error instanceof Error ? error.message : String(error)}`);
     }
   };

  const handleAddCompetence = async (competenceData: { courseId: number; competence: string; description: string; }) => {
      console.log('Adding competence:', competenceData.competence);
      if (!selectedCourse) return;
      try {
        await onAddCompetence({...competenceData, courseId: selectedCourse.id });
        fetchCourseDetails();
        setIsAddCompetenceModalOpen(false);
        console.log('Competence added successfully');
      } catch (error) {
          console.error('Error adding competence:', error);
          alert(`Error adding competence: ${error instanceof Error ? error.message : String(error)}`);
      }
  };

  const handleCreateAssignment = async (assignmentData: Omit<Assignment, 'id' | 'course_id'>) => {
      console.log('Creating assignment:', assignmentData.title);
    if (!selectedCourse) return;
    try {
        await onCreateAssignment({ ...assignmentData, course_id: selectedCourse.id });
        fetchCourseDetails();
        setIsCreateAssignmentModalOpen(false);
        console.log('Assignment created successfully');
    } catch (error) {
        console.error('Error creating assignment:', error);
        alert(`Error creating assignment: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEnrollStudents = async (courseId: number, studentIds: string[]) => {
      console.log(`Enrolling ${studentIds.length} students into course: ${courseId}`);
      try {
        await onEnrollStudentsHandler(courseId, studentIds);
        fetchEnrolledStudents();
        setIsEnrollStudentsModalOpen(false);
        console.log('Students enrolled successfully');
      } catch (error) {
          console.error('Error enrolling students:', error);
          alert(`Error enrolling students: ${error instanceof Error ? error.message : String(error)}`);
      }
  };

  // Open update modals
  const handleUpdateMaterialClick = (material: any) => {
    setSelectedMaterial(material);
    setIsUpdateMaterialModalOpen(true);
  };
  const handleUpdateCompetenceClick = (competence: Competence) => {
    setSelectedCompetence(competence);
    setIsUpdateCompetenceModalOpen(true);
  };

  // Callbacks from update modals
  const handleMaterialUpdated = () => {
      console.log('Material updated callback triggered');
    setIsUpdateMaterialModalOpen(false);
    setSelectedMaterial(null);
    fetchCourseDetails();
  };
  const handleCompetenceUpdated = () => {
      console.log('Competence updated callback triggered');
    setIsUpdateCompetenceModalOpen(false);
    setSelectedCompetence(null);
    fetchCourseDetails();
  };

  // Deletion Handlers
  const handleDeleteMaterialClick = async (materialId: number) => {
      console.log('Deleting material:', materialId);
      try {
        await onDeleteMaterial(materialId);
        fetchCourseDetails();
        console.log('Material deleted successfully');
      } catch (error) {
        console.error('Error deleting material:', error);
        alert(`Error deleting material: ${error instanceof Error ? error.message : String(error)}`);
      }
  };
  const handleDeleteCompetenceClick = async (competenceId: number) => {
      console.log('Deleting competence:', competenceId);
      try {
        await onDeleteCompetence(competenceId);
        fetchCourseDetails();
        console.log('Competence deleted successfully');
      } catch (error) {
          console.error('Error deleting competence:', error);
          alert(`Error deleting competence: ${error instanceof Error ? error.message : String(error)}`);
      }
  };

  // Handler to be passed TO UpdateMaterialModal
  // This likely needs to call the onUpdateMaterial prop passed TO TeacherDashboard
  // Assuming there's an onUpdateMaterial prop passed to TeacherDashboard
  const handleUpdateMaterialSubmit = async (updatedMaterialData: any) => {
      console.log('Submitting updated material:', updatedMaterialData);
      // Assuming TeacherDashboardProps includes onUpdateMaterial: (material: any) => Promise<void>
      // const onUpdateMaterialProp = (props as any).onUpdateMaterial; // Access prop if needed
      try {
          // Call the prop function passed to TeacherDashboard (if available)
          // await onUpdateMaterialProp(updatedMaterialData);
          
          // Placeholder: Directly update via Supabase if prop isn't passed
          // This might duplicate logic from the parent page, ideally call a prop
          const { error } = await supabase
              .from('course_attachments')
              .update({
                  title: updatedMaterialData.title,
                  description: updatedMaterialData.description,
                  // Add file_url update logic if needed (handle file upload within modal or here)
              })
              .eq('id', updatedMaterialData.id);
          if (error) throw error;

          // Close modal and refresh after successful update
          setIsUpdateMaterialModalOpen(false);
          setSelectedMaterial(null);
          await fetchCourseDetails(); // Refresh details
          console.log('Material updated successfully via internal handler');
      } catch (error) {
          console.error('Error updating material in submit handler:', error);
          alert(`Failed to update material: ${error instanceof Error ? error.message : String(error)}`);
          // Optionally re-throw or handle error state
      }
  };

  // --- Render --- 
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Left Column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Feature Placeholders Section */} 
        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Fonctionnalités à venir</h2>
          <div className="flex flex-wrap gap-2">
            <FeaturePlaceholder featureName="Gestion des Notes" />
            <FeaturePlaceholder featureName="Annonces de Cours" />
            <FeaturePlaceholder featureName="Forum de Discussion" />
          </div>
        </div>

        {/* Course List Card */}
        <CourseList
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          onCreateCourse={() => setIsCreateCourseModalOpen(true)}
        />
        
        {/* Pending Evaluations Card */}
        <PendingEvaluations
          pendingEvaluations={pendingEvaluations}
          students={students}
          courses={courses}
          onUpdateEvaluation={onUpdateEvaluation}
        />
      </div>

      {/* Right Column: Course Details */}
      <div className="lg:col-span-2">
        {selectedCourse ? (
          <CourseDetail
            selectedCourse={selectedCourse}
            courseMaterials={materials}
            courseCompetence={competences}
            courseAssignments={assignments}
            enrolledStudents={enrolledStudents}
            onAddMaterial={() => setIsAddMaterialModalOpen(true)}
            onAddCompetence={() => setIsAddCompetenceModalOpen(true)}
            onAddAssignment={() => setIsCreateAssignmentModalOpen(true)}
            onEnrollStudents={() => setIsEnrollStudentsModalOpen(true)}
            onUpdateMaterial={handleUpdateMaterialClick}
            onDeleteMaterial={handleDeleteMaterialClick}
            onUpdateCompetence={handleUpdateCompetenceClick}
            onDeleteCompetence={handleDeleteCompetenceClick}
          />
        ) : (
          <div className="flex items-center justify-center h-64 p-6 bg-white rounded-lg shadow-md">
            <p className="text-center text-gray-500">
              Sélectionnez un cours dans la liste de gauche pour voir ses détails et gérer son contenu.
            </p>
          </div>
        )}
      </div>

      {/* Modals */} 
      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onCreateCourse={handleCreateCourse}
      />
      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        courseId={selectedCourse?.id}
        onMaterialAdded={() => {
            console.log('AddMaterialModal closed, refreshing details...');
            fetchCourseDetails(); 
            setIsAddMaterialModalOpen(false);
        }} 
      />
      <AddCompetenceModal
        isOpen={isAddCompetenceModalOpen}
        onClose={() => setIsAddCompetenceModalOpen(false)}
        courseId={selectedCourse?.id}
        onCompetenceAdded={() => {
            console.log('AddCompetenceModal closed, refreshing details...');
            fetchCourseDetails();
            setIsAddCompetenceModalOpen(false);
        }}
      />
      <CreateAssignmentModal
        isOpen={isCreateAssignmentModalOpen}
        onClose={() => setIsCreateAssignmentModalOpen(false)}
        courseId={selectedCourse?.id}
        onCreateAssignment={handleCreateAssignment}
      />
      <EnrollStudentsModal
        isOpen={isEnrollStudentsModalOpen}
        onClose={() => setIsEnrollStudentsModalOpen(false)}
        courseId={selectedCourse?.id}
        allStudents={students}
        enrolledStudentIds={enrolledStudents.map(s => s.id)}
        onEnroll={handleEnrollStudents} 
      />
      <UpdateMaterialModal
        isOpen={isUpdateMaterialModalOpen}
        onClose={() => { setIsUpdateMaterialModalOpen(false); setSelectedMaterial(null); }}
        material={selectedMaterial}
        onUpdateMaterial={handleUpdateMaterialSubmit}
      />
      <UpdateCompetenceModal
        isOpen={isUpdateCompetenceModalOpen}
        onClose={() => { setIsUpdateCompetenceModalOpen(false); setSelectedCompetence(null); }}
        competence={selectedCompetence}
        onCompetenceUpdated={handleCompetenceUpdated}
      />
    </div>
  );
} 