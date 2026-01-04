import { useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import type { TagDto } from "@/types/tag.types";
import { useTags } from "@/hooks/useTags";

interface TagInputProps {
  tags: TagDto[];
  onChange: (tags: TagDto[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');
  const { data: existingTags = [] } = useTags();

  const normalizeTag = (value: string) => value.trim().toLowerCase();

  const suggestions = useMemo(() => {
    const query = normalizeTag(input);
    if (!query) return [];
    return existingTags
      .filter((tag) => normalizeTag(tag.name).includes(query))
      .filter(
        (tag) => !tags.some((selected) => normalizeTag(selected.name) === normalizeTag(tag.name))
      )
      .slice(0, 6);
  }, [existingTags, input, tags]);

  const addTag = () => {
    const normalized = normalizeTag(input);
    if (normalized && !tags.find((t) => normalizeTag(t.name) === normalized)) {
      const existing = existingTags.find((tag) => normalizeTag(tag.name) === normalized);
      onChange([...tags, { name: existing?.name || input.trim() }]);
      setInput('');
    }
  };

  const removeTag = (tagName: string) => {
    onChange(tags.filter((t) => t.name !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addSuggestedTag = (tagName: string) => {
    const normalized = normalizeTag(tagName);
    if (!tags.find((t) => normalizeTag(t.name) === normalized)) {
      onChange([...tags, { name: tagName }]);
    }
    setInput('');
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Tags
      </label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-medium"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.name)}
                className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-3 bg-violet-100 dark:bg-violet-900/50 hover:bg-violet-200 dark:hover:bg-violet-800 text-violet-700 dark:text-violet-300 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          {suggestions.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onClick={() => addSuggestedTag(tag.name)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
