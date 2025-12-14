import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { createUserApi, updateUserApi, getUserByIdApi, getAllPermissionsApi } from '../../../services/userService';
import type { CreateUserRequest } from '../../../types/auth.types'; 
import styles from './UserForm.module.css'; // <-- 1. Đổi sang file CSS mới
import type { ClinicResponse } from '../../../types/clinic.types';
import { getAllClinicsApi } from '../../../services/clinicService';

// ... (các options và customSelectStyles giữ nguyên) ...
const roleOptions = [
    { value: 'ROLE_ADMIN', label: 'Quản Trị Viên (Admin)' },
    { value: 'ROLE_DOCTOR', label: 'Bác Sĩ (Doctor)' },
    { value: 'ROLE_PATIENT', label: 'Bệnh Nhân (Patient)' }
];
const genderOptions = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'OTHER', label: 'Khác' }
];
const customSelectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        padding: '2px',
        borderRadius: '8px',
        borderColor: state.isFocused ? '#007bff' : '#ced4da',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 123, 255, 0.15)' : 'none',
        '&:hover': { borderColor: state.isFocused ? '#007bff' : '#aab2bd' },
        minHeight: '45px', fontSize: '1rem'
    }),
    menu: (base: any) => ({ ...base, zIndex: 9999, borderRadius: '8px', marginTop: '4px' }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f0f8ff' : 'white',
        color: state.isSelected ? 'white' : '#333',
        cursor: 'pointer', padding: '10px 12px'
    }),
};

