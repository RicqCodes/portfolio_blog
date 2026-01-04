import type { ElementType } from 'react';
import type { BlogPostResponseDto } from '@/types/post.types';
import type { ContentBlockDto } from '@/types/block.types';

interface PostPreviewProps {
  post: Partial<BlogPostResponseDto> & { contentBlocks: ContentBlockDto[] };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderInlineCode = (value?: string) => {
    if (!value) return "";
    const escaped = escapeHtml(value);
    return escaped.replace(/`([^`]+)`/g, (_match, code) => {
      return `<code>${code}</code>`;
    });
  };

  const renderBlock = (block: ContentBlockDto, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <p
            key={index}
            className="text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderInlineCode(block.content) }}
          />
        );

      case 'heading':
        const HeadingTag: ElementType = (block.title?.type || 'h2') as ElementType;
        const headingClasses = {
          h1: 'text-4xl font-bold text-gray-900 dark:text-white',
          h2: 'text-3xl font-bold text-gray-900 dark:text-white',
          h3: 'text-2xl font-semibold text-gray-900 dark:text-white',
          h4: 'text-xl font-semibold text-gray-900 dark:text-white',
          h5: 'text-lg font-semibold text-gray-900 dark:text-white',
          h6: 'text-base font-semibold text-gray-900 dark:text-white',
          p: 'text-base text-gray-900 dark:text-gray-100',
        };
        return (
          <HeadingTag
            key={index}
            className={headingClasses[block.title?.type || 'h2']}
          >
            {block.title?.text}
          </HeadingTag>
        );

      case 'image':
        return (
          <div key={index} className="my-6">
            {block.imageUrl && (
              <img
                src={block.imageUrl}
                alt={block.content || 'Post image'}
                className="w-full rounded-2xl shadow-md"
              />
            )}
            {block.content && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                {block.content}
              </p>
            )}
          </div>
        );

      case 'code':
        return (
          <pre key={index} className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-2xl overflow-x-auto">
            <code>{block.content}</code>
          </pre>
        );

      case 'list':
        const ListTag = block.list?.type === 'ordered' ? 'ol' : 'ul';
        const listClass = block.list?.type === 'ordered' ? 'list-decimal' : 'list-disc';
        return (
          <ListTag key={index} className={`${listClass} pl-6 space-y-1 text-gray-700 dark:text-gray-300`}>
            {block.list?.content.map((item, i) => (
              <li
                key={i}
                className="text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: renderInlineCode(item) }}
              />
            ))}
          </ListTag>
        );

      case 'divider':
        return <hr key={index} className="border-t-2 border-gray-300 dark:border-gray-600 my-6" />;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-48 sm:h-64 object-cover rounded-xl sm:rounded-2xl mb-4 sm:mb-6"
        />
      )}

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
        {post.title || 'Untitled Post'}
      </h1>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          {post.tags.map((tag) => (
            <span
              key={tag.name}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-full text-xs sm:text-sm font-medium"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="prose max-w-none space-y-3 sm:space-y-4">
        {post.contentBlocks?.map((block, index) => renderBlock(block, index))}
      </div>
    </div>
  );
}
