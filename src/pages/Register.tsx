import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import thêm Link
import { registerApi } from '../services/authService';
import type { RegisterRequest } from '../types/auth.types';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
// 1. Import file CSS Module
import styles from './Register.module.css'; 

// Dùng cú pháp hàm chuẩn (không cần React.FC)
export const Register = () => {
  const today = new Date().toISOString().split("T")[0]; // Lấy ngày hôm nay
  
  // 2. Định nghĩa state ban đầu (dùng Omit để loại captchaResponse)
  const [formData, setFormData] = useState<Omit<RegisterRequest, 'captchaResponse'>>({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    gender: 'MALE', // Giá trị mặc định là Nam
    birthday: '',   // Chuỗi rỗng
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const captchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  // 3. Hàm xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 4. Hàm xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null);
    setSuccess(null);

    if (formData.birthday) {
        const inputDate = new Date(formData.birthday);
        const inputYear = inputDate.getFullYear();
        const currentYear = new Date().getFullYear();

        // Kiểm tra: Năm > Năm nay HOẶC Năm < 1900 HOẶC Năm quá 4 chữ số
        if (inputYear > currentYear || inputYear < 1900 || inputYear.toString().length > 4) {
            setError(`Ngày sinh không hợp lệ! Năm sinh phải từ 1900 đến ${currentYear}.`);
            // Dừng hàm ngay lập tức, không gửi API, không check Captcha
            return; 
        }
    }

    setIsLoading(true); 

    // Lấy token CAPTCHA
    const captchaToken = captchaRef.current?.getValue();
    if (!captchaToken) {
      setError('Vui lòng xác thực CAPTCHA.');
      setIsLoading(false);
      return;
    }

    // Gộp dữ liệu form và token CAPTCHA
    const finalData: RegisterRequest = { ...formData, captchaResponse: captchaToken };

    try {
      // Gọi API
      const response = await registerApi(finalData);
      setSuccess(response.data); // "Đăng ký tài khoản thành công!"
      setIsLoading(false);

      // Tự động chuyển đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // Xử lý lỗi chuyên nghiệp
      setIsLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        
        // Lỗi Validation (Backend trả về Map)
        if (typeof data === 'object' && data !== null) {
          const firstErrorKey = Object.keys(data)[0];
          setError(data[firstErrorKey]);
        } 
        // Lỗi nghiệp vụ (Backend trả về String)
        else if (typeof data === 'string') {
          setError(data); // Ví dụ: "Email đã tồn tại.", "Xác minh CAPTCHA thất bại."
        } 
        // Lỗi chung
        else {
          setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
        }
      } else {
        setError('Không thể kết nối đến máy chủ.');
      }
      // Reset CAPTCHA để người dùng thử lại
      captchaRef.current?.reset();
    }
  };

  // 5. Giao diện (JSX) đã áp dụng CSS
  return (
    // 2. Áp dụng các class từ file CSS
    <div className={styles.registerContainer}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Đăng Ký Tài Khoản Mới</h2>
        <form onSubmit={handleSubmit}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="fullName" className={styles.label}>Họ và tên:</label>
            <input
              type="text"
              id="fullName" // Thêm id để khớp với label
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={styles.input} // Áp dụng class
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              autoComplete="new-password"
            />
          </div>

          {/* --- THÊM Ô GIỚI TÍNH --- */}
          <div className={styles.inputGroup}>
            <label htmlFor="gender" className={styles.label}>Giới tính:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={styles.input} // Dùng chung class style input
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* --- THÊM Ô NGÀY SINH --- */}
          <div className={styles.inputGroup}>
            <label htmlFor="birthday" className={styles.label}>Ngày sinh:</label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              max={today}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>Số điện thoại (Tùy chọn):</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>Địa chỉ (Tùy chọn):</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.captchaContainer}>
            <ReCAPTCHA
              ref={captchaRef}
              sitekey="6LexWwksAAAAAEZ0bLvSs7CQ1TB1ROeCd_LlWzkG"
            />
          </div>

          {/* Hiển thị lỗi hoặc thành công */}
          {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
          {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <p className={styles.loginLink}>
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>

      </div>
    </div>
  );
};