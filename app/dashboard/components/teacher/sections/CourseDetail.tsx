import { useState } from 'react';
import { CourseDetailProps } from '../types';
import { Assignment, Competence, UserProfile } from '@/lib/types'; // Import necessary types

// Define tab names for clarity
type TabName = 'materials' | 'competences' | 'assignments' | 'students';

// Example Icons (replace or use a library like heroicons)
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const DeleteIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;

export default function CourseDetail({
  selectedCourse,
  courseMaterials,
  courseCompetence,
  courseAssignments,
  enrolledStudents,
  onAddAssignment, // Handler for opening assignment modal
  onAddMaterial,   // Handler for opening material modal
  onEnrollStudents, // Handler for opening enroll modal
  onUpdateMaterial,
  onDeleteMaterial,
  onAddCompetence,   // Handler for opening competence modal
  onUpdateCompetence,
  onDeleteCompetence,
}: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState<TabName>('materials');

  if (!selectedCourse) return null;

  // Tab button styling helper
  const getTabClasses = (tabName: TabName) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border-b-2"; // Added border-b
    if (activeTab === tabName) {
      return `${baseClasses} border-indigo-500 text-indigo-600`; // Active tab style
    } else {
      return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`; // Inactive tab style
    }
  };

  // --- Render Content for Each Tab ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'materials':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-gray-700">Course Materials</h4>
              {/* Add Material Button */}
              <button 
                onClick={onAddMaterial} 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  <PlusIcon /> Add Material
              </button>
            </div>
            {courseMaterials.length > 0 ? (
              courseMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg text-sm bg-white hover:bg-gray-50 shadow-sm">
                  <div>
                    <div className="font-medium text-gray-800">{material.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{material.description}</div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <span className="text-xs text-gray-400">
                      {material.created_at ? new Date(material.created_at).toLocaleDateString() : ''}
                    </span>
                    <div className="flex space-x-1">
                      <button onClick={() => onUpdateMaterial(material)} className="p-1 text-blue-600 hover:text-blue-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" title="Edit material">
                         <EditIcon />
                      </button>
                      <button onClick={() => onDeleteMaterial(material.id)} className="p-1 text-red-600 hover:text-red-800 rounded focus:outline-none focus:ring-1 focus:ring-red-500" title="Delete material">
                         <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6">No materials added yet.</p>
            )}
          </div>
        );

      case 'competences':
         return (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-gray-700">Competences</h4>
              {/* Add Competence Button */}
               <button 
                onClick={onAddCompetence} 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  <PlusIcon /> Add Competence
              </button>
            </div>
            {courseCompetence.length > 0 ? (
              courseCompetence.map((competence: Competence) => (
                <div key={competence.id} className="flex items-center justify-between p-3 border rounded-lg text-sm bg-white hover:bg-gray-50 shadow-sm">
                   <div>
                    <div className="font-medium text-gray-800">{competence.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{competence.description}</div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <div className="flex space-x-1">
                      <button onClick={() => onUpdateCompetence(competence)} className="p-1 text-blue-600 hover:text-blue-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" title="Edit competence">
                         <EditIcon />
                      </button>
                      <button onClick={() => onDeleteCompetence(competence.id)} className="p-1 text-red-600 hover:text-red-800 rounded focus:outline-none focus:ring-1 focus:ring-red-500" title="Delete competence">
                         <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6">No competencies added yet.</p>
            )}
          </div>
        );

      case 'assignments':
         return (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-gray-700">Assignments</h4>
              {/* Add Assignment Button - Restored Here */}
              <button 
                onClick={onAddAssignment} 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  <PlusIcon /> Add Assignment
              </button>
            </div>
            {courseAssignments.length > 0 ? (
              courseAssignments.map((assignment: Assignment) => (
                 <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg text-sm bg-white hover:bg-gray-50 shadow-sm">
                  <div>
                    <div className="font-medium text-gray-800">{assignment.title}</div>
                    <div className="text-xs text-gray-500 mt-1">Type: {assignment.type || 'N/A'}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xs font-medium text-gray-700">
                      Due: {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {assignment.max_attempts ? `${assignment.max_attempts} attempts` : 'Unlimited attempts'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6">No assignments created yet.</p>
            )}
          </div>
        );

      case 'students':
         return (
           <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-base font-semibold text-gray-700">Enrolled Students ({enrolledStudents.length})</h4>
                 {/* Enroll Students Button - Restored Here */}
                <button 
                    onClick={onEnrollStudents} 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PlusIcon /> Enroll Students
              </button>
            </div>
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map((student: UserProfile) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg text-sm bg-white hover:bg-gray-50 shadow-sm">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-xs font-medium text-indigo-800">
                        {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{student.first_name} {student.last_name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </div>
                   {/* Add remove button later? */}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6">No students enrolled yet.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // --- Main Return --- 
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Course Header */} 
      <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{selectedCourse.title}</h2>
          {selectedCourse.description && (
            <p className="text-sm text-gray-600 mt-1">{selectedCourse.description}</p>
          )}
      </div>

      {/* Tab Navigation */} 
      <div className="mb-4"> {/* Reduced bottom margin */}
          <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs"> {/* Adjusted spacing */}
                  <button onClick={() => setActiveTab('materials')} className={getTabClasses('materials')}>
                      Materials
                  </button>
                  <button onClick={() => setActiveTab('competences')} className={getTabClasses('competences')}>
                      Competences
                  </button>
                  <button onClick={() => setActiveTab('assignments')} className={getTabClasses('assignments')}>
                      Assignments
                  </button>
                  <button onClick={() => setActiveTab('students')} className={getTabClasses('students')}>
                      Students ({enrolledStudents.length})
                  </button>
              </nav>
          </div>
      </div>

      {/* Tab Content Area */} 
      <div className="mt-5"> {/* Adjusted top margin */}
          {renderTabContent()}
      </div>
    </div>
  );
} 