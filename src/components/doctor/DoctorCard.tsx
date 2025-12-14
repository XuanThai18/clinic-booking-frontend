import { Link } from 'react-router-dom';
import type { DoctorResponse } from '../../types/doctor.types';
import styles from './DoctorCard.module.css';

type DoctorCardProps = {
  doctor: DoctorResponse;
};

// Định dạng tiền tệ VND
const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

export const DoctorCard = ({ doctor }: DoctorCardProps) => {
  // Ảnh placeholder nếu bác sĩ chưa có ảnh
  // (Em nên tạo 1 file ảnh placeholder trong /public)
  const placeholderImage = '/placeholder-doctorM.webp'; 

  return (
    <div className={styles.doctorCard}>
      <div className={styles.imageWrapper}>
        <img 
          src={doctor.image || placeholderImage} 
          
          alt={doctor.fullName} 
          className={styles.image} 

          // 3. (Mẹo nhỏ) Xử lý khi link ảnh bị lỗi (ví dụ ảnh cũ bị xóa trên Cloudinary)
          // Nó sẽ tự động thay thế bằng ảnh placeholder để không bị vỡ giao diện
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{doctor.fullName}</h3>
        <p className={styles.specialty}>{doctor.specialty.name}</p>
        <p className={styles.clinic}>{doctor.clinic.name}</p>
        <p className={styles.price}>
          {formatter.format(doctor.price)}
        </p>
        <Link to={`/doctors/${doctor.doctorId}`} className={styles.viewButton}>
          Xem Chi Tiết & Đặt Lịch
        </Link>
      </div>
    </div>
  );
};