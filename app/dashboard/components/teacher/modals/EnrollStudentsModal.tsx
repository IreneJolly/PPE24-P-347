import { useState } from 'react';
import { EnrollStudentsModalProps } from '../types';

export default function EnrollStudentsModal({
  isOpen,
  onClose,
  selectedCourse,
  students,
  enrolledStudents,
  onEnrollStudents
}: EnrollStudentsModalProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !selectedCourse) return null;

  // Filter out already enrolled students
  const availableStudents = students.filter(
    student => (
      // Check both 'role' and 'roles' to accommodate schema changes
      (student.role === 'student' || 
       (Array.isArray(student.roles) && student.roles.includes('student')))
      && !enrolledStudents.some(enrolled => enrolled.id === student.id)
    )
  );

  // Filter students based on search query
  const filteredStudents = searchQuery 
    ? availableStudents.filter(student => 
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableStudents;

  // Select/deselect all visible students
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      // If all visible students are selected, deselect all
      setSelectedStudents([]);
    } else {
      // Otherwise, select all visible students
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    setIsEnrolling(true);
    try {
      await onEnrollStudents(selectedCourse.id, selectedStudents);
      onClose();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error enrolling students:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Enroll Students in {selectedCourse.title}</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            Select students to enroll in this course. Students already enrolled are not shown.
          </p>
          
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {/* Student count and select all */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} available
          </div>
          {filteredStudents.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        
        {/* Student list */}
        <div className="max-h-96 overflow-y-auto mb-4 border rounded-md divide-y">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <div 
                key={student.id} 
                className="flex items-center p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={`student-${student.id}`}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => {
                    if (selectedStudents.includes(student.id)) {
                      setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                    } else {
                      setSelectedStudents([...selectedStudents, student.id]);
                    }
                  }}
                />
                <label htmlFor={`student-${student.id}`} className="ml-3 flex-1 cursor-pointer">
                  <div className="font-medium">{student.first_name} {student.last_name}</div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                </label>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchQuery 
                ? 'No students found matching your search'
                : 'No students available to enroll'}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setSelectedStudents([]);
                setSearchQuery('');
              }}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isEnrolling}
            >
              Cancel
            </button>
            <button
              onClick={handleEnrollStudents}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              disabled={isEnrolling || selectedStudents.length === 0}
            >
              {isEnrolling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enrolling...
                </>
              ) : (
                'Enroll Selected Students'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 