import { useState, useEffect } from 'react';
import styles from './Hero.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext'; // Import useAuth để lấy trạng thái đăng nhập

type HeroProps = {};

export const Hero = (props: HeroProps) => {
  // --- 1. CÁC STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isScrolled, setIsScrolled] = useState(false); // Thêm state cho hiệu ứng cuộn

  // --- 2. CÁC BIẾN VÀ HOOKS ---
  const fullText = "Chăm Sóc Sức Khỏe Chủ Động Cùng Clinic Booking";
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // Lấy thông tin từ AuthContext

  // --- 3. USE EFFECT: HIỆU ỨNG GÕ CHỮ (TYPING EFFECT) ---
  useEffect(() => {
    let index = 0;
    // Thêm timeout để chữ bắt đầu chạy sau 1s (cho khớp với animation fade-up)
    const startDelay = setTimeout(() => {
        const timer = setInterval(() => {
            setTypedText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(timer);
        }, 70);
        return () => clearInterval(timer);
    }, 1000);

    return () => clearTimeout(startDelay);
  }, []);

  // --- 4. USE EFFECT: HIỆU ỨNG CUỘN (SCROLL EFFECT) ---
  useEffect(() => {
    const handleScroll = () => {
      // Nếu cuộn xuống quá 10px, đặt isScrolled = true
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 5. HÀM XỬ LÝ TÌM KIẾM ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    // Chuyển hướng đến trang tìm kiếm với từ khóa
    navigate(`/find-doctor?q=${encodeURIComponent(searchTerm)}`);
  };

  // --- 6. GIAO DIỆN (JSX) ---
  return (
    <section className={styles.heroContainer}>
      {/* ===== NỘI DUNG CHÍNH (HERO CONTENT) ===== */}
      <div className={styles.heroContent}>
        {/* Tiêu đề có hiệu ứng gõ chữ và con trỏ nhấp nháy */}
        <h1>{typedText}<span className={styles.cursor}></span></h1>
        
        <p>Tìm kiếm bác sĩ, xem lịch trống và đặt hẹn chỉ trong vài phút.</p>

        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm chuyên khoa, bác sĩ, phòng khám..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Tìm Kiếm</button>
        </form>

        <div className={styles.ctaButtons}>
            {/* Nút bấm thay đổi dựa trên trạng thái đăng nhập */}
            {isAuthenticated ? (
                <Link to="/find-doctor" className={styles.primaryBtn}>Đặt Lịch Ngay</Link>
            ) : (
                <Link to="/register" className={styles.primaryBtn}>Đăng Ký Ngay</Link>
            )}
            
            <Link to="/about" className={styles.secondaryBtn}>Tìm Hiểu Thêm</Link>
        </div>
      </div>
    </section>
  );
};