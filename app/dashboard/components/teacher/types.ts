import { Course, Assignment, Evaluation, UserProfile } from '@/lib/types';

export interface TeacherDashboardProps {
  user: UserProfile;
  courses?: Course[];
  pendingEvaluations?: Evaluation[];
  students?: UserProfile[];
  onUpdateEvaluation?: (evaluation: Evaluation) => void;
  onCreateAssignment?: (assignment: Omit<Assignment, 'id'>) => void;
  onCreateCourse?: (course: { title: string; description: string }) => Promise<Course | null>;
  onAddCourseMaterial?: (material: { courseId: number; title: string; fileUrl: string; description: string; file?: File }) => Promise<void>;
  onAddCompetence?: (material: { courseId: number; title: string; description: string; }) => Promise<void>;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateCourseModalProps extends ModalProps {
  onCreateCourse: (course: { title: string; description: string }) => Promise<Course | null>;
}

export interface AddMaterialModalProps extends ModalProps {
  selectedCourse: Course | null;
  onAddCourseMaterial: (material: { courseId: number; title: string; fileUrl: string; description: string; file: File }) => Promise<void>;
}

export interface AddCompetenceModalProps extends ModalProps {
  selectedCourse: Course | null;
  onAddCompetence: (material: { courseId: number; title: string; description: string; }) => Promise<void>;
}

export interface CreateAssignmentModalProps extends ModalProps {
  selectedCourse: Course | null;
  onCreateAssignment: (assignment: Omit<Assignment, 'id'>) => void;
}

export interface EnrollStudentsModalProps extends ModalProps {
  selectedCourse: Course | null;
  students: UserProfile[];
  enrolledStudents: UserProfile[];
  onEnrollStudents: (courseId: number, studentIds: string[]) => Promise<void>;
}

export interface CourseListProps {
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course) => void;
  onCreateCourse: () => void;
}

export interface PendingEvaluationsProps {
  pendingEvaluations: Evaluation[];
  students: UserProfile[];
  courses: Course[];
  onUpdateEvaluation: (evaluation: Evaluation) => void;
}

export interface CourseDetailProps {
  selectedCourse: Course | null;
  courseMaterials: any[];
  courseCompetence: any[];
  courseAssignments: any[];
  enrolledStudents: UserProfile[];
  onAddAssignment: () => void;
  onAddMaterial: () => void;
  onEnrollStudents: () => void;
  onUpdateMaterial: (material: any) => void;
  onDeleteMaterial: (materialId: number) => void;
  onAddCompetence: () => void;
  onUpdateCompetence: (competence: any) => void;
  onDeleteCompetence: (competenceId: number) => void;
} 