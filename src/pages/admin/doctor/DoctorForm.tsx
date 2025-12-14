import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Select from 'react-select'; 
import { NumericFormat } from 'react-number-format'; 
import { useAuth } from '../../../store/AuthContext';

// Import Services
import { uploadFilesApi } from '../../../services/fileService';
import { 
    createDoctorApi,
    registerDoctorApi, 
    updateDoctorApi, 
    getDoctorByIdApi,
} from '../../../services/doctorService';
import type { DoctorRegistrationRequest, DoctorRequest} from '../../../types/doctor.types';
import { getAllSpecialtiesApi } from '../../../services/specialtyService';
import { getAllClinicsApi } from '../../../services/clinicService';
import { getAllUsersApi, getUserByIdApi } from '../../../services/userService'; // Thêm getUserByIdApi

// Import Types
import type { SpecialtyResponse } from '../../../types/specialty.types';
import type { ClinicResponse } from '../../../types/clinic.types';
import type { UserResponse } from '../../../types/auth.types';

// Import CSS (Dùng chung với UserForm)
import styles from '../user/UserForm.module.css'; 

// --- OPTIONS & STYLES ---
const genderOptions = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'OTHER', label: 'Khác' }
];

const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    padding: '2px', borderRadius: '8px',
    borderColor: state.isFocused ? '#007bff' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 123, 255, 0.15)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#007bff' : '#aab2bd' },
    minHeight: '45px', fontSize: '1rem'
  }),
  menu: (base: any) => ({ ...base, zIndex: 9999, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f0f8ff' : 'white',
    color: state.isSelected ? 'white' : '#333',
    cursor: 'pointer', padding: '10px 12px'
  }),
};

