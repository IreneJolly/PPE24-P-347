import React, { useEffect, useState } from 'react';
import { ProgressSectionProps } from '../types';
import { createClient } from '@/lib/supabase/client';

export default function ProgressSection({
  courses,
  selectedCourse,
  setSelectedCourse,
  user
}: ProgressSectionProps) {
  const supabase = createClient();

  const [courseProgressList, setCourseProgressList] = useState<{ id: number; progress: number }[]>([]);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      const progressList = await Promise.all(courses.map(async (course) => {
        // Récupérer les compétences pour le cours  
        const { data: competencies, error: competenciesError } = await supabase
          .from('competence')
          .select('*')
          .eq('course_id', course.id);

        if (competenciesError || !competencies) {
          console.error('Error fetching competencies for course:', competenciesError);
          return { id: course.id, progress: 0 }; // Retourner 0 si erreur  
        }

        // Récupérer les compétences validées pour l'utilisateur  
        const { data: validatedCompetencies, error: validatedCompetenciesError } = await supabase
          .from('competence_val')
          .select('competence_id')
          .eq('student_id', user.id); // Changez ceci selon la structure de votre base de données

        if (validatedCompetenciesError) {
          console.error('Error fetching validated competencies:', validatedCompetenciesError);
          return { id: course.id, progress: 0 }; // Retourner 0 si erreur  
        }

        const validatedIds = validatedCompetencies.map(entry => entry.competence_id);
        const totalCompetencies = competencies.length;
        const validatedCount = competencies.filter(competency => validatedIds.includes(competency.id)).length;

        const progress = totalCompetencies > 0 ? (validatedCount / totalCompetencies) * 100 : 0;
        return { id: course.id, progress };
      }));

      setCourseProgressList(progressList);
    };

    fetchCourseProgress();
  }, [courses, user]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">My Progress</h2>
      <div className="space-y-6">
        {courses.map((course) => {
          const courseProgress = courseProgressList.find(item => item.id === course.id)?.progress || 0; // Récupérer la progression de chaque cours

          return (
            <div
              key={course.id}
              className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${selectedCourse?.id === course.id ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              onClick={() => setSelectedCourse(course)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium text-gray-900">{course.title}</h3>
                <span className="text-sm text-gray-500">{Math.round(courseProgress)}%</span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${Math.round(courseProgress)}%` }}
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
          );
        })}
      </div>
    </div>
  );
}