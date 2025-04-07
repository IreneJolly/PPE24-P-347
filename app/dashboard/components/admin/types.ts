import { UserProfile } from '@/lib/types';

export interface AdminDashboardProps {
  users: UserProfile[];
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export interface UserManagementProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onAddUser: () => void;
}

export interface SystemStatisticsProps {
  users: UserProfile[];
  usersByRole: Record<string, number>;
}

export interface EditUserModalProps {
  selectedUser: UserProfile | null;
  onClose: () => void;
  onUpdateUser: (user: UserProfile) => void;
} 