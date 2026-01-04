import type { ContentBlockDto } from '@/types/block.types';

interface CodeBlockProps {
  block: ContentBlockDto;
  onChange: (block: ContentBlockDto) => void;
  onRemove: () => void;
}

export default function CodeBlock({ block, onChange, onRemove }: CodeBlockProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Code Block
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
          value={block.codeType || 'javascript'}
          onChange={(e) => onChange({ ...block, codeType: e.target.value })}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="bash">Bash</option>
          <option value="json">JSON</option>
        </select>
        <textarea
          value={block.content || ''}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          className="w-full rounded-xl border border-gray-800 dark:border-gray-700 bg-gray-900 dark:bg-black px-4 py-3 font-mono text-sm text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          rows={8}
          placeholder="Enter code..."
        />
      </div>
    </div>
  );
}
