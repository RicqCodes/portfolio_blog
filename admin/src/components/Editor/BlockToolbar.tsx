import type { ContentBlockType } from '@/types/block.types';
import { useState } from 'react';

interface BlockToolbarProps {
  onAddBlock: (type: ContentBlockType) => void;
}

export default function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const blockTypes: { type: ContentBlockType; label: string; icon: string }[] = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'heading', label: 'Heading', icon: '📰' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'code', label: 'Code', icon: '💻' },
    { type: 'list', label: 'List', icon: '📋' },
    { type: 'divider', label: 'Divider', icon: '➖' },
  ];

  const handleAddBlock = (type: ContentBlockType) => {
    onAddBlock(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all hover:border-violet-500 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
      >
        + Add Block
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg z-10">
          <div className="p-2 grid grid-cols-2 gap-2">
            {blockTypes.map((block) => (
              <button
                key={block.type}
                type="button"
                onClick={() => handleAddBlock(block.type)}
                className="flex items-center gap-2 px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-xl transition-colors"
              >
                <span className="text-xl">{block.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {block.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
