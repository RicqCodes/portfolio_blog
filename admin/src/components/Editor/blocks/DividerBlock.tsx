interface DividerBlockProps {
  onRemove: () => void;
}

export default function DividerBlock({ onRemove }: DividerBlockProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Divider Block
        </span>
        <button
          onClick={onRemove}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          type="button"
        >
          Remove
        </button>
      </div>
      <hr className="border-t-2 border-gray-300 dark:border-gray-600" />
    </div>
  );
}
