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
  progress: number;
  teacher_id?: string;
  description?: string;
}

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  course_id: number;
  description?: string;
  status?: 'pending' | 'submitted' | 'graded';
}

export interface Evaluation {
  id: number;
  student_id: string;
  course_id: number;
  grade?: number;
  feedback?: string;
  submitted_at?: string;
  evaluated_at?: string;
} 