import React from 'react';
import { ProgressSectionProps } from '../types';

export default function ProgressSection({ courses }: ProgressSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">My Progress</h2>
      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium text-gray-900">{course.title}</h3>
              <span className="text-sm text-gray-500">{course.progress}%</span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${course.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                {course.description || 'No description available'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 