export const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isActive, setIsActive] = useState(true); 
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [initialRoles, setInitialRoles] = useState<string[]>([]);

  const [clinicId, setClinicId] = useState<number | ''>(''); // State lưu ID phòng khám quản lý
  const [clinics, setClinics] = useState<ClinicResponse[]>([]); // Danh sách phòng khám để chọn

  // --- STATE CHO QUYỀN NÂNG CAO ---  
  const [allPermissions, setAllPermissions] = useState<string[]>([]); // Danh sách quyền lấy từ server
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]); // Quyền đã chọn

  const [loading, setLoading] = useState(false);

  // Load dữ liệu (Gộp tất cả: Permissions, Clinics, User Info)
  useEffect(() => {
    const initData = async () => {
        
        // --- KHỐI 1: LOAD DANH SÁCH QUYỀN (Cho Super Admin) ---
        try {
            const permRes = await getAllPermissionsApi();
            setAllPermissions(permRes.data);
        } catch (e) { 
            // Nếu lỗi (403 Forbidden), nghĩa là Admin thường -> Bỏ qua, không sao cả.
            console.log("User hiện tại không có quyền xem danh sách Permissions hệ thống."); 
        }

        // --- KHỐI 2: LOAD DANH SÁCH PHÒNG KHÁM (Cho Super Admin chọn) ---
        try {
            const clinicRes = await getAllClinicsApi();
            setClinics(clinicRes.data);
        } catch (e) {
            console.error("Lỗi tải danh sách phòng khám:", e);
        }

        // --- KHỐI 3: LOAD THÔNG TIN USER ĐỂ SỬA (Quan trọng nhất) ---
        if (isEditMode && id) {
            try {
                const res = await getUserByIdApi(Number(id));
                const u = res.data;
                
                // 3.1. Các thông tin cơ bản
                setFullName(u.fullName);
                setEmail(u.email);
                setPhoneNumber(u.phoneNumber || '');
                setAddress(u.address || '');
                
                // 3.2. Giới tính
                if (u.gender) setGender(u.gender);
                
                // 3.3. Ngày sinh
                if (u.birthday) {
                    const dateValue = u.birthday.length > 10 ? u.birthday.substring(0, 10) : u.birthday;
                    setBirthday(dateValue); 
                } else if (u.createdAt) {
                     setBirthday(u.createdAt.substring(0, 10));
                }

                // 3.4. Trạng thái & Vai trò
                if (u.isActive !== undefined) setIsActive(u.isActive);
                setSelectedRoles(u.roles); 
                setInitialRoles(u.roles); // Lưu roles ban đầu

                // 3.5. Quyền riêng lẻ (Extra Permissions)
                if (u.extraPermissions) setSelectedPermissions(u.extraPermissions);

                // 3.6. Phòng khám quản lý (CLINIC ID) - <--- CÁI EM VỪA THÊM
                if (u.clinicId) setClinicId(u.clinicId);

            } catch (err) {
                console.error(err);
                alert("Lỗi tải thông tin user để sửa.");
            }
        }
    };
    initData();
  }, [id, isEditMode]);

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
      const userData: CreateUserRequest = {
        fullName, email, password: isEditMode ? undefined : password, 
        phoneNumber, address, gender, birthday: birthday || undefined, 
        isActive,
        clinicId: clinicId ? Number(clinicId) : undefined,
        roles: selectedRoles,
        extraPermissions: selectedPermissions
      };

      if (isEditMode && id) {
        await updateUserApi(Number(id), userData);
        
        // --- LOGIC MỚI: CHỈ HỎI NẾU VỪA CẤP QUYỀN BÁC SĨ ---
        // Điều kiện: 
        // 1. Danh sách mới có ROLE_DOCTOR
        // 2. VÀ Danh sách cũ (lúc mới vào) CHƯA CÓ ROLE_DOCTOR
        const isNewlyPromoted = selectedRoles.includes('ROLE_DOCTOR') && !initialRoles.includes('ROLE_DOCTOR');

        if (isNewlyPromoted) {
            if (window.confirm("Đã cấp quyền Bác sĩ thành công! Bạn có muốn tạo hồ sơ chuyên môn cho bác sĩ này ngay không?")) {
                navigate('/admin/add-doctor', { 
                    state: { 
                        existingUserId: Number(id),
                        preloadedUser: userData 
                    } 
                });
                return;
            }
        }
        alert("Cập nhật thành công!");
      } else {
        if (!password) { alert("Vui lòng nhập mật khẩu!"); setLoading(false); return; }
        await createUserApi(userData);
        alert("Tạo user thành công!");
      }
      
      navigate('/admin/users');
    } catch (err: any) {
      console.error(err);
      
      // 1. Kiểm tra xem có phản hồi từ Backend không
      if (err.response && err.response.data) {
        const data = err.response.data;

        // TRƯỜNG HỢP 1: Lỗi Validation (Backend trả về Map nhiều lỗi)
        // Dấu hiệu: data là object và KHÔNG có thuộc tính 'message' hay 'error' chung
        if (typeof data === 'object' && !data.message && !data.error) {
          
          // Cách đơn giản: Lấy lỗi đầu tiên tìm thấy để báo
          const firstKey = Object.keys(data)[0]; // ví dụ "fullName"
          const firstErrorMessage = data[firstKey]; // ví dụ "Họ và tên không được để trống"
          
          alert(`Lỗi nhập liệu: ${firstErrorMessage}`);
        } 
        
        // TRƯỜNG HỢP 2: Lỗi Nghiệp vụ (Ví dụ: Email đã tồn tại)
        // Backend trả về chuỗi hoặc object có field message
        else if (data.message) {
             alert(`Lỗi: ${data.message}`);
        } else if (typeof data === 'string') {
             alert(`Lỗi: ${data}`);
        } else {
             alert("Có lỗi xảy ra, vui lòng kiểm tra lại.");
        }

      } else {
        // 2. Lỗi mạng hoặc server sập
        alert("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn bị options cho Permission Select
  const permissionOptions = allPermissions.map(p => ({ value: p, label: p }));

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>{isEditMode ? "Cập Nhật Người Dùng" : "Thêm Người Dùng Mới"}</h2>
        
        <form onSubmit={handleSubmit}>
            {/* Hàng 1: Họ Tên & Email */}
            <div className={styles.row}>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Họ Tên (*)</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={styles.input} placeholder="Nguyễn Văn A" />
                </div>
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Email (*)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} disabled={isEditMode} placeholder="email@example.com" />
                </div>
            </div>

            {/* Hàng 2: Mật Khẩu & Vai Trò */}
            <div className={styles.row}>
                {!isEditMode && (
                    <div className={`${styles.formGroup} ${styles.col}`}>
                        <label className={styles.label}>Mật Khẩu (*)</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={styles.input} />
                    </div>
                )}
                <div className={`${styles.formGroup} ${styles.col}`}>
                    <label className={styles.label}>Vai Trò (Roles) (*)</label>
                    <Select 
                        isMulti 
                        options={roleOptions}
                        value={roleOptions.filter(opt => selectedRoles.includes(opt.value))}
                        onChange={(options) => setSelectedRoles(options.map(opt => opt.value))}
                        styles={customSelectStyles}
                        placeholder="Chọn vai trò..."
                    />
                </div>
            </div>

            {/* --- LOGIC MỚI: NẾU LÀ ADMIN THÌ PHẢI CHỌN PHÒNG KHÁM QUẢN LÝ --- */}
            {selectedRoles.includes('ROLE_ADMIN') && (
                <div className={styles.formGroup} style={{border: '1px dashed #007bff', padding: '15px', borderRadius: '8px', backgroundColor: '#f0f8ff', position: 'relative'}}>
                    <label className={styles.label} style={{color: '#007bff'}}>
                        Phòng Khám Quản Lý (Dành cho Admin Chi Nhánh) <span style={{color: 'red'}}>*</span>
                    </label>
                    
                    <Select 
                        options={clinics.map(c => ({ value: c.id, label: c.name }))}
                        value={clinics.map(c => ({ value: c.id, label: c.name })).find(c => c.value === clinicId) || null}
                        onChange={(opt) => setClinicId(opt ? Number(opt.value) : '')}
                        styles={customSelectStyles}
                        placeholder="Chọn phòng khám mà Admin này sẽ quản lý..."
                        isClearable
                    />

                    {/* --- INPUT ẨN ĐỂ BẮT BUỘC CHỌN (VALIDATION) --- */}
                    <input 
                        tabIndex={-1}
                        autoComplete="off"
                        style={{ opacity: 0, height: 0, position: 'absolute', zIndex: -1 }}
                        value={clinicId}
                        required={true} // Bắt buộc
                        onChange={() => {}}
                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Vui lòng chọn phòng khám quản lý.')}
                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                    />
                    {/* ----------------------------------------------- */}

                    <small style={{color: '#666', marginTop: 5, display: 'block'}}>
                        * Người này sẽ chỉ được phép xem và chỉnh sửa dữ liệu thuộc về phòng khám này.
                    </small>
                </div>
            )}

            {/* --- Ô QUYỀN BỔ SUNG (EXTRA PERMISSIONS) --- */}
            <div className={styles.formGroup}>
                <label className={styles.label} style={{color: '#e67e22'}}>Quyền Bổ Sung (Nâng Cao)</label>
                <Select 
                    isMulti 
                    options={permissionOptions}
                    value={permissionOptions.filter(opt => selectedPermissions.includes(opt.value))}
                    onChange={(options) => setSelectedPermissions(options.map(opt => opt.value))}
                    styles={customSelectStyles}
                    placeholder="Chọn quyền riêng lẻ (VD: USER_VIEW)..."
                />
                <small style={{color: '#666', fontStyle: 'italic', marginTop: 5, display: 'block'}}>
                    Chỉ dùng khi muốn cấp thêm quyền đặc biệt ngoài Role chính.
                </small>
            </div>

            {/* Hàng 3: Giới tính & Ngày sinh */}
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
                        className={styles.input} 
                        style={{height: '45px'}} 
                        max={new Date().toISOString().split("T")[0]}
                    />
                </div>
            </div>

            {/* Hàng 4: SĐT & Địa chỉ */}
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

            <div className={styles.formGroup} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <label className={styles.label} style={{marginBottom: 0}}>Trạng Thái Hoạt Động:</label>
              <label className="switch" style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  style={{opacity: 0, width: 0, height: 0}}
                />
                <span className="slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: isActive ? '#28a745' : '#ccc', 
                    transition: '.4s', borderRadius: '34px'
                }}>
                  <span style={{
                      position: 'absolute', content: "", height: '16px', width: '16px', 
                      left: isActive ? '28px' : '4px', bottom: '4px', 
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                  }}></span>
                </span>
              </label>
              <span style={{fontWeight: 'bold', color: isActive ? '#28a745' : '#dc3545'}}>
                  {isActive ? "Đang Hoạt Động" : "Đã Bị Khóa"}
              </span>
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Đang xử lý...' : (isEditMode ? 'Lưu Thay Đổi' : 'Tạo Người Dùng')}
            </button>
        </form>
      </div>
    </div>
  );
};