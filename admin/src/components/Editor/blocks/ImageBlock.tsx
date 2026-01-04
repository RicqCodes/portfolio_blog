import type { ContentBlockDto } from '@/types/block.types';
import ImageUpload from '@/components/Common/ImageUpload';
import { deleteImage } from '@/api/upload.api';
import toast from 'react-hot-toast';

interface ImageBlockProps {
  block: ContentBlockDto;
  onChange: (block: ContentBlockDto) => void;
  onRemove: () => void;
}

export default function ImageBlock({ block, onChange, onRemove }: ImageBlockProps) {
  const handleRemove = async () => {
    if (block.imageUrl?.includes('/uploads/')) {
      try {
        await deleteImage(block.imageUrl);
      } catch (error) {
        toast.error('Failed to remove image');
        console.error(error);
        return;
      }
    }
    onRemove();
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Image Block
        </span>
        <button
          onClick={handleRemove}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          type="button"
        >
          Remove
        </button>
      </div>
      <div className="space-y-4">
        <ImageUpload
          onUploadComplete={(url) => onChange({ ...block, imageUrl: url })}
          currentImageUrl={block.imageUrl}
          label="Block Image"
        />
        <input
          type="text"
          value={block.content || ''}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          placeholder="Image caption (optional)"
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
