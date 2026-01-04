import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useTags';
import { tagSchema, type TagFormData } from '@/lib/validations';
import Layout from '@/components/Layout/Layout';
import Button from '@/components/Common/Button';
import Modal from '@/components/Common/Modal';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Trash2 } from 'lucide-react';

export default function TagManagement() {
  const { data: tags, isLoading } = useTags();
  const createMutation = useCreateTag();
  const deleteMutation = useDeleteTag();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
  });

  const onSubmit = async (data: TagFormData) => {
    await createMutation.mutateAsync(data.name.trim());
    reset();
  };

  const handleDeleteClick = (tagName: string) => {
    setTagToDelete(tagName);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (tagToDelete) {
      await deleteMutation.mutateAsync(tagToDelete);
      setDeleteModalOpen(false);
      setTagToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 sm:mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
          Taxonomy
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
          Tag Management
        </h1>
      </div>

      {/* Create Tag Form */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Create New Tag
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                {...register('name')}
                placeholder="Enter tag name"
                className={`w-full h-11 sm:h-12 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'tag-name-error' : undefined}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="whitespace-nowrap w-full sm:w-auto">
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
          {errors.name && (
            <p id="tag-name-error" className="text-xs sm:text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.name.message}
            </p>
          )}
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold">
                  Tag Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
              {tags?.map((tag) => (
                <tr key={tag.name} className="hover:bg-violet-50/30 dark:hover:bg-violet-900/20 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-full text-xs sm:text-sm font-medium">
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(tag.name)}
                      className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tags?.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            No tags created yet
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Tag"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
          Are you sure you want to delete this tag? This action cannot be undone.
        </p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="w-full sm:w-auto">
            Delete
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