export const DoctorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { user: currentUser } = useAuth(); // Lấy thông tin người đang đăng nhập
  // Kiểm tra xem người này có phải là Admin Chi Nhánh không
  // (Nếu có clinicId nghĩa là Admin Chi Nhánh, nếu null là Super Admin)
  const restrictedClinicId = currentUser?.clinicId;
  console.log("Restricted Clinic ID:", currentUser);

  const location = useLocation(); 
  const existingUserId = location.state?.existingUserId;
  const isCreateForExistingUser = Boolean(existingUserId);

  // --- STATE THÔNG TIN CÁ NHÂN (USER) ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [userId, setUserId] = useState<number | ''>(''); // ID của User để liên kết

  // --- STATE THÔNG TIN CHUYÊN MÔN (DOCTOR) ---
  const [specialtyId, setSpecialtyId] = useState<number | ''>('');
  const [clinicId, setClinicId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [academicDegree, setAcademicDegree] = useState('');
  const [price, setPrice] = useState<number>(0);

  // --- STATE DANH SÁCH ---
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);

  // --- STATE ẢNH ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [certPreviews, setCertPreviews] = useState<string[]>([]);
  const [existingCertImages, setExistingCertImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const initData = async () => {
      
      // KHỐI 1: LOAD CHUYÊN KHOA & PHÒNG KHÁM (Quan trọng, ít lỗi)
      try {
        const [sRes, cRes] = await Promise.all([
            getAllSpecialtiesApi(), 
            getAllClinicsApi()
        ]);
        setSpecialties(sRes.data);
        setClinics(cRes.data);
      } catch (err) {
        console.error("Lỗi tải Chuyên khoa/Phòng khám:", err);
      }

      // KHỐI 2: LOAD DANH SÁCH USER (Chỉ khi Tạo mới, có thể lỗi quyền)
      if (!isEditMode && !isCreateForExistingUser) {
         try {
             const uRes = await getAllUsersApi(0, 1000); // Lấy 1000 user
             const userList = Array.isArray(uRes.data) ? uRes.data : uRes.data.content || [];
             setUsers(userList);
         } catch (err) {
             // Chỉ log warning, không alert để tránh làm phiền Admin thường
             console.warn("Không thể tải danh sách User (Có thể do thiếu quyền USER_VIEW).");
         }
      }

      // KHỐI 3: TRƯỜNG HỢP SỬA BÁC SĨ (EDIT DOCTOR)
      if (isEditMode && id) {
        try {
            const docRes = await getDoctorByIdApi(Number(id));
            const data = docRes.data;
            
            // Map User Info
            setUserId(data.userId);
            setFullName(data.fullName);
            setEmail(data.email);
            setPhoneNumber(data.phoneNumber || '');
            setAddress(data.address || '');
            if (data.gender) setGender(data.gender);
            if (data.birthday) setBirthday(data.birthday);
            
            // Map Doctor Info
            setSpecialtyId(data.specialty?.id || '');
            setClinicId(data.clinic?.id || '');
            setDescription(data.description || '');
            setAcademicDegree(data.academicDegree || '');
            setPrice(data.price);
            
            // Map Ảnh
            setCurrentAvatar(data.image || null);
            if (data.otherImages) setExistingCertImages(data.otherImages);
        } catch (err) {
            console.error(err);
            alert("Không thể tải hồ sơ bác sĩ này.");
        }
      }
      
      // KHỐI 4: TRƯỜNG HỢP TẠO HỒ SƠ CHO USER CÓ SẴN (CREATE FOR EXISTING USER)
      else if (isCreateForExistingUser) {
          try {
              setLoading(true);
              // Gọi API lấy thông tin User để điền sẵn
              const userRes = await getUserByIdApi(Number(existingUserId));
              const u = userRes.data;

              setUserId(u.id); // Set ID để liên kết
              setFullName(u.fullName);
              setEmail(u.email);
              setPhoneNumber(u.phoneNumber || '');
              setAddress(u.address || '');
              
              if (u.gender) setGender(u.gender);
              
              if (u.birthday) {
                  const dateValue = u.birthday.length > 10 ? u.birthday.substring(0, 10) : u.birthday;
                  setBirthday(dateValue);
              } else if (u.createdAt) {
                  setBirthday(u.createdAt.split('T')[0]);
              }
          } catch (err) {
              console.error("Lỗi tải thông tin user:", err);
              alert("Không thể tải thông tin người dùng để tạo hồ sơ.");
          } finally {
              setLoading(false);
          }
      }

      // Nếu người dùng là Admin Chi Nhánh, tự động set clinicId để giới hạn
      if (restrictedClinicId) {
          setClinicId(restrictedClinicId);
      }
    };

    initData();
  }, [id, isEditMode, isCreateForExistingUser, existingUserId, restrictedClinicId]);
  // --- DỌN DẸP BỘ NHỚ URL ẢNH ---
  useEffect(() => {
    return () => {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        certPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [avatarPreview, certPreviews]);


  // --- CÁC HÀM XỬ LÝ ẢNH (ĐÃ FIX LOGIC) ---
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

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (birthday) {
        const inputDate = new Date(birthday);
        const inputYear = inputDate.getFullYear();
        const currentYear = new Date().getFullYear();

        // Kiểm tra logic năm sinh:
        // - Không được lớn hơn năm hiện tại
        // - Không được nhỏ hơn 1900
        // - Không được quá 4 chữ số (chặn case 20025)
        if (inputYear > currentYear || inputYear < 1900 || inputYear.toString().length > 4) {
            alert(`Năm sinh không hợp lệ! Vui lòng nhập năm từ 1900 đến ${currentYear}.`);
            return; // 🛑 Dừng ngay, không gọi API
        }
    }

    try {
      // 1. Upload Ảnh
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

      // TRƯỜNG HỢP 1: SỬA HỒ SƠ BÁC SĨ (Update)
      if (isEditMode && id) {
        const updateData: DoctorRequest = {
             userId: Number(userId),
             specialtyId: Number(specialtyId),
             clinicId: Number(clinicId),
             fullName: fullName,      
             phoneNumber: phoneNumber, 
             address: address,         
             description, academicDegree, price,
             image: finalAvatarUrl,
             otherImages: finalCertUrls,
             gender: gender || undefined,
             birthday: birthday || undefined
        };
        await updateDoctorApi(Number(id), updateData);
        alert("Cập nhật thành công!");
      } 
      
      // TRƯỜNG HỢP 2: TẠO HỒ SƠ CHO USER CÓ SẴN (Create Profile Only)
      // (Đây là trường hợp em đang bị thiếu)
      else if (isCreateForExistingUser) {
         const createProfileData: DoctorRequest = {
             userId: Number(userId), // ID của user được gửi sang
             specialtyId: Number(specialtyId),
             clinicId: Number(clinicId),
             description, academicDegree, price,
             image: finalAvatarUrl,
             otherImages: finalCertUrls,
             gender: gender || undefined,
             birthday: birthday || undefined
         };
         
         // Gọi API chỉ tạo Doctor, không tạo User
         await createDoctorApi(createProfileData); 
         alert("Đã tạo hồ sơ chuyên môn thành công!");
      }
      
      // TRƯỜNG HỢP 3: TẠO MỚI HOÀN TOÀN (Register User + Doctor)
      else {
        if (!password) { alert("Vui lòng nhập mật khẩu!"); setLoading(false); return; }

        const createData: DoctorRegistrationRequest = {
            fullName, email, password, phoneNumber, address, 
            gender, birthday: birthday || undefined,
            specialtyId: Number(specialtyId),
            clinicId: Number(clinicId),
            description, academicDegree, price,
            image: finalAvatarUrl,
            otherImages: finalCertUrls
        };

        await registerDoctorApi(createData);
        alert("Tạo tài khoản và hồ sơ bác sĩ thành công!");
      }
      navigate('/admin/doctors');

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data || "Có lỗi xảy ra!";
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  // Chuẩn bị options
  const userOptions = users.map(u => ({ value: u.id, label: `${u.fullName} (${u.email})` }));
  const specialtyOptions = specialties.map(s => ({ value: s.id, label: s.name }));
  const clinicOptions = clinics.map(c => ({ value: c.id, label: c.name }));

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>{isEditMode ? "Cập Nhật Bác Sĩ" : "Thêm Hồ Sơ Bác Sĩ"}</h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* === I. THÔNG TIN TÀI KHOẢN === */}
          <h4 style={{marginTop: 0, color: '#007bff', borderBottom: '1px solid #eee', paddingBottom: 5}}>I. Thông Tin Tài Khoản</h4>
          
          <div className={styles.row}>
              <div className={`${styles.formGroup} ${styles.col}`}>
                <label className={styles.label}>Họ Tên (*)</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={styles.input} />
              </div>
              <div className={`${styles.formGroup} ${styles.col}`}>
                <label className={styles.label}>Email (*)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} disabled={isEditMode} />
              </div>
          </div>

          {!isEditMode && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Mật Khẩu (*)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={styles.input} />
              </div>
          )}

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
                    <input 
                      type="date" 
                      value={birthday} 
                      onChange={e => setBirthday(e.target.value)} 
                      className={styles.input} style={{height: '45px'}} 
                      max={new Date().toISOString().split("T")[0]}
                    />
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

          {/* === II. THÔNG TIN CHUYÊN MÔN === */}
          <h4 style={{marginTop: 20, color: '#007bff', borderBottom: '1px solid #eee', paddingBottom: 5}}>II. Thông Tin Chuyên Môn</h4>

          <div className={styles.row}>
              <div className={`${styles.formGroup} ${styles.col}`}>
                <label className={styles.label}>Chuyên Khoa (*)</label>
                <Select 
                    options={specialtyOptions} 
                    value={specialtyOptions.find(o => o.value === specialtyId) || null} 
                    onChange={val => setSpecialtyId(val ? Number(val.value) : '')} 
                    styles={customSelectStyles} 
                    placeholder="Chọn chuyên khoa..." 
                />
              </div>
              <div className={`${styles.formGroup} ${styles.col}`}>
                <label className={styles.label}>Phòng Khám (*)</label>
                <Select 
                    options={clinicOptions} 
                    value={clinicOptions.find(o => o.value === clinicId) || null} 
                    onChange={val => setClinicId(val ? Number(val.value) : '')} 
                    styles={customSelectStyles} 
                    placeholder="Chọn phòng khám..." 
                    isDisabled={isEditMode || !!restrictedClinicId}
                />
              </div>
          </div>

          <div className={styles.row}>
              <div className={`${styles.formGroup} ${styles.col}`}>
                <label className={styles.label}>Giá Khám</label>
                <NumericFormat 
                  // Chỉ truyền giá trị số (nếu có), nếu 0 thì để trống hoặc 0 tùy em
                  value={price === 0 ? '' : price} 
                  
                  onValueChange={(values) => {
                      // Lấy giá trị số thô (floatValue) để lưu vào state
                      // Nếu người dùng xóa hết (undefined), lưu là 0
                      setPrice(values.floatValue || 0);
                  }}
                  
                  thousandSeparator={true} // Bật dấu phẩy
                  suffix={' ₫'} 
                  className={styles.input}
                  placeholder="Nhập giá khám..."
                  
                  // QUAN TRỌNG: Ngăn chặn nhập số âm và các ký tự lạ
                  allowNegative={false} 
                  decimalScale={0} // Chỉ số nguyên, không số thập phân
                />
              </div>
              <div className={`${styles.formGroup} ${styles.col}`}>
                <label className={styles.label}>Học vị</label>
                <input className={styles.input} value={academicDegree} onChange={e => setAcademicDegree(e.target.value)} placeholder="VD: Thạc sĩ, BS CKII..." />
              </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mô Tả / Giới Thiệu</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={10} cols={95} className={styles.textarea} placeholder="Giới thiệu về bác sĩ..." />
          </div>

          {/* === III. HÌNH ẢNH === */}
          <h4 style={{marginTop: 20, color: '#007bff', borderBottom: '1px solid #eee', paddingBottom: 5}}>III. Hình Ảnh</h4>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ảnh Đại Diện (Avatar)</label>
            <div className={styles.fileUploadWrapper}>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className={styles.fileInput} />
                <div className={styles.uploadLabel}>{avatarFile ? avatarFile.name : "Chọn ảnh đại diện..."}</div>
            </div>
            {avatarPreview && (
                <div className={styles.previewContainer} style={{position: 'relative', display: 'inline-block', marginTop: 10}}>
                    <img src={avatarPreview} alt="New" style={{height: 80, borderRadius: '50%', border: '2px solid green'}} />
                    <button type="button" className={styles.removeButton} onClick={removeNewAvatar}>×</button>
                </div>
            )}
            {currentAvatar && !avatarPreview && (
                <div style={{marginTop: 10}}>
                    <img src={currentAvatar} alt="Current" style={{height: 80, borderRadius: '50%', border: '1px solid #ccc'}} />
                    <p style={{fontSize: '0.8rem'}}>Ảnh hiện tại</p>
                </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ảnh Bằng Cấp / Chứng Chỉ</label>
            <div className={styles.fileUploadWrapper}>
                <input type="file" accept="image/*" multiple onChange={handleCertChange} className={styles.fileInput} />
                <div className={styles.uploadLabel}>Chọn thêm ảnh chứng chỉ...</div>
            </div>
            
            {/* List ảnh cũ */}
            {existingCertImages.length > 0 && (
                <div style={{marginTop: 10}}>
                    <p style={{fontSize: '0.9rem', fontWeight: '600', marginBottom: 5}}>Ảnh cũ:</p>
                    <div className={styles.previewGrid}>
                        {existingCertImages.map((url, idx) => (
                            <div key={idx} className={styles.previewItem}>
                                <img src={url} className={styles.previewImage} alt="Old" />
                                <button type="button" className={styles.removeButton} onClick={() => removeExistingCert(url)}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* List ảnh mới */}
            {certPreviews.length > 0 && (
                <div style={{marginTop: 10}}>
                    <p style={{fontSize: '0.9rem', fontWeight: '600', color: 'green', marginBottom: 5}}>Ảnh mới:</p>
                    <div className={styles.previewGrid}>
                        {certPreviews.map((url, idx) => (
                            <div key={idx} className={styles.previewItem}>
                                <img src={url} className={styles.previewImage} alt="New" />
                                <button type="button" className={styles.removeButton} onClick={() => removeNewCert(idx)}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Đang xử lý...' : 'Lưu Hồ Sơ'}
          </button>
        </form>
      </div>
    </div>
  );
};