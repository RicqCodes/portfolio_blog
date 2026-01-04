import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { ContentBlockDto } from '@/types/block.types';

interface ListBlockProps {
  block: ContentBlockDto;
  onChange: (block: ContentBlockDto) => void;
  onRemove: () => void;
}

export default function ListBlock({ block, onChange, onRemove }: ListBlockProps) {
  const [newItem, setNewItem] = useState('');
  const listType = block.list?.type || 'unordered';
  const items = block.list?.content || [];

  const addItem = () => {
    if (newItem.trim()) {
      onChange({
        ...block,
        list: {
          type: listType,
          content: [...items, newItem.trim()],
        },
      });
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange({
      ...block,
      list: {
        type: listType,
        content: items.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          List Block
        </span>
        <button
          onClick={onRemove}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          type="button"
        >
          Remove
        </button>
      </div>
      <div className="space-y-3">
        <select
          value={listType}
          onChange={(e) =>
            onChange({
              ...block,
              list: {
                type: e.target.value as 'ordered' | 'unordered',
                content: items,
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
          <option value="unordered">Unordered (bullets)</option>
          <option value="ordered">Ordered (numbers)</option>
        </select>

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium w-6 text-center">
              {listType === 'ordered' ? `${index + 1}.` : '•'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index] = e.target.value;
                onChange({
                  ...block,
                  list: { type: listType, content: newItems },
                });
              }}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              onClick={() => removeItem(index)}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
            placeholder="Add list item..."
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <button
            onClick={addItem}
            type="button"
            className="px-4 py-3 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
