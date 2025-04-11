import { useState } from 'react';
import { AddMaterialModalProps } from '../types';
import { createClient } from '@/lib/supabase/client';

// Initialize Supabase client ONCE outside the component
const supabase = createClient();

export default function AddMaterialModal({
  isOpen,
  onClose,
  courseId,
  onMaterialAdded,
  userId
}: AddMaterialModalProps & { userId?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen || !courseId) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMaterialFile(e.target.files[0]);
    } else {
      setMaterialFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!materialFile || !courseId || !userId) {
      console.error('File, Course ID, or User ID is missing');
      alert('Please select a file and ensure user is logged in.')
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = materialFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `course_materials/${courseId}/${uniqueFileName}`;

      console.log(`Uploading file to path: ${filePath}`);

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('programmation')
        .upload(filePath, materialFile);

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        alert(`Storage Error: ${uploadError.message}`);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      const { data: urlData } = supabase.storage
        .from('programmation')
        .getPublicUrl(filePath);

      const fileUrl = urlData?.publicUrl;
      if (!fileUrl) {
        console.error('Could not get public URL for uploaded file');
        alert('Failed to get file URL after upload.');
        throw new Error('Failed to get public URL');
      }

      console.log('Public URL:', fileUrl);

      const { error: dbError } = await supabase
        .from('course_attachments')
        .insert([{
          course_id: courseId,
          title: title,
          description: description,
          file_url: fileUrl,
          uploaded_by: userId,
        }]);

      if (dbError) {
        console.error('Database insert error:', dbError);
        alert(`Database Error: ${dbError.message}`);
        throw dbError;
      }

      console.log('Database record created successfully');

      onMaterialAdded();
      setTitle('');
      setDescription('');
      setMaterialFile(null);
      (e.target as HTMLFormElement).reset();

    } catch (error) {
      console.error('Error during material upload process:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Course Material</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="material-title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="material-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="material-description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="material-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="material-file" className="block text-sm font-medium text-gray-700">File</label>
              <input
                id="material-file"
                type="file"
                onChange={handleFileChange}
                required
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {materialFile && (
                <p className="mt-1 text-xs text-green-600">Selected: {materialFile.name}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isUploading || !materialFile}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Material'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 