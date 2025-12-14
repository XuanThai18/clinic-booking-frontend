import { Link } from 'react-router-dom'; // Import Link để chuyển trang
import { useAuth } from '../../store/AuthContext';
import styles from './AdminDashboard.module.css'; // Import CSS

export const AdminDashboard = () => {
  const { user, hasRole } = useAuth();

  return (
    <div className={styles.dashboardContainer}>
      {/* Header chào mừng */}
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Xin chào, <strong>{user?.fullName}</strong>. Bạn muốn quản lý gì hôm nay?</p>
      </header>

      {/* Lưới các chức năng */}
      <div className={styles.grid}>
        
        {/* --- CARD 1: QUẢN LÝ CHUYÊN KHOA --- */}
        <Link to="specialties" className={styles.card}>
          <div className={styles.cardIcon}>🏥</div> {/* Em có thể dùng icon SVG hoặc FontAwesome */}
          <h3>Quản Lý Chuyên Khoa</h3>
          <p>Tạo mới, thêm, sửa, xóa chuyên khoa, upload ảnh đại diện và mô tả chi tiết.</p>
        </Link>

        {/* --- CARD 2: QUẢN LÝ PHÒNG KHÁM (Sắp tới) --- */}
        <Link to="clinics" className={styles.card}>
          <div className={styles.cardIcon}>hk</div>
          <h3>Quản Lý Phòng Khám</h3>
          <p>Quản lý danh sách các cơ sở phòng khám và bệnh viện liên kết.</p>
        </Link>

        {/* --- CARD 3: QUẢN LÝ BÁC SĨ (Sắp tới) --- */}
        <Link to="doctors" className={styles.card}>
          <div className={styles.cardIcon}>👨‍⚕️</div>
          <h3>Quản Lý Hồ Sơ Bác Sĩ</h3>
          <p>Tạo tài khoản bác sĩ mới và gán vào chuyên khoa/phòng khám.</p>
        </Link>

        {/* --- THẺ QUẢN LÝ USER (CHỈ HIỆN VỚI SUPER ADMIN HOẶC ADMIN ) --- */}
        {(hasRole('ROLE_SUPER_ADMIN') || hasRole('ROLE_ADMIN')) && (
            <Link to="users" className={styles.card}>
              <div className={styles.cardIcon}>👥</div>
              <h3>Quản Lý Người Dùng</h3>
              <p>Xem danh sách người dùng, cấp quyền quản trị viên.</p>
            </Link>
        )}

        {/* --- CARD 5: QUẢN LÝ LỊCH HẸN (Mới thêm) --- */}
        <Link to="appointments" className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <h3>Quản Lý Lịch Hẹn</h3>
          <p>Xem và quản lý tất cả lịch hẹn của bệnh nhân và bác sĩ.</p>
        </Link>

        {/* --- CARD 6: QUẢN LÝ QUY TRÌNH (Mới thêm) --- */}
        <Link to="workflow" className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <h3>Quản Lý Tiến Trình</h3>
          <p>Theo dõi trạng thái lịch hẹn dạng bảng Kanban.</p>
        </Link>

        {/* --- CARD MỚI: QUẢN LÝ LỊCH LÀM VIỆC --- */}
        <Link to="schedules" className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <h3>Quản Lý Lịch Làm Việc</h3>
          <p>Xem và sắp xếp lịch khám cho tất cả các bác sĩ trong hệ thống.</p>
        </Link>
      </div>
    </div>
  );
};