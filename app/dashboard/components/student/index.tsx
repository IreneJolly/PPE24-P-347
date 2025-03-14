import { useState } from 'react';
import { StudentDashboardProps } from './types';
import { Assignment } from '@/lib/types';

// Import sections
import ProgressSection from './sections/ProgressSection';
import AssignmentsSection from './sections/AssignmentsSection';

// Import modals
import SubmitAssignmentModal from './modals/SubmitAssignmentModal';

export default function StudentDashboard({
  courses,
  assignments,
  evaluations,
  onSubmitAssignment,
}: StudentDashboardProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Safely sort assignments by due date, handling undefined values
  const sortedAssignments = [...assignments].sort((a, b) => {
    // If either assignment doesn't have a dueDate, use end_date as fallback
    const dateA = a.dueDate || a.end_date || '9999-12-31'; // Default to far future if no date
    const dateB = b.dueDate || b.end_date || '9999-12-31';
    
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  // Determine assignment status
  const getAssignmentStatus = (assignment: Assignment) => {
    const evaluation = evaluations.find(e => e.course_id === assignment.course_id);
    if (!evaluation) return 'pending';
    if (evaluation.grade) return 'graded';
    if (evaluation.submitted_at) return 'submitted';
    return 'pending';
  };

  // Helper function to format assignment date safely
  const formatAssignmentDate = (assignment: Assignment) => {
    const date = assignment.dueDate || assignment.end_date;
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  // Open the submit assignment modal
  const handleOpenSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  // Close the submit assignment modal
  const handleCloseSubmitModal = () => {
    setSelectedAssignment(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Progress Section */}
      <ProgressSection courses={courses} />

      {/* Assignments Section */}
      <AssignmentsSection 
        courses={courses}
        assignments={sortedAssignments}
        evaluations={evaluations}
        onOpenSubmitModal={handleOpenSubmitModal}
        formatAssignmentDate={formatAssignmentDate}
        getAssignmentStatus={getAssignmentStatus}
      />

      {/* Submit Assignment Modal */}
      <SubmitAssignmentModal
        assignment={selectedAssignment}
        onClose={handleCloseSubmitModal}
        onSubmitAssignment={onSubmitAssignment}
      />
    </div>
  );
} 