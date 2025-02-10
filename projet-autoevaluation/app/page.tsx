'use client'
import React, { useRef, useState } from 'react';

const courses = [
  { id: 1, title: 'Cours 1', progress: 75 },
  { id: 2, title: 'Cours 2', progress: 50 },
  { id: 3, title: 'Cours 3', progress: 30 },
  { id: 4, title: 'Cours 4', progress: 10 },
  { id: 5, title: 'Cours 5', progress: 100 },
  { id: 6, title: 'Cours 6', progress: 90 },
  { id: 7, title: 'Cours 7', progress: 5 },
];

const upcomingAssignments = [
  { id: 1, title: 'Rendu 1', dueDate: '2025-02-15' },
  { id: 2, title: 'Rendu 2', dueDate: '2025-02-12' },
];

const sortAssignments = (assignments: { id: number; title: string; dueDate: string }[]) => {
  return assignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

const CoursesPage: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 4;

  const scrollLeft = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - itemsToShow);
    }
  };

  const scrollRight = () => {
    if (startIndex + itemsToShow < courses.length) {
      setStartIndex(startIndex + itemsToShow);
    }
  };

  const sortedAssignments = sortAssignments(upcomingAssignments);

  return (
    <div className="page-container">
        <div className="carousel">
        <h2>Modules en cours</h2>
          <div className="carousel-container relative flex items-center">
            {/* Boutons de navigation */}
            <button onClick={scrollLeft} disabled={startIndex === 0} className="nav-button absolute left-0">
              ◀  
            </button>

            <div className="carousel-items" ref={carouselRef}>
              {courses.slice(startIndex, startIndex + itemsToShow).map(course => (
                <div key={course.id} className="carousel-item text-center">
                  <h3 className="font-semibold">{course.title}</h3>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${course.progress}%` }} />
                  </div>
                  <p>Progression : {course.progress}%</p>
                </div>
              ))}
            </div>

            <button onClick={scrollRight} disabled={startIndex + itemsToShow >= courses.length} className="nav-button absolute right-0">
              ▶  
            </button>
          </div>
        </div>
        <div className="assignments mt-8">
          <h2 className="text-2xl font-bold mb-4">Prochains rendus obligatoires</h2> {/* Titre agrandi */}
          <ul className="assignment-list">
            {sortedAssignments.map(assignment => (
              <li key={assignment.id} className="assignment-item">
                <h3>{assignment.title} - Échéance : {assignment.dueDate}</h3>
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
};

export default CoursesPage;