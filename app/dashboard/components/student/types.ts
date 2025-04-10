import { Course, Assignment, Evaluation, Competence,  UserProfile } from '@/lib/types';

export interface StudentDashboardProps {
  user: UserProfile;
  courses: Course[];
  assignments: Assignment[];
  evaluations: Evaluation[];
  competence: Competence[];
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
  user: UserProfile;
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course) => void;
}

export interface CourseDetailProps {
  user: UserProfile;
  selectedCourse: Course | null;
  courseMaterials: any[];
  courseAssignments: any[];
  courseCompetence: any[];
}