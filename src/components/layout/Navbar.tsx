import { useState, useEffect } from 'react'; // <-- 1. Import thêm useState, useEffect
import { Link, useNavigate, useLocation  } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- 2. Logic cho Hiệu ứng 3 (Phát hiện cuộn trang) ---
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Hàm này sẽ được gọi mỗi khi người dùng cuộn
    const handleScroll = () => {
      // Nếu cuộn xuống quá 10px, đặt isScrolled = true
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // "Gắn" hàm handleScroll vào sự kiện cuộn của cửa sổ
    window.addEventListener('scroll', handleScroll);

    // "Dọn dẹp": Gỡ bỏ sự kiện khi component bị xóa (rất quan trọng)
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần khi component được tải

  // --- Hết Logic cuộn trang ---

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // 3. Áp dụng class .scrolled một cách có điều kiện
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      
      {/* Logo trỏ về trang chủ */}
      <Link to="/" className={styles.logo}>
        Clinic Booking
      </Link>

      {/* Các link/button điều hướng (Giữ nguyên) */}
      <div className={styles.navLinks}>
        <Link to="/" 
            className={`${styles.navItem} ${location.pathname === "/" ? styles.active : ""}`}>
          Trang chủ
        </Link>
        <Link to="/find-doctor" 
            className={`${styles.navItem} ${location.pathname === "/find-doctor" ? styles.active : ""}`}>
          Tìm Bác Sĩ
        </Link>

        {/* === LOGIC HIỂN THỊ CÁC TÙY CHỌN (OPTIONS) === */}

        {/* 1. Nếu là SUPER_ADMIN hoặc ADMIN */}
        {isAuthenticated && (hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_ADMIN')) && (
          <Link to="/admin" className={styles.navItem}>
            Quản Trị Hệ Thống
          </Link>
        )}

        {/* 2. Nếu là Bác Sĩ (DOCTOR) */}
        {isAuthenticated && hasRole('ROLE_DOCTOR') && (
          // Chỉ hiện 1 nút duy nhất dẫn về Dashboard
          <Link to="/doctor" className={styles.navItem}>
             Quản Lý Bác Sĩ
          </Link>
        )}
        
        {/* 3. Nếu là Bệnh Nhân (PATIENT) */}
        {isAuthenticated && hasRole('ROLE_PATIENT') && (
          <>
             <Link to="/patient/appointments" className={styles.navItem}>Lịch Sử Khám</Link>
             <Link to="/patient/profile" className={styles.navItem}>Hồ Sơ</Link>
          </>
        )}
        
        {isAuthenticated ? (
          // Nếu ĐÃ đăng nhập:
          <div className={styles.userInfo}>
            <span>Xin chào, {user?.fullName || user?.email}</span>
            <button 
              onClick={handleLogout} 
              className={`${styles.navItem} ${styles.ctaButton}`}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          // Nếu CHƯA đăng nhập:
          <div className={styles.authButtons}>
            <Link to="/login" 
                className={`${styles.navItem} ${location.pathname === "/login" ? styles.active : ""}`}>
              Đăng nhập
            </Link>
            <Link to="/register" 
                className={`${styles.navItem} ${styles.ctaButton} ${location.pathname === "/register" ? styles.active : ""}`}>
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};