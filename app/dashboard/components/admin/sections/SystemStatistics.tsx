import React from 'react';
import { SystemStatisticsProps } from '../types';

export default function SystemStatistics({ 
  users, 
  usersByRole 
}: SystemStatisticsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">System Statistics</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{users.length}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(usersByRole).map(([role, count]) => (
            <div key={role} className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 capitalize">{role}s</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 