import { useState } from 'react';
import { AdminDashboardProps } from './types';
import { UserProfile } from '@/lib/types';
import FeaturePlaceholder from '@/app/components/FeaturePlaceholder';

// Import sections
import UserManagement from './sections/UserManagement';
import SystemStatistics from './sections/SystemStatistics';

// Import modals
import EditUserModal from './modals/EditUserModal';
import AddUserModal from './modals/AddUserModal';
import DeleteUserModal from './modals/DeleteUserModal';

export default function AdminDashboard({ 
  users, 
  onUpdateUser, 
  onDeleteUser 
}: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Calculate user statistics by role
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Handle selecting a user for editing
  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
  };

  // Handle selecting a user for deletion
  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
  };

  // Handle closing the edit user modal
  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  // Handle refreshing the user list after adding a new user
  const handleUserAdded = () => {
    window.location.reload();
  };

  // Handle user deletion
  const handleUserDeleted = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Placeholders Section */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Nouvelles Fonctionnalités (Bientôt)</h2>
        <div className="flex flex-wrap gap-2">
          <FeaturePlaceholder featureName="Gestion des Cours" />
          <FeaturePlaceholder featureName="Paramètres Système" />
          <FeaturePlaceholder featureName="Rapports Avancés" />
        </div>
      </div>

      {/* User Management Section */}
      <UserManagement 
        users={users} 
        onSelectUser={handleSelectUser} 
        onDeleteUser={handleDeleteClick}
        onAddUser={() => setIsAddUserModalOpen(true)}
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

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        user={userToDelete}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
} 