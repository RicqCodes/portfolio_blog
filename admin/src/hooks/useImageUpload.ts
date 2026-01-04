import { useMutation } from '@tanstack/react-query';
import { uploadImage } from '@/api/upload.api';
import toast from 'react-hot-toast';

export const useImageUpload = () => {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
    onSuccess: () => {
      toast.success('Image uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });
};
