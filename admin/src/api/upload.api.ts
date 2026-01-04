import apiClient from './client';

interface UploadResponse {
  url: string;
  publicId: string;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const deleteImage = async (url: string) => {
  await apiClient.delete('/upload/image', {
    data: { url },
  });
};
