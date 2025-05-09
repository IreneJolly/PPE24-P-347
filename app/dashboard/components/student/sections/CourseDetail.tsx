import { useEffect, useState } from 'react';
import { CourseDetailProps } from '../types';
import { createClient } from '@/lib/supabase/client';

export default function CourseDetail({
  user,
  selectedCourse,
  courseMaterials,
  courseAssignments,
  courseCompetence
}: CourseDetailProps) {
  if (!selectedCourse) return null;

  const [selectedCompetences, setSelectedCompetences] = useState<number[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Exemple : Récupérez les compétences cochées depuis la base de données  
    const fetchCheckedCompetences = async () => {
      const { data, error } = await supabase  
        .from('competence_val')
        .select('competence_id')
        .eq('student_id', user.id); // Remplacez 'user.id' par l'ID de l'utilisateur actuel

      if (data) {
        // Mettez à jour l'état avec les IDs des compétences cochées  
        const checkedIds = data.map(entry => entry.competence_id);
        setSelectedCompetences(checkedIds);
      }

      if (error) {
        console.error('Error fetching checked competences:', error);
      }
    };

    fetchCheckedCompetences();
  }, []); // Dépendance vide pour exécuter une fois au montage du composant


  const handleCheckboxChange = async (competenceId: number, isChecked: boolean) => {
    if (isChecked) {
      const { data, error } = await supabase  
        .from('competence_val')
        .insert({
          competence_id: competenceId,
          student_id: user.id  
        });

      if (error) {
        console.error('Error adding competence:', error);
      } else {
        setSelectedCompetences(prev => [...prev, competenceId]); // Mettre à jour l'état  
      }
    } else {
      const { data, error } = await supabase  
        .from('competence_val')
        .delete()
        .eq('competence_id', competenceId)
        .eq('student_id', user.id);

      if (error) {
        console.error('Error removing competence:', error);
      } else {
        setSelectedCompetences(prev => prev.filter(id => id !== competenceId)); // Mettre à jour l'état  
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{selectedCourse.title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">{selectedCourse.description}</p>

      {/* Tabs for course content */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Course Materials */}
        <div className="p-3 bg-white rounded shadow min-h-[200px]"> {/* Ajout de min-h */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Course Materials</h4>
          </div>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {courseMaterials.length > 0 ? (
              courseMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div>
                    <a 
                      href={material.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {material.title}
                    </a>
                    <div className="text-xs text-gray-500 mt-1">{material.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {new Date(material.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No materials added yet</p>
            )}
          </div>
        </div>

        {/* Course Assignments */}
        <div className="p-3 bg-white rounded shadow min-h-[200px]"> {/* Ajout de min-h */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Assignments</h4>
          </div>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {courseAssignments.length > 0 ? (
              courseAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>
                    <div className="font-medium">{assignment.title}</div>
                    <div className="text-xs text-gray-500">{assignment.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">
                      Due: {new Date(assignment.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {assignment.max_attempts ? `${assignment.max_attempts} attempts` : 'Unlimited attempts'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No assignments added yet</p>
            )}
          </div>
        </div>

        {/* Course Competence */}
        <div className="p-3 bg-white rounded shadow col-span-2"> {/* Ajout de col-span-2 */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500 uppercase">Course Competence</h4>
          </div>
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {courseCompetence.length > 0 ? (
              courseCompetence.map((competence) => (
                <div
                  key={competence.id}
                  className="flex items-center justify-between p-2 border rounded text-sm cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 text-blue-600" 
                    checked={selectedCompetences.includes(competence.id)} // Vérifiez si l'ID est dans l'état  
                    onChange={(e) => handleCheckboxChange(competence.id, e.target.checked)} 
                  />
                    <div>
                      <div className="font-medium">{competence.competence}</div>
                      <div className="text-xs text-gray-500">{competence.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {new Date(competence.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No competencies added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}