import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePost, useUpdatePost } from '@/hooks/usePosts';
import { postSchema, type PostFormData } from '@/lib/validations';
import Layout from '@/components/Layout/Layout';
import Button from '@/components/Common/Button';
import TagInput from '@/components/Common/TagInput';
import ImageUpload from '@/components/Common/ImageUpload';
import BlockEditor from '@/components/Editor/BlockEditor';
import PostPreview from '@/components/Preview/PostPreview';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import type { UpdateBlogPostDto } from '@/types/post.types';
import type { ContentBlockDto } from '@/types/block.types';
import type { TagDto } from '@/types/tag.types';

export default function PostEdit() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading } = usePost(slug!);
  const updateMutation = useUpdatePost();

  const [coverImage, setCoverImage] = useState('');
  const [contentBlocks, setContentBlocks] = useState<ContentBlockDto[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    mode: 'onSubmit',
  });

  const titleValue = watch('title');

  const isNonEmptyString = (value?: string) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return trimmed !== 'undefined' && trimmed !== 'null';
  };

  const isValidImageUrl = (value?: string) => {
    if (!isNonEmptyString(value)) return false;
    if (typeof value === 'string' && value.startsWith('/uploads/')) return true;
    try {
      const parsed = new URL(value as string);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateAndSanitizeBlocks = (blocks: ContentBlockDto[]) => {
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      const position = i + 1;
      switch (block.type) {
        case 'text':
          if (!isNonEmptyString(block.content)) {
            toast.error(`Block ${position}: text content is required`);
            return null;
          }
          break;
        case 'heading':
          if (!block.title?.type || !isNonEmptyString(block.title?.text)) {
            toast.error(`Block ${position}: heading text is required`);
            return null;
          }
          break;
        case 'image':
          if (!isValidImageUrl(block.imageUrl)) {
            toast.error(`Block ${position}: image URL is invalid`);
            return null;
          }
          break;
        case 'code':
          if (!isNonEmptyString(block.content)) {
            toast.error(`Block ${position}: code content is required`);
            return null;
          }
          if (!isNonEmptyString(block.codeType)) {
            toast.error(`Block ${position}: code language is required`);
            return null;
          }
          break;
        case 'list':
          if (!block.list?.content?.length) {
            toast.error(`Block ${position}: list items are required`);
            return null;
          }
          if (block.list.content.some((item) => !item.trim())) {
            toast.error(`Block ${position}: list items cannot be empty`);
            return null;
          }
          break;
        case 'video':
          if (!isNonEmptyString(block.content)) {
            toast.error(`Block ${position}: video URL is required`);
            return null;
          }
          break;
        case 'divider':
          break;
        default:
          break;
      }
    }

    return blocks.map((block) => {
      const sanitized = { ...block } as ContentBlockDto & {
        id?: string;
        order?: number;
      };
      delete sanitized.id;
      delete sanitized.order;
      return sanitized;
    });
  };

  useEffect(() => {
    if (post) {
      reset({ title: post.title });
      setCoverImage(post.coverImage);
      setContentBlocks(post.contentBlocks || []);
      setTags(post.tags.map((t) => ({ name: t.name })));
    }
  }, [post, reset]);

  const onSubmit = async (data: PostFormData) => {
    if (contentBlocks.length === 0) {
      toast.error('At least one content block is required');
      return;
    }

    if (tags.length === 0) {
      toast.error('At least one tag is required');
      return;
    }

    if (!coverImage) {
      toast.error('Cover image is required');
      return;
    }

    const sanitizedBlocks = validateAndSanitizeBlocks(contentBlocks);
    if (!sanitizedBlocks) {
      return;
    }

    const updateData: UpdateBlogPostDto = {
      title: data.title,
      coverImage,
      contentBlocks: sanitizedBlocks,
      tags,
    };

    await updateMutation.mutateAsync({ id: post!.id, data: updateData });
    navigate('/posts');
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-red-600 dark:text-red-400">Post not found</div>
      </Layout>
    );
  }

  const previewData = {
    title: titleValue || '',
    coverImage,
    contentBlocks,
    tags: tags.map((t) => ({ name: t.name })),
  };

  return (
    <Layout>
      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Make changes to your published article</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
            type="button"
            className="w-full sm:w-auto"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/posts')} type="button" className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 sm:gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold">
                Title
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                placeholder="Enter post title"
                className={`w-full h-11 sm:h-12 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                  errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-xs sm:text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            <ImageUpload
              onUploadComplete={(url) => setCoverImage(url)}
              currentImageUrl={coverImage}
            />

            <TagInput tags={tags} onChange={setTags} />

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold mb-2">
                Content Blocks
              </label>
              <BlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Post'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Live Preview</h2>
              <PostPreview post={previewData} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
