'use client';

import React from 'react';
import { UpdateCompetenceModalProps } from '../types';

// Basic placeholder for the UpdateCompetenceModal
const UpdateCompetenceModal: React.FC<UpdateCompetenceModalProps> = ({
  isOpen,
  onClose,
  competence,
  onCompetenceUpdated,
}) => {
  if (!isOpen || !competence) {
    return null;
  }

  // Replace with actual modal implementation (e.g., using a dialog element or UI library)
  const modalStyle: React.CSSProperties = {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    backgroundColor: 'white', padding: '20px', borderRadius: '8px', zIndex: 1001,
    border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };
  const backdropStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 1000,
  };

  const handleUpdate = () => {
    // Add logic to update the competence here
    console.log('Updating competence:', competence); 
    // Call the callback function after successful update
    onCompetenceUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2>Update Competence: {competence.title}</h2>
        <p>Form fields to update competence details would go here.</p>
        {/* Example: Add input fields for title, description etc. */}
        <div style={{ marginTop: '15px' }}>
          <button onClick={handleUpdate} style={{ marginRight: '10px' }}>Save Changes</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateCompetenceModal; 