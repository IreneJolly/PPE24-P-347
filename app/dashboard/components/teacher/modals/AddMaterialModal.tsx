import { useState } from 'react';
import { AddMaterialModalProps } from '../types';
import { createClient } from '@supabase/supabase-js';

export default function AddMaterialModal({
  isOpen,
  onClose,
  selectedCourse,
  onAddCourseMaterial
}: AddMaterialModalProps) {
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  // Récupérer les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string ?? '';  // URL de Supabase
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string ?? '';  // Clé anonyme de Supabase

  // Créer le client Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  if (!isOpen || !selectedCourse) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMaterialFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!materialFile || !selectedCourse || !supabase) {
      console.error('Required parameters are missing');
      return; // Quittez la fonction si une valeur requise est manquante  
    }

    setIsUploadingMaterial(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const courseId = selectedCourse.id; 
      const filePath = `course_materials/${courseId}/${materialFile.name}`;

      await onAddCourseMaterial({
        courseId,
        title,
        fileUrl: filePath,
        description,
        file: materialFile
      });

      console.log("Test : ", filePath);

      onClose();
    } catch (error) {
      console.error('Error uploading material:', error);
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Course Material</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <div className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700">
                {selectedCourse.title}
                <input type="hidden" name="courseId" value={selectedCourse.id} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isUploadingMaterial}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              disabled={isUploadingMaterial || !materialFile}
            >
              {isUploadingMaterial ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 