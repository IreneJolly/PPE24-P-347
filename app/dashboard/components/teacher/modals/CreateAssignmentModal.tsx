import { useState } from 'react';
import { CreateAssignmentModalProps } from '../types';
import { Assignment } from '@/lib/types';

export default function CreateAssignmentModal({ 
  isOpen, 
  onClose, 
  courseId,
  onCreateAssignment 
}: CreateAssignmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('assignment'); // Default type
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxAttempts, setMaxAttempts] = useState<number | null>(null);

  if (!isOpen || typeof courseId !== 'number') return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const assignmentDataToSend: Omit<Assignment, 'id'> & { courseId: number } = {
        title: title,
        description: description,
        type: type,
        course_id: courseId,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        max_attempts: maxAttempts,
        courseId: courseId
      };
      
      await onCreateAssignment(assignmentDataToSend);
      
      setTitle('');
      setDescription('');
      setType('assignment');
      setStartDate('');
      setEndDate('');
      setMaxAttempts(null);
      onClose();

    } catch (error) {
      console.error('Error creating assignment:', error);
      alert(`Failed to create assignment: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-out" style={{ opacity: isOpen ? 1 : 0 }}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl transform transition-all duration-300 ease-out" style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-20px)' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Assignment</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="assignment-title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                id="assignment-title"
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="assignment-description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="assignment-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="assignment-type" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="assignment-type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 sm:text-sm"
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignment-start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  id="assignment-start-date"
                  type="datetime-local"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="assignment-end-date" className="block text-sm font-medium text-gray-700">End Date / Due Date</label>
                <input
                  id="assignment-end-date"
                  type="datetime-local"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="assignment-max-attempts" className="block text-sm font-medium text-gray-700">Max Attempts (optional)</label>
              <input
                id="assignment-max-attempts"
                type="number"
                name="maxAttempts"
                value={maxAttempts ?? ''}
                onChange={(e) => setMaxAttempts(e.target.value ? parseInt(e.target.value) : null)}
                min="1"
                placeholder="Leave empty for unlimited"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 