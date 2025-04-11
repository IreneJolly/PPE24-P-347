import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentDashboardProps } from './types';
import { Assignment } from '@/lib/types';
import FeaturePlaceholder from '@/app/components/FeaturePlaceholder';

// Import sections
import ProgressSection from './sections/ProgressSection';
import AssignmentsSection from './sections/AssignmentsSection';
import CourseDetail from './sections/CourseDetail';


// Import modals
import SubmitAssignmentModal from './modals/SubmitAssignmentModal';

// Initialize Supabase client ONCE outside the component
const supabase = createClient();

export default function StudentDashboard({
  user,
  courses,
  evaluations,
  onSubmitAssignment,
}: StudentDashboardProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [competence, setCompetence] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<null | any>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);
  const [courseCompetence, setCourseCompetence] = useState<any[]>([]);

  async function fetchMaterials() {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from('course_attachments')
        .select('*')
        .eq('course_id', selectedCourse.id);

      if (error) {
        throw error;
      }

      setMaterials(data || []);
      setCourseMaterials(data || []);
    } catch (error) {
      console.error('Error fetching course materials:', error);
    }
  }

  async function fetchCompetence() {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from('competence')
        .select('*')
        .eq('course_id', selectedCourse.id);

      if (error) {
        throw error;
      }

      setCompetence(data || []);
      setCourseCompetence(data || []);
    } catch (error) {
      console.error('Error fetching competence materials:', error);
    }
  }

  // Fetch course assignments when selected course changes
  async function fetchAssignments() {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', selectedCourse.id);

      if (error) {
        throw error;
      }

      setAssignments(data || []);
      setCourseAssignments(data || []);
    } catch (error) {
      console.error('Error fetching course assignments:', error);
    }
  }

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials();
      fetchAssignments();
      fetchCompetence();
    } else {
      setCourseMaterials([]);
      setCourseAssignments([]);
      setCourseCompetence([]);
    }
  }, [selectedCourse]);

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
    <div className="space-y-6">
      {/* Feature Placeholders Section */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Prochainement</h2>
        <div className="flex flex-wrap gap-2">
          <FeaturePlaceholder featureName="Voir mes Notes" />
          <FeaturePlaceholder featureName="Calendrier des Cours" />
          <FeaturePlaceholder featureName="Messagerie" />
        </div>
      </div>

      {/* Existing Sections - Wrap them if needed or keep vertical stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Section */}
        <ProgressSection
          user={user}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse} />

        {/* Assignments Section */}
        <AssignmentsSection
          courses={courses}
          assignments={sortedAssignments}
          evaluations={evaluations}
          onOpenSubmitModal={handleOpenSubmitModal}
          formatAssignmentDate={formatAssignmentDate}
          getAssignmentStatus={getAssignmentStatus}
        />
      </div>
      
      {/* Conditionally rendered CourseDetail */}
      {selectedCourse && (
        <CourseDetail
          user={user}
          selectedCourse={selectedCourse}
          courseMaterials={courseMaterials}
          courseAssignments={courseAssignments}
          courseCompetence={courseCompetence}
        />
      )}

      {/* Submit Assignment Modal */}
      <SubmitAssignmentModal
        assignment={selectedAssignment}
        onClose={handleCloseSubmitModal}
        onSubmitAssignment={onSubmitAssignment}
      />
    </div>
  );
} 