import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Cần useParams để lấy ID từ URL
import { uploadFilesApi } from '../../../services/fileService';
import { updateSpecialtyApi, getSpecialtyByIdApi } from '../../../services/specialtyService'; // Import hàm update và getById
import type { SpecialtyRequest } from '../../../types/specialty.types';
import styles from './AddSpecialty.module.css'; // Tái sử dụng CSS của trang Add

export const EditSpecialty = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL (/admin/edit-specialty/1)
  
  // State form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // --- QUẢN LÝ ẢNH CŨ VÀ MỚI ---
  // 1. Ảnh cũ đang có trên server (URL chuỗi)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // 2. Ảnh mới người dùng vừa chọn thêm (File)
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // Loading khi tải dữ liệu ban đầu
  const [error, setError] = useState<string | null>(null);

  // --- 1. TẢI DỮ LIỆU CŨ KHI VÀO TRANG ---
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const response = await getSpecialtyByIdApi(Number(id));
        const data = response.data;
        
        setName(data.name);
        setDescription(data.description || '');
        
        // Set danh sách ảnh cũ
        if (data.imageUrls && data.imageUrls.length > 0) {
            setExistingImages(data.imageUrls);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin chuyên khoa.");
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [id]);

  // --- 2. XỬ LÝ CHỌN ẢNH MỚI ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...filesArray]);
      
      const urlsArray = filesArray.map(file => URL.createObjectURL(file));
      setNewPreviewUrls(prev => [...prev, ...urlsArray]);
      e.target.value = ''; 
    }
  };

  // --- 3. XỬ LÝ XÓA ẢNH ---
  // Xóa ảnh MỚI (chưa upload)
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviewUrls[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Xóa ảnh CŨ (đã có trên server)
  const removeExistingImage = (urlToRemove: string) => {
    if (window.confirm("Bạn có chắc muốn xóa ảnh này không?")) {
        setExistingImages(prev => prev.filter(url => url !== urlToRemove));
    }
  };

  // --- 4. XỬ LÝ SUBMIT (UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      // Bắt đầu với danh sách ảnh cũ còn lại
      let finalImageUrls: string[] = [...existingImages];

      // Nếu có ảnh mới, upload chúng
      if (newFiles.length > 0) {
        const uploadResponse = await uploadFilesApi(newFiles);
        // Gộp ảnh mới vào danh sách
        finalImageUrls = [...finalImageUrls, ...uploadResponse.data.urls];
      }

      const updateData: SpecialtyRequest = {
        name: name,
        description: description,
        imageUrls: finalImageUrls
      };

      await updateSpecialtyApi(Number(id), updateData);
      
      alert("Cập nhật chuyên khoa thành công!");
      navigate('/admin/specialties'); // Quay về danh sách

    } catch (err: any) {
      console.error(err);
      setError("Có lỗi xảy ra khi cập nhật.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className={styles.container}>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Cập Nhật Chuyên Khoa</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Tên Chuyên Khoa <span style={{color: 'red'}}>*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} />
            </div>
            <div className={styles.formGroup}>
                <label className={styles.label}>Mô Tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={styles.textarea} />
            </div>

          {/* --- KHU VỰC ẢNH --- */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Hình Ảnh</label>
            
            {/* Phần hiển thị ảnh CŨ */}
            {existingImages.length > 0 && (
                <div style={{marginBottom: '15px'}}>
                    <p style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px'}}>Ảnh hiện có:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {existingImages.map((url, index) => (
                            <div key={index} className={styles.previewItem}>
                                <img src={url} alt="Existing" className={styles.previewImage} />
                                <button type="button" className={styles.removeButton} onClick={() => removeExistingImage(url)}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Phần upload ảnh MỚI */}
            <div className={styles.fileUploadWrapper}>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className={styles.fileInput} />
              <div className={styles.uploadLabel}>Chọn thêm ảnh mới...</div>
            </div>

            {/* Phần hiển thị ảnh MỚI */}
            {newPreviewUrls.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <p style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px'}}>Ảnh mới chọn:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {newPreviewUrls.map((url, index) => (
                        <div key={index} className={styles.previewItem}>
                            <img src={url} alt="New Preview" className={styles.previewImage} />
                            <button type="button" className={styles.removeButton} onClick={() => removeNewImage(index)}>×</button>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>
      </div>
    </div>
  );
};