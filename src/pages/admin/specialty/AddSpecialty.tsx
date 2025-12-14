import { useState } from 'react'; // Bỏ import useEffect
import { useNavigate } from 'react-router-dom';
import { uploadFilesApi } from '../../../services/fileService';
import { createSpecialtyApi } from '../../../services/specialtyService';
import type { SpecialtyRequest } from '../../../types/specialty.types';
import styles from './AddSpecialty.module.css';

export const AddSpecialty = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // State lưu mảng các file và URL preview
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- ĐÃ XÓA BỎ useEffect DỌN DẸP BỘ NHỚ Ở ĐÂY ĐỂ TRÁNH LỖI ---

  // Xử lý khi người dùng chọn file từ input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // 1. Lấy danh sách file mới chọn
      const newFiles = Array.from(e.target.files);
      
      // 2. Tạo URL preview cho các file mới
      const newUrls = newFiles.map(file => URL.createObjectURL(file));

      // 3. Cập nhật state: Nối thêm vào danh sách cũ
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      setPreviewUrls(prevUrls => [...prevUrls, ...newUrls]);

      // Reset giá trị input để có thể chọn lại cùng file nếu muốn
      e.target.value = ''; 
    }
  };

  // Xử lý xóa 1 ảnh
  const handleRemoveImage = (indexToRemove: number) => {
    // 1. QUAN TRỌNG: Chỉ xóa bộ nhớ của ĐÚNG ảnh đang bị xóa
    URL.revokeObjectURL(previewUrls[indexToRemove]);

    // 2. Xóa file khỏi state selectedFiles
    setSelectedFiles(prevFiles => 
      prevFiles.filter((_, index) => index !== indexToRemove)
    );

    // 3. Xóa URL khỏi state previewUrls
    setPreviewUrls(prevUrls => 
      prevUrls.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (selectedFiles.length === 0) {
        setError("Vui lòng chọn ít nhất một ảnh.");
        setLoading(false);
        return;
    }

    try {
      // BƯỚC 1: Upload danh sách ảnh
      const uploadResponse = await uploadFilesApi(selectedFiles);
      const finalImageUrls = uploadResponse.data.urls;

      // BƯỚC 2: Gửi dữ liệu xuống backend
      const specialtyData: SpecialtyRequest = {
        name: name,
        description: description,
        imageUrls: finalImageUrls
      };

      await createSpecialtyApi(specialtyData);
      
      alert("Thêm chuyên khoa thành công!");
      navigate('/admin');

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo chuyên khoa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Thêm Chuyên Khoa Mới</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Tên Chuyên Khoa <span style={{color: 'red'}}>*</span></label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} placeholder="Ví dụ: Khoa Tim Mạch" />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>Mô Tả</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={styles.textarea} placeholder="Nhập mô tả..." />
            </div>

          {/* Upload Nhiều Ảnh */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Hình Ảnh (Chọn nhiều)</label>
            
            <div className={styles.fileUploadWrapper}>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <div className={styles.uploadLabel}>
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} ảnh đã được chọn. Nhấn để chọn thêm.` 
                  : "Kéo thả hoặc nhấn để chọn các ảnh"}
              </div>
            </div>

            {/* Hiển thị Preview */}
            {previewUrls.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '15px' }}>
                {previewUrls.map((url, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img 
                      src={url} 
                      alt={`Preview ${index}`} 
                      className={styles.previewImage}
                    />
                    <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveImage(index)}
                        title="Xóa ảnh này"
                    >
                        ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Đang xử lý...' : 'Tạo Chuyên Khoa'}
          </button>
        </form>
      </div>
    </div>
  );
};