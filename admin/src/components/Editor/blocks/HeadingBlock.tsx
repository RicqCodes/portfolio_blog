import type { ContentBlockDto } from '@/types/block.types';

interface HeadingBlockProps {
  block: ContentBlockDto;
  onChange: (block: ContentBlockDto) => void;
  onRemove: () => void;
}

export default function HeadingBlock({ block, onChange, onRemove }: HeadingBlockProps) {
  const headingType = block.title?.type || 'h2';
  const headingText = block.title?.text || '';

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Heading Block
        </span>
        <button
          onClick={onRemove}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          type="button"
        >
          Remove
        </button>
      </div>
      <div className="space-y-2">
        <select
          value={headingType}
          onChange={(e) =>
            onChange({
              ...block,
              title: {
                type: e.target.value as any,
                text: headingText,
              },
            })
          }
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
          }}
        >
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="h5">H5</option>
          <option value="h6">H6</option>
          <option value="p">Paragraph</option>
        </select>
        <input
          type="text"
          value={headingText}
          onChange={(e) =>
            onChange({
              ...block,
              title: {
                type: headingType as any,
                text: e.target.value,
              },
            })
          }
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Enter heading text..."
        />
      </div>
    </div>
  );
}
