import { useState } from 'react';
import { AddCompetenceModalProps } from '../types';
import { createClient } from '@/lib/supabase/client';

// Initialize Supabase client ONCE outside the component
const supabase = createClient();

export default function AddCompetenceModal({
    isOpen,
    onClose,
    courseId,
    onCompetenceAdded
}: AddCompetenceModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen || !courseId) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!courseId) {
            console.error('Course ID is missing');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('competence')
                .insert([{
                    course_id: courseId,
                    competence: title,
                    description: description
                }]);

            if (error) {
                console.error('Error adding competence via modal:', error);
                alert(`Failed to add competence: ${error.message}`);
                throw error;
            }

            onCompetenceAdded();
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error adding competence:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Competence</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="competence-title" className="block text-sm font-medium text-gray-700">Competence Title</label>
                            <input
                                type="text"
                                id="competence-title"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="competence-description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="competence-description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </>
                            ) : (
                                'Add Competence'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 