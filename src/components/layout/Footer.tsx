import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <ul className={styles.footerLinks}>
        <li><a href="#">Về chúng tôi</a></li>
        <li><a href="#">Dịch vụ</a></li>
        <li><a href="#">Liên hệ</a></li>
        <li><a href="#">Chính sách bảo mật</a></li>
      </ul>
      <p className={styles.copyright}>
        © 2025 Clinic Booking. Đồ án tốt nghiệp thực hiện bởi sinh viên Nguyễn Xuân Thái.
      </p>
    </footer>
  );
};