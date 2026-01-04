import { useRef, useState } from 'react';
import { deleteImage, uploadImage } from '@/api/upload.api';
import { Upload, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function ImageUpload({
  onUploadComplete,
  currentImageUrl,
  label = 'Cover Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '');
  const [uploadedUrl, setUploadedUrl] = useState(currentImageUrl || '');
  const inputIdRef = useRef(
    `image-upload-${Math.random().toString(36).slice(2)}`
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const { url } = await uploadImage(file);
      setPreview(url);
      setUploadedUrl(url);
      onUploadComplete(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!uploadedUrl) {
      setPreview('');
      onUploadComplete('');
      return;
    }
    try {
      if (uploadedUrl.includes('/uploads/')) {
        await deleteImage(uploadedUrl);
      }
      setPreview('');
      setUploadedUrl('');
      onUploadComplete('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Image removed');
    } catch (error) {
      toast.error('Failed to remove image');
      console.error(error);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          id={inputIdRef.current}
          ref={fileInputRef}
          className="hidden"
        />
        {preview ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <ImageIcon className="w-4 h-4" />
                Current image
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 text-sm font-semibold rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800 transition-all"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="px-3 py-2 text-sm font-semibold rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-all inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
            />
          </div>
        ) : (
          <label
            htmlFor={inputIdRef.current}
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              uploading
                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                : 'border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:border-violet-400 dark:hover:border-violet-500'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-spin" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  Choose an image or drag and drop
                </span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
    </div>
  );
}
