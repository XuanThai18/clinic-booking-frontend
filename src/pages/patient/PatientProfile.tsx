import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { updateMyProfileApi } from '../../services/patientService'; // Em cần tự viết API này ở Backend nếu chưa có
import styles from '../admin/user/UserForm.module.css'; // Tái sử dụng CSS Form
import type { Gender } from '../../types/auth.types';
import { getMyProfileApi } from '../../services/patientService';

export const PatientProfile = () => {
    const { user, login } = useAuth(); // Lấy user từ context
    const [loading, setLoading] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState('');

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Gọi API lấy dữ liệu tươi mới nhất từ DB
                const res = await getMyProfileApi(); 
                const userData = res.data;

                setFullName(userData.fullName || '');
                setPhoneNumber(userData.phoneNumber || '');
                setAddress(userData.address || '');
                setGender(userData.gender || '');
                
                // Xử lý ngày sinh an toàn
                if (userData.birthday) {
                    // Chuyển về YYYY-MM-DD
                    const dateStr = userData.birthday.toString().split('T')[0];
                    setBirthday(dateStr);
                } else {
                    setBirthday('');
                }
            } catch (err) {
                console.error("Lỗi tải hồ sơ:", err);
            }
        };

        fetchProfile();
    }, []); // Chạy 1 lần khi vào trang

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi API cập nhật (Backend cần có API: PUT /api/users/profile/me)
            const res = await updateMyProfileApi({
                fullName, phoneNumber, address, 
                gender: gender === '' ? undefined : (gender as Gender),
                birthday
            });
            
            // Quan trọng: Cập nhật lại Context và LocalStorage để hiển thị tên mới ngay lập tức
            if (user && res.data) {
                // Giữ lại token cũ, chỉ update user info
                const token = localStorage.getItem('accessToken') || '';
                // Merge thông tin cũ và mới (vì API update có thể trả về thiếu trường clinicId/roles)
                const updatedUser = { ...user, ...res.data }; 
                login(token, updatedUser);
            }
            
            alert("Cập nhật hồ sơ thành công!");
        } catch (error) {
            alert("Lỗi cập nhật hồ sơ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{maxWidth: 600, margin: '40px auto', padding: 30, background: 'white', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
            <h2 style={{textAlign: 'center', marginBottom: 20, color: '#007bff'}}>Hồ Sơ Của Tôi</h2>
            
            <form onSubmit={handleUpdate}>
                {/* Email (Read-only) */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Email (Tên đăng nhập)</label>
                    <input className={styles.input} value={user?.email} disabled style={{background: '#f9f9f9'}} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Họ và Tên</label>
                    <input className={styles.input} value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Số Điện Thoại</label>
                    <input className={styles.input} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Địa Chỉ</label>
                    <input className={styles.input} value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div style={{display: 'flex', gap: 20}}>
                    <div className={styles.formGroup} style={{flex: 1}}>
                        <label className={styles.label}>Giới Tính</label>
                        <select className={styles.input} value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                        </select>
                    </div>
                    <div className={styles.formGroup} style={{flex: 1}}>
                        <label className={styles.label}>Ngày Sinh</label>
                        <input type="date" className={styles.input} value={birthday} onChange={e => setBirthday(e.target.value)} />
                    </div>
                </div>

                <button type="submit" className={styles.submitButton} disabled={loading} style={{marginTop: 20}}>
                    {loading ? "Đang lưu..." : "Cập Nhật Hồ Sơ"}
                </button>
            </form>
        </div>
    );
};