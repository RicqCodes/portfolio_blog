import { useParams, useNavigate } from 'react-router-dom';
import { usePost } from '@/hooks/usePosts';
import Layout from '@/components/Layout/Layout';
import Button from '@/components/Common/Button';
import PostPreview from '@/components/Preview/PostPreview';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

export default function PostView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = usePost(slug!);

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="text-red-600 dark:text-red-400">Post not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
            Preview
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
            View Post
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => navigate(`/posts/${post.slug}/edit`)} className="w-full sm:w-auto">
            Edit Post
          </Button>
          <Button variant="secondary" onClick={() => navigate('/posts')} className="w-full sm:w-auto">
            Back to List
          </Button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg p-4 sm:p-5 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Slug:</span>{' '}
            <span className="break-all">{post.slug}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Views:</span>{' '}
            {post.views}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Read Time:
            </span>{' '}
            {post.readTime} min
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Created:</span>{' '}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <PostPreview post={post} />
    </Layout>
  );
}
