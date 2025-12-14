import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorByIdApi } from '../../../services/doctorService';
import type { DoctorResponse } from '../../../types/doctor.types';
import styles from './DoctorDetail.module.css';

/// 1. Format tiền tệ
const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

// 2. Map hiển thị giới tính
const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác'
};

// 3. Hàm tính tuổi từ chuỗi ngày sinh (YYYY-MM-DD)
const calculateAge = (birthday?: string): string | number => {
    if (!birthday) return "N/A";
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    // Nếu chưa đến sinh nhật trong năm nay thì trừ 1 tuổi
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

export const DoctorDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const placeholderImage = '/placeholder-doctorM.webp';

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await getDoctorByIdApi(Number(id));
        setDoctor(response.data);
      } catch (err) {
        console.error(err);
        setError("Không tìm thấy thông tin bác sĩ.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleBookAppointment = () => {
    navigate(`/booking/${id}`);
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}>Đang tải thông tin...</div>;
  if (error || !doctor) return <div style={{textAlign: 'center', marginTop: 50, color: 'red'}}>{error || "Lỗi dữ liệu"}</div>;

  return (
    <div className={styles.container}>
      
      {/* --- CỘT TRÁI --- */}
      <div className={styles.leftColumn}>
        <div className={styles.avatarWrapper}>
          <img 
            src={doctor.image || placeholderImage} 
            alt={doctor.fullName} 
            className={styles.avatar}
            onError={(e) => e.currentTarget.src = placeholderImage}
          />
        </div>
        
        <div className={styles.priceTag}>
          <div className={styles.priceLabel}>GIÁ KHÁM:</div>
          <div className={styles.priceValue}>{formatter.format(doctor.price)}</div>
        </div>

        <button onClick={handleBookAppointment} className={styles.bookButton}>
          ĐẶT LỊCH NGAY
        </button>
      </div>

      {/* --- CỘT PHẢI --- */}
      <div className={styles.rightColumn}>
        <h1 className={styles.name}>{doctor.fullName}</h1>
        <span className={styles.academicDegree}>{doctor.academicDegree}</span>

        {/* THÔNG TIN CÁ NHÂN & CÔNG TÁC */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông Tin Bác Sĩ</h3>
          
          {/* Giới tính */}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Giới tính:</span>
            <span className={styles.infoValue}>
                {doctor.gender ? GENDER_LABELS[doctor.gender] : 'Chưa cập nhật'}
            </span>
          </div>

          {/* Tuổi (Tính toán tự động) */}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tuổi:</span>
            <span className={styles.infoValue}>
                {calculateAge(doctor.birthday)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Chuyên khoa:</span>
            <span className={styles.infoValue}>{doctor.specialty.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phòng khám:</span>
            <span className={styles.infoValue}>{doctor.clinic.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Địa chỉ:</span>
            <span className={styles.infoValue}>{doctor.clinic.address}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Giới Thiệu</h3>
          <p className={styles.description}>
            {doctor.description || "Bác sĩ chưa cập nhật mô tả."}
          </p>
        </div>
        
        {doctor.otherImages && doctor.otherImages.length > 0 && (
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Chứng Chỉ & Bằng Cấp</h3>
                <div style={{display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10}}>
                    {doctor.otherImages.map((img, idx) => (
                        <img key={idx} src={img} alt="Cert" style={{height: 120, borderRadius: 5, border: '1px solid #ddd', cursor: 'pointer'}} onClick={() => window.open(img, '_blank')} />
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};