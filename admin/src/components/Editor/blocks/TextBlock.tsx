import type { ContentBlockDto } from '@/types/block.types';

interface TextBlockProps {
  block: ContentBlockDto;
  onChange: (block: ContentBlockDto) => void;
  onRemove: () => void;
}

export default function TextBlock({ block, onChange, onRemove }: TextBlockProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Text Block
        </span>
        <button
          onClick={onRemove}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          type="button"
        >
          Remove
        </button>
      </div>
      <textarea
        value={block.content || ''}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        rows={4}
        placeholder="Enter text content..."
      />
    </div>
  );
}
