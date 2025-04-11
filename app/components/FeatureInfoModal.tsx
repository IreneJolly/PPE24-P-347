'use client';

import React from 'react';

interface FeatureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureInfoModal: React.FC<FeatureInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  // Basic inline styles for demonstration. Consider using CSS modules or a UI library.
  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'relative', // Needed for close button positioning
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside modal */}
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        <h2>Objectif de l'Application</h2>
        <p>
          Bienvenue sur notre plateforme ! Notre objectif est de fournir une expérience éducative 
          centralisée et efficace pour les étudiants, enseignants et administrateurs. 
          De nouvelles fonctionnalités seront bientôt ajoutées ici pour améliorer votre expérience.
        </p>
        <button onClick={onClose} style={{ marginTop: '15px', padding: '8px 15px' }}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default FeatureInfoModal; 