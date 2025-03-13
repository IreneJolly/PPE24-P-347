import { UserProfile } from '@/lib/types';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  user: UserProfile;
  onSignOut: () => void;
  children: ReactNode;
}

export default function DashboardLayout({ user, onSignOut, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {user.role === 'admin' ? 'Admin Dashboard' :
                 user.role === 'teacher' ? 'Teacher Dashboard' :
                 'Student Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {user.first_name} {user.last_name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium capitalize" 
                style={{
                  backgroundColor: user.role === 'admin' ? '#FEE2E2' : 
                                 user.role === 'teacher' ? '#E0E7FF' : 
                                 '#ECFDF5',
                  color: user.role === 'admin' ? '#991B1B' : 
                         user.role === 'teacher' ? '#3730A3' : 
                         '#065F46'
                }}>
                {user.role}
              </span>
              <button
                onClick={onSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 