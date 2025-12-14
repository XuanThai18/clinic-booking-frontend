import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFilesApi } from '../../../services/fileService';
import { createClinicApi, updateClinicApi, getClinicByIdApi} from '../../../services/clinicService';
import type { ClinicRequest } from '../../../types/clinic.types';
import styles from '../specialty/AddSpecialty.module.css'; // Tái sử dụng CSS Form

export const ClinicForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // State form
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  
  // --- STATE QUẢN LÝ NHIỀU ẢNH ---
  // 1. Ảnh cũ từ server (Set<String> -> string[])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  // 2. Ảnh mới chọn (File[])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // 3. Preview ảnh mới (string[])
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  
  // Tải dữ liệu cũ nếu đang Edit
  useEffect(() => {
    if (isEditMode && id) {
      const loadData = async () => {
        try {
          const response = await getClinicByIdApi(Number(id));
          const data = response.data;
          setName(data.name);
          setAddress(data.address);
          setPhoneNumber(data.phoneNumber || '');
          setDescription(data.description || '');
          
          // Load ảnh cũ (Nếu có)
          if (data.imageUrls && data.imageUrls.length > 0) {
            setExistingImageUrls(data.imageUrls);
          }
        } catch (err) {
          console.error(err);
          alert("Lỗi tải dữ liệu phòng khám.");
        }
      };
      loadData();
    }
  }, [id, isEditMode]);

  // --- XỬ LÝ CHỌN NHIỀU FILE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      // Nối thêm file mới vào danh sách
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      // Tạo URL preview cho file mới
      const urlsArray = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urlsArray]);

      e.target.value = ''; // Reset input để chọn tiếp
    }
  };

  // --- XỬ LÝ XÓA ẢNH MỚI ---
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]); // Dọn bộ nhớ
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // --- XỬ LÝ XÓA ẢNH CŨ ---
  const removeExistingImage = (urlToRemove: string) => {
    if (window.confirm("Xóa ảnh này khỏi phòng khám?")) {
        setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
    }
  };

  // --- XỬ LÝ SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Bắt đầu với danh sách ảnh cũ còn giữ lại
      let finalImageUrls = [...existingImageUrls];

      // Nếu có ảnh MỚI thì upload
      if (selectedFiles.length > 0) {
        const uploadResponse = await uploadFilesApi(selectedFiles);
        // Nối ảnh mới upload xong vào danh sách
        finalImageUrls = [...finalImageUrls, ...uploadResponse.data.urls];
      }

      const clinicData: ClinicRequest = {
        name,
        address,
        phoneNumber,
        description,
        // Gửi lên mảng nhiều ảnh
        imageUrls: finalImageUrls
      };

      if (isEditMode && id) {
        await updateClinicApi(Number(id), clinicData);
        alert("Cập nhật phòng khám thành công!");
      } else {
        await createClinicApi(clinicData);
        alert("Thêm phòng khám thành công!");
      }
      
      navigate('/admin/clinics');

    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>
            {isEditMode ? "Cập Nhật Phòng Khám" : "Thêm Phòng Khám Mới"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Các ô nhập liệu (Giữ nguyên) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên Phòng Khám (*)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Địa Chỉ (*)</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} required className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Số Điện Thoại</label>
            <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mô Tả</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={styles.textarea} />
          </div>

          {/* --- KHU VỰC ẢNH (NÂNG CẤP) --- */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Hình Ảnh (Chọn nhiều)</label>
            
            {/* 1. Hiển thị và Xóa Ảnh CŨ */}
            {existingImageUrls.length > 0 && (
                <div style={{marginBottom: '15px'}}>
                    <p style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px'}}>Ảnh hiện có:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {existingImageUrls.map((url, index) => (
                            <div key={index} className={styles.previewItem}>
                                <img src={url} alt="Existing" className={styles.previewImage} />
                                {/* Nút xóa ảnh cũ */}
                                <button type="button" className={styles.removeButton} onClick={() => removeExistingImage(url)}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Input chọn ảnh MỚI (Có multiple) */}
            <div className={styles.fileUploadWrapper}>
              <input 
                type="file" 
                accept="image/*" 
                multiple // <-- QUAN TRỌNG
                onChange={handleFileChange} 
                className={styles.fileInput} 
              />
              <div className={styles.uploadLabel}>
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} ảnh mới được chọn` 
                  : "Chọn thêm ảnh mới..."}
              </div>
            </div>

            {/* 3. Hiển thị và Xóa Preview ảnh MỚI */}
            {previewUrls.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <p style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px'}}>Ảnh mới chọn:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {previewUrls.map((url, index) => (
                        <div key={index} className={styles.previewItem}>
                            <img src={url} alt="New Preview" className={styles.previewImage} />
                            {/* Nút xóa ảnh mới */}
                            <button type="button" className={styles.removeButton} onClick={() => removeNewImage(index)}>×</button>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Đang xử lý...' : (isEditMode ? 'Lưu Thay Đổi' : 'Tạo Phòng Khám')}
          </button>
        </form>
      </div>
    </div>
  );
};