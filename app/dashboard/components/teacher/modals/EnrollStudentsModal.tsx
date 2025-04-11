import { useState, useEffect } from 'react';
import { EnrollStudentsModalProps } from '../types';
import { UserProfile } from '@/lib/types';

export default function EnrollStudentsModal({
  isOpen,
  onClose,
  courseId,
  allStudents,
  enrolledStudentIds,
  onEnroll
}: EnrollStudentsModalProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStudentIds([]);
      setSearchQuery('');
    } 
  }, [isOpen, courseId]);

  if (!isOpen || typeof courseId !== 'number') return null;

  const availableStudents = allStudents.filter(
    student => !enrolledStudentIds.includes(student.id)
  );

  const filteredStudents = searchQuery 
    ? availableStudents.filter(student => 
        (student.first_name + ' ' + student.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableStudents;

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(student => student.id));
    }
  };

  const handleEnroll = async () => {
    if (selectedStudentIds.length === 0) return;
    
    setIsEnrolling(true);
    try {
      await onEnroll(courseId, selectedStudentIds);
      onClose();
    } catch (error) {
      console.error('Error enrolling students:', error);
      alert(`Failed to enroll students: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-out" style={{ opacity: isOpen ? 1 : 0 }}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl transform transition-all duration-300 ease-out" style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-20px)' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enroll Students in Course</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Select students from the list below to enroll them in this course. Already enrolled students are not shown.
          </p>
          
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search available students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="text-sm text-gray-500">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} available
          </div>
          {filteredStudents.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All Visible'}
            </button>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto mb-4 border border-gray-200 rounded-md divide-y divide-gray-200">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student: UserProfile) => (
              <div 
                key={student.id} 
                className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  id={`enroll-student-${student.id}`}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => {
                    setSelectedStudentIds(prev => 
                      prev.includes(student.id)
                        ? prev.filter(id => id !== student.id)
                        : [...prev, student.id]
                    );
                  }}
                />
                <label htmlFor={`enroll-student-${student.id}`} className="flex-1 cursor-pointer">
                  <div className="font-medium text-sm text-gray-900">{student.first_name} {student.last_name}</div>
                  <div className="text-xs text-gray-500">{student.email}</div>
                </label>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              {searchQuery 
                ? 'No students found matching your search.'
                : 'All students are already enrolled or no students available.'}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isEnrolling}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEnroll}
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isEnrolling || selectedStudentIds.length === 0}
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
                `Enroll Selected (${selectedStudentIds.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 