export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  teacher_id?: string;
  description?: string;
}

export interface Assignment {
  id: number;
  title: string;
  course_id: number;
  description?: string;
  
  // For UI display
  dueDate?: string;
  status?: 'pending' | 'submitted' | 'graded';
  
  // Database fields
  type?: string;
  start_date?: string;
  end_date?: string;
  max_attempts?: number | null;
}

export interface Evaluation {
  id: number;
  assignment_id: number;
  student_id: string;
  course_id?: number;
  grade?: number;
  feedback?: string;
  submitted_at?: string;
  evaluated_at?: string;
} 