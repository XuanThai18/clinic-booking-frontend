import { useState, useEffect } from 'react';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import { useAuth } from '../../../store/AuthContext';

// Services
import { uploadFilesApi } from '../../../services/fileService';
import { getMyDoctorProfileApi, updateMyDoctorProfileApi } from '../../../services/doctorService';
import { updateMyProfileApi } from '../../../services/patientService'; // Dùng chung API update User

// Types
import type { Gender } from '../../../types/auth.types';

// CSS (Tái sử dụng CSS của Admin cho đẹp)
import styles from '../../admin/user/UserForm.module.css'; 

const genderOptions = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'OTHER', label: 'Khác' }
];

// Style Select (Copy từ DoctorForm)
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base, padding: '2px', borderRadius: '8px', borderColor: '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 123, 255, 0.15)' : 'none',
    backgroundColor: state.isDisabled ? '#e9ecef' : 'white'
  }),
  menu: (base: any) => ({ ...base, zIndex: 9999 })
};

export const DoctorProfile = () => {
  const { user, login } = useAuth(); // Để cập nhật lại context sau khi save
  const [loading, setLoading] = useState(false);

  // --- STATE USER INFO ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');

  // --- STATE DOCTOR INFO ---
  const [description, setDescription] = useState('');
  const [academicDegree, setAcademicDegree] = useState('');
  const [specialtyName, setSpecialtyName] = useState(''); // Read-only
  const [clinicName, setClinicName] = useState('');       // Read-only
  const [price, setPrice] = useState<number>(0);          // Read-only

  // --- STATE ẢNH ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [certPreviews, setCertPreviews] = useState<string[]>([]);
  const [existingCertImages, setExistingCertImages] = useState<string[]>([]);

  // 1. LOAD DỮ LIỆU
  useEffect(() => {
    const loadData = async () => {
        try {
            // Gọi API lấy hồ sơ chi tiết của Bác sĩ (bao gồm cả User info)
            const res = await getMyDoctorProfileApi();
            const data = res.data;

            // Fill User Info
            setFullName(data.fullName);
            setEmail(data.email);
            setPhoneNumber(data.phoneNumber || '');
            setAddress(data.address || '');
            if (data.gender) setGender(data.gender);
            if (data.birthday) setBirthday(data.birthday);

            // Fill Doctor Info
            setDescription(data.description || '');
            setAcademicDegree(data.academicDegree || '');
            setPrice(data.price);
            setSpecialtyName(data.specialty?.name || '');
            setClinicName(data.clinic?.name || '');

            // Fill Images
            setCurrentAvatar(data.image || null);
            if (data.otherImages) setExistingCertImages(data.otherImages);

        } catch (err) {
            console.error(err);
            alert("Lỗi tải hồ sơ.");
        }
    };
    loadData();
  }, []);

  // ... (COPY CÁC HÀM XỬ LÝ ẢNH TỪ DoctorForm.tsx VÀO ĐÂY: handleAvatarChange, removeNewAvatar...) ...
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (avatarPreview) URL.revokeObjectURL(avatarPreview);
          setAvatarFile(file);
          setAvatarPreview(URL.createObjectURL(file));
          e.target.value = '';
      }
  };
  const removeNewAvatar = () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
  };
  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const filesArray = Array.from(e.target.files);
          setCertFiles(prev => [...prev, ...filesArray]);
          const urlsArray = filesArray.map(file => URL.createObjectURL(file));
          setCertPreviews(prev => [...prev, ...urlsArray]);
          e.target.value = '';
      }
  };
  const removeNewCert = (index: number) => {
      URL.revokeObjectURL(certPreviews[index]);
      setCertFiles(prev => prev.filter((_, i) => i !== index));
      setCertPreviews(prev => prev.filter((_, i) => i !== index));
  };
  const removeExistingCert = (urlToRemove: string) => {
      if (window.confirm("Xóa ảnh này?")) {
          setExistingCertImages(prev => prev.filter(url => url !== urlToRemove));
      }
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Upload Ảnh mới (Nếu có)
        let finalAvatarUrl = currentAvatar || '';
        if (avatarFile) {
            const res = await uploadFilesApi([avatarFile]);
            finalAvatarUrl = res.data.urls[0];
        }

        let finalCertUrls = [...existingCertImages];
        if (certFiles.length > 0) {
            const res = await uploadFilesApi(certFiles);
            finalCertUrls = [...finalCertUrls, ...res.data.urls];
        }

        // 2. Gọi API cập nhật User Info (Tên, SĐT...)
        await updateMyProfileApi({
            fullName, phoneNumber, address, 
            gender: gender as Gender, 
            birthday
        });

        // 3. Gọi API cập nhật Doctor Info (Mô tả, Học vị, Ảnh)
        const doctorData = {
            description,
            academicDegree,
            image: finalAvatarUrl,
            otherImages: finalCertUrls
        };
        await updateMyDoctorProfileApi(doctorData);

        // 4. Cập nhật lại Context (để Navbar hiện tên mới nếu có sửa tên)
        if (user) {
            const token = localStorage.getItem('accessToken') || '';
            login(token, { ...user, fullName, gender: gender as Gender }); 
        }

        alert("Cập nhật hồ sơ thành công!");

    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi cập nhật.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Hồ Sơ Bác Sĩ Của Tôi</h2>
        
        <form onSubmit={handleSubmit}>
            {/* I. THÔNG TIN CÁ NHÂN */}
            <h4 style={{marginTop: 0, color: '#007bff', borderBottom: '1px solid #eee', paddingBottom: 5}}>I. Thông Tin Cá Nhân</h4>
            
            <div className={styles.row}>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Họ Tên (*)</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={styles.input} />
                </div>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Email (Không thể thay đổi)</label>
                    <input type="email" value={email} disabled className={styles.input} />
                </div>
            </div>

            <div className={styles.row}>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Số Điện Thoại</label>
                    <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={styles.input} />
                </div>
                 <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Địa Chỉ</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={styles.input} />
                </div>
            </div>

            <div className={styles.row}>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Giới Tính</label>
                    <Select 
                        options={genderOptions} 
                        value={genderOptions.find(o => o.value === gender) || null} 
                        onChange={(opt) => setGender(opt?.value || '')} 
                        styles={customSelectStyles} 
                        placeholder="Chọn giới tính..."
                    />
                </div>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Ngày Sinh</label>
                    <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={styles.input} style={{height: '45px'}} />
                </div>
            </div>

            {/* II. THÔNG TIN CHUYÊN MÔN */}
            <h4 style={{marginTop: 20, color: '#007bff', borderBottom: '1px solid #eee', paddingBottom: 5}}>II. Thông Tin Chuyên Môn</h4>
            
            <div className={styles.row}>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Chuyên Khoa (Liên hệ Admin để đổi)</label>
                    <input type="text" value={specialtyName} disabled className={styles.input} />
                </div>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Phòng Khám (Liên hệ Admin để đổi)</label>
                    <input type="text" value={clinicName} disabled className={styles.input} />
                </div>
            </div>

            <div className={styles.row}>
                 <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Giá Khám (VND) (Liên hệ Admin để đổi)</label>
                    <NumericFormat value={price} displayType="input" thousandSeparator suffix=" ₫" disabled className={styles.input} />
                </div>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Học vị</label>
                    <input className={styles.input} value={academicDegree} onChange={e => setAcademicDegree(e.target.value)} placeholder="Thạc sĩ, Tiến sĩ..." />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Mô Tả / Giới Thiệu</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className={styles.textarea} />
            </div>

            {/* III. HÌNH ẢNH */}
            <h4 style={{marginTop: 20, color: '#007bff', borderBottom: '1px solid #eee', paddingBottom: 5}}>III. Hình Ảnh Hồ Sơ</h4>
            
            {/* Avatar */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Ảnh Đại Diện</label>
                <div className={styles.fileUploadWrapper}>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className={styles.fileInput} />
                    <div className={styles.uploadLabel}>Đổi ảnh đại diện...</div>
                </div>
                {avatarPreview && <div style={{marginTop:10}}><img src={avatarPreview} style={{height:100, borderRadius:'50%'}} /><button type="button" onClick={removeNewAvatar} style={{marginLeft:10, color:'red'}}>X</button></div>}
                {currentAvatar && !avatarPreview && <div style={{marginTop:10}}><img src={currentAvatar} style={{height:100, borderRadius:'50%'}} /></div>}
            </div>

             {/* Chứng chỉ */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Ảnh Bằng Cấp / Chứng Chỉ</label>
                <div className={styles.fileUploadWrapper}>
                    <input type="file" accept="image/*" multiple onChange={handleCertChange} className={styles.fileInput} />
                    <div className={styles.uploadLabel}>Thêm ảnh bằng cấp...</div>
                </div>
                {/* Hiển thị ảnh cũ & mới (Copy code hiển thị từ DoctorForm sang đây) */}
                {/* Code hiển thị ảnh cũ/mới giống hệt DoctorForm, em tự copy vào nhé để đỡ dài */}
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
        </form>
      </div>
    </div>
  );
};