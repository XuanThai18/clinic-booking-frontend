import { Link } from 'react-router-dom';
import styles from './About.module.css';

export const About = () => {
  return (
    <div className={styles.container}>
      
      {/* 1. Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.title}>Về Clinic Booking</h1>
        <p className={styles.subtitle}>
          Nền tảng y tế công nghệ cao, kết nối bệnh nhân với hàng ngàn bác sĩ giỏi và cơ sở y tế uy tín trên toàn quốc. Chúng tôi tin rằng chăm sóc sức khỏe nên dễ dàng, nhanh chóng và minh bạch.
        </p>
      </section>

      {/* 2. Mission & Vision */}
      <section className={styles.missionSection}>
        <div className={styles.missionCard}>
          <h2 className={styles.cardTitle}>🚀 Sứ Mệnh</h2>
          <p className={styles.cardContent}>
            Giúp người bệnh tiếp cận dịch vụ y tế chất lượng cao một cách thuận tiện nhất. Giảm thiểu thời gian chờ đợi, loại bỏ thủ tục rườm rà, và mang lại sự an tâm tuyệt đối cho mỗi gia đình.
          </p>
        </div>
        <div className={styles.missionCard}>
          <h2 className={styles.cardTitle}>👁️ Tầm Nhìn</h2>
          <p className={styles.cardContent}>
            Trở thành hệ sinh thái chăm sóc sức khỏe kỹ thuật số hàng đầu Việt Nam, nơi mọi người dân đều có một "bác sĩ riêng" trong túi áo và hồ sơ sức khỏe được quản lý thông minh trọn đời.
          </p>
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section className={styles.whySection}>
        <h2 className={styles.sectionHeader}>Tại Sao Chọn Chúng Tôi?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>👨‍⚕️</span>
            <h3 className={styles.featureTitle}>Bác Sĩ Uy Tín</h3>
            <p>100% bác sĩ được xác thực chứng chỉ hành nghề và có kinh nghiệm lâu năm.</p>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>📅</span>
            <h3 className={styles.featureTitle}>Đặt Lịch 24/7</h3>
            <p>Chủ động chọn giờ khám phù hợp với lịch trình của bạn, bất kể ngày đêm.</p>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>💰</span>
            <h3 className={styles.featureTitle}>Chi Phí Minh Bạch</h3>
            <p>Giá khám được niêm yết rõ ràng. Không có phí ẩn. Thanh toán an toàn.</p>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>🛡️</span>
            <h3 className={styles.featureTitle}>Bảo Mật Tuyệt Đối</h3>
            <p>Dữ liệu sức khỏe của bạn được mã hóa và bảo vệ theo tiêu chuẩn cao nhất.</p>
          </div>
        </div>
      </section>

      {/* 4. Contact / Call to Action */}
      <section className={styles.contactSection}>
        <h2 className={styles.contactTitle}>Bạn Cần Hỗ Trợ?</h2>
        <p className={styles.contactInfo}>
          Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng lắng nghe bạn.<br/>
          Hotline: <strong>1900-1234</strong> | Email: <strong>support@clinicbooking.com</strong>
        </p>
        <Link to="/" className={styles.contactButton}>
          Đặt Lịch Khám Ngay
        </Link>
      </section>

    </div>
  );
};