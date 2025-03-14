import { useState } from 'react';
import { AdminDashboardProps } from './types';
import { UserProfile } from '@/lib/types';

// Import sections
import UserManagement from './sections/UserManagement';
import SystemStatistics from './sections/SystemStatistics';

// Import modals
import EditUserModal from './modals/EditUserModal';

export default function AdminDashboard({ 
  users, 
  onUpdateUser, 
  onDeleteUser 
}: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Calculate user statistics by role
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Handle selecting a user for editing
  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
  };

  // Handle closing the edit user modal
  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* User Management Section */}
      <UserManagement 
        users={users} 
        onSelectUser={handleSelectUser} 
        onDeleteUser={onDeleteUser} 
      />

      {/* System Statistics Section */}
      <SystemStatistics 
        users={users} 
        usersByRole={usersByRole} 
      />

      {/* Edit User Modal */}
      <EditUserModal 
        selectedUser={selectedUser} 
        onClose={handleCloseModal} 
        onUpdateUser={onUpdateUser} 
      />
    </div>
  );
} 