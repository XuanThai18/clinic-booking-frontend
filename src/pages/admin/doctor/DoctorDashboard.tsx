import { Link } from 'react-router-dom';
import { useAuth } from '../../../store/AuthContext';
import styles from './DoctorDashboard.module.css';

export const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Trang Làm Việc Của Bác Sĩ</h1>
        <p>Xin chào Bác sĩ <strong>{user?.fullName}</strong>. Chúc một ngày làm việc hiệu quả!</p>
      </header>

      <div className={styles.grid}>
        
        {/* CARD 1: ĐĂNG KÝ LỊCH (DoctorSchedule) */}
        <Link to="schedule" className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <h3>Đăng Ký Lịch Khám</h3>
          <p>Chọn ngày và khung giờ bạn có thể tiếp nhận bệnh nhân.</p>
        </Link>

        {/* CARD 2: DANH SÁCH HẸN (DoctorAppointmentManager) */}
        <Link to="appointments" className={styles.card}>
          <div className={styles.cardIcon}>📋</div>
          <h3>Danh Sách Bệnh Nhân</h3>
          <p>Xem danh sách bệnh nhân đã đặt lịch, xem SĐT và xác nhận khám xong.</p>
        </Link>

        {/* CARD 3: HỒ SƠ CỦA TÔI (MỚI) */}
        <Link to="profile" className={styles.card}>
          <div className={styles.cardIcon}>👨‍⚕️</div>
          <h3>Hồ Sơ Của Tôi</h3>
          <p>Cập nhật thông tin cá nhân, ảnh đại diện, mô tả và bằng cấp chuyên môn.</p>
        </Link>

        {/* CARD 4: LỊCH SỬ KHÁM (MỚI) */}
        <Link to="history" className={styles.card}>
          <div className={styles.cardIcon}>📂</div>
          <h3>Lịch Sử Khám Bệnh</h3>
          <p>Tra cứu hồ sơ bệnh án cũ, xem lại các lịch đã khám hoặc đã hủy.</p>
        </Link>

      </div>
    </div>
  );
};