import api from '../lib/axios';

// Hàm upload NHIỀU file (nhận vào mảng File[])
export const uploadFilesApi = (files: File[]) => {
  const formData = new FormData();

  // Duyệt qua từng file trong mảng và nhét vào FormData
  // QUAN TRỌNG: Key phải là 'files' để khớp với @RequestParam("files") bên backend
  files.forEach((file) => {
    formData.append('files', file);
  });

  // Gọi đến endpoint upload-multiple
  // Mong đợi nhận về object chứa mảng urls: { urls: string[] }
  return api.post<{ urls: string[] }>('/admin/files/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};