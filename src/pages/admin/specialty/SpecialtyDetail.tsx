import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Services
import { getSpecialtyByIdApi } from '../../../services/specialtyService';
import { getDoctorsBySpecialtyApi } from '../../../services/doctorService';
// Types & Components
import type { SpecialtyResponse } from '../../../types/specialty.types';
import type { DoctorResponse } from '../../../types/doctor.types';
import { DoctorCard } from '../../../components/doctor/DoctorCard';
// CSS (Tái sử dụng CSS của trang tìm kiếm cho nhanh, hoặc tạo file mới)
import styles from '../../FindDoctorPage.module.css'; 

export const SpecialtyDetail = () => {
  const { id } = useParams();
  const specialtyId = Number(id);

  const [specialty, setSpecialty] = useState<SpecialtyResponse | null>(null);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song 2 API
        const [specRes, docsRes] = await Promise.all([
            getSpecialtyByIdApi(specialtyId),
            getDoctorsBySpecialtyApi(specialtyId)
        ]);

        setSpecialty(specRes.data);
        setDoctors(docsRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (specialtyId) {
        fetchData();
    }
  }, [specialtyId]);

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}>Đang tải...</div>;
  if (!specialty) return <div style={{textAlign: 'center', marginTop: 50}}>Không tìm thấy chuyên khoa.</div>;

  return (
    <div className={styles.pageContainer}>
      {/* Phần Header của Chuyên Khoa */}
      <div style={{ 
          marginBottom: '30px', 
          padding: '30px', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
      }}>
        <h1 className={styles.title} style={{marginBottom: '10px'}}>{specialty.name}</h1>
        <p style={{ color: '#666', lineHeight: '1.6' }}>
            {specialty.description || "Chưa có mô tả cho chuyên khoa này."}
        </p>
      </div>

      {/* Danh sách Bác sĩ thuộc khoa này */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>
          Đội ngũ bác sĩ ({doctors.length})
      </h2>

      <div className={styles.doctorGrid}>
        {doctors.length > 0 ? (
          doctors.map(doctor => (
            <DoctorCard key={doctor.doctorId} doctor={doctor} />
          ))
        ) : (
          <p>Chưa có bác sĩ nào trong chuyên khoa này.</p>
        )}
      </div>
    </div>
  );
};