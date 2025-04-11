'use client';

import React, { useState } from 'react';
import FeatureInfoModal from './FeatureInfoModal';

interface FeaturePlaceholderProps {
  featureName: string; // Name of the feature to display on the button
  className?: string; // Optional class name for styling the button
}

const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({ 
  featureName,
  className
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Basic button styling. Enhance with CSS classes as needed.
  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    margin: '5px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
  };

  return (
    <>
      <button 
        style={buttonStyle}
        className={className} 
        onClick={openModal}
        title={`Information sur: ${featureName}`} // Tooltip
      >
        {featureName} (Bientôt disponible)
      </button>
      <FeatureInfoModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default FeaturePlaceholder; 