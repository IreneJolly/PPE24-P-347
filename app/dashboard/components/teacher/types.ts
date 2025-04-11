import { Course, Assignment, Evaluation, UserProfile, UserRole, Competence as CentralCompetence } from '@/lib/types';

// Re-export types from @/lib/types if they are not already exported there
// If they are already exported from lib/types, this line is technically redundant
// but ensures they are available for import from this module.
export type { Course, Assignment, Evaluation, UserProfile, UserRole, CentralCompetence };

// Define Competence type (adjust properties as needed based on actual data structure)
export interface Competence {
  id: number;
  course_id: number;
  competence: string; // Changed from 'title' based on CourseDetail usage
  description: string;
  created_at: string; // Or Date?
}

export interface TeacherDashboardProps {
  user: UserProfile;
  courses?: Course[];
  pendingEvaluations?: Evaluation[];
  students?: UserProfile[];
  onUpdateEvaluation?: (evaluation: Evaluation) => void;
  onCreateAssignment?: (assignment: Omit<Assignment, 'id'>) => void;
  onCreateCourse?: (course: { title: string; description: string }) => Promise<Course | null>;
  onAddCourseMaterial?: (material: { courseId: number; title: string; fileUrl: string; description: string; file?: File }) => Promise<void>;
  onAddCompetence?: (competence: { courseId: number; competence: string; description: string; }) => Promise<void>; // Changed param name/type
  // Add the missing handlers
  onUpdateCompetence?: (competence: Competence) => Promise<void>; // Use Competence type
  onDeleteCompetence?: (competenceId: number) => Promise<void>;
  onDeleteMaterial?: (materialId: number) => Promise<void>;
  onEnrollStudentsHandler?: (courseId: number, studentIds: string[]) => Promise<void>; // Use distinct name
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateCourseModalProps extends ModalProps {
  onCreateCourse: (course: { title: string; description: string }) => Promise<Course | null>;
}

export interface AddMaterialModalProps extends ModalProps {
  // Removed selectedCourse, pass courseId directly
  courseId: number | undefined; // Course ID might be undefined if no course selected
  onMaterialAdded: () => void; // Changed from onAddCourseMaterial to be more generic callback
  // Actual adding logic likely happens in the parent via a passed handler or direct call
}

export interface AddCompetenceModalProps extends ModalProps {
  // Removed selectedCourse, pass courseId directly
  courseId: number | undefined; // Course ID might be undefined if no course selected
  onCompetenceAdded: () => void; // Changed from onAddCompetence
}

export interface CreateAssignmentModalProps extends ModalProps {
  // Removed selectedCourse, pass courseId directly
  courseId: number | undefined; // Course ID might be undefined if no course selected
  onCreateAssignment: (assignment: Omit<Assignment, 'id'> & { courseId: number }) => void;
}

export interface EnrollStudentsModalProps extends ModalProps {
  // Removed selectedCourse, pass courseId directly
  courseId: number | undefined; // Course ID might be undefined if no course selected
  allStudents: UserProfile[]; // Renamed from students to allStudents
  enrolledStudentIds: string[]; // Pass only IDs
  onEnroll: (courseId: number, studentIds: string[]) => Promise<void>; // Renamed from onEnrollStudents
}

export interface CourseListProps {
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void; // Allow unselecting
  onCreateCourse: () => void;
}

export interface PendingEvaluationsProps {
  pendingEvaluations: Evaluation[];
  students: UserProfile[];
  courses: Course[];
  onUpdateEvaluation: (evaluation: Evaluation) => void;
}

export interface CourseDetailProps {
  selectedCourse: Course; // Make non-nullable since it's conditionally rendered
  courseMaterials: any[]; // Replace any with a proper Material type later
  courseCompetence: CentralCompetence[]; // Use the aliased central Competence type here
  courseAssignments: Assignment[]; // Use Assignment type
  enrolledStudents: UserProfile[];
  onAddAssignment: () => void;
  onAddMaterial: () => void;
  onEnrollStudents: () => void;
  onUpdateMaterial: (material: any) => void; // Replace any later
  onDeleteMaterial: (materialId: number) => void;
  onAddCompetence: () => void;
  onUpdateCompetence: (competence: CentralCompetence) => void; // Use the aliased central Competence type here
  onDeleteCompetence: (competenceId: number) => void;
  // Removed allStudents prop
}

// Props for Update Modals (assuming structure)
export interface UpdateMaterialModalProps extends ModalProps {
  material: any | null; // Type later
  onUpdateMaterial: (material: any) => Promise<void>; // Correct prop name
}

export interface UpdateCompetenceModalProps extends ModalProps {
  competence: CentralCompetence | null;
  onCompetenceUpdated: () => void; // This one seems correctly named in its modal
} 