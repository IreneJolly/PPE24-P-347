import { Course, Assignment, Evaluation,  UserProfile } from '@/lib/types';

export interface StudentDashboardProps {
  courses: Course[];
  assignments: Assignment[];
  evaluations: Evaluation[];
  onSubmitAssignment: (assignmentId: number, submission: { content: string }) => void;
}

export interface AssignmentsSectionProps {
  courses: Course[];
  assignments: Assignment[];
  evaluations: Evaluation[];
  onOpenSubmitModal: (assignment: Assignment) => void;
  formatAssignmentDate: (assignment: Assignment) => string;
  getAssignmentStatus: (assignment: Assignment) => string;
}

export interface SubmitAssignmentModalProps {
  assignment: Assignment | null;
  onClose: () => void;
  onSubmitAssignment: (assignmentId: number, submission: { content: string }) => void;
} 

export interface ProgressSectionProps {
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course) => void;
}

export interface CourseDetailProps {
  selectedCourse: Course | null;
  courseMaterials: any[];
  courseAssignments: any[];
}