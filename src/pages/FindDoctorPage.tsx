import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './FindDoctorPage.module.css';

// Import components
import { DoctorCard } from '../components/doctor/DoctorCard';
import { removeAccents } from '../utils/stringUtils';

// Import services
import { getPublicDoctorsApi } from '../services/doctorService';
import { getAllSpecialtiesApi } from '../services/specialtyService';
import { getAllClinicsApi } from '../services/clinicService';

// Import types
import type { DoctorResponse } from '../types/doctor.types';
import type { SpecialtyResponse } from '../types/specialty.types';
import type { ClinicResponse } from '../types/clinic.types';

export const FindDoctorPage = () => {
  // --- STATES ---
  const [searchParams] = useSearchParams();

  // 1. State dữ liệu gốc (chỉ chứa dữ liệu thô từ API)
  const [allDoctors, setAllDoctors] = useState<DoctorResponse[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  
  // 2. State cho UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 3. State cho bộ lọc (Inputs)
  const [nameFilter, setNameFilter] = useState(searchParams.get('q') || '');
  const [specialtyFilter, setSpecialtyFilter] = useState(''); 
  const [clinicFilter, setClinicFilter] = useState(''); 

  // --- EFFECTS ---

  // 1. Tải dữ liệu ban đầu 
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [doctorsRes, specialtiesRes, clinicsRes] = await Promise.all([
          getPublicDoctorsApi(),
          getAllSpecialtiesApi(),
          getAllClinicsApi()
        ]);
        
        setAllDoctors(doctorsRes.data);
        setSpecialties(specialtiesRes.data);
        setClinics(clinicsRes.data);
        
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // 2. Sync URL với ô tìm kiếm (Logic giữ nguyên, nhưng tối ưu hơn)
  useEffect(() => {
    const query = searchParams.get('q');
    // Chỉ cập nhật nếu giá trị thực sự khác nhau để tránh render thừa
    if (query !== null && query !== nameFilter) {
      setNameFilter(query);
    } else if (query === null && nameFilter !== '') {
      setNameFilter(''); // Xử lý trường hợp người dùng xóa query trên URL
    }
  }, [searchParams]); // Chỉ chạy khi URL thay đổi

  // --- USE MEMO: LOGIC LỌC DỮ LIỆU ---
  const filteredDoctors = useMemo(() => {
    let result = allDoctors;

    // 1. LỌC TỔNG HỢP (Tên Bác sĩ OR Chuyên khoa OR Phòng khám)
    if (nameFilter.trim()) {
      // CHUẨN HÓA TỪ KHÓA TÌM KIẾM:
      // Chuyển về chữ thường -> Bỏ dấu
      // Ví dụ: "Thái" -> "thai"
      const normalizedSearchTerm = removeAccents(nameFilter.toLowerCase());
      
      result = result.filter((doctor: DoctorResponse) => {
        // CHUẨN HÓA DỮ LIỆU TRONG DANH SÁCH:
        
        // 1. Tên Bác sĩ
        const nameNormalized = removeAccents(doctor.fullName.toLowerCase());
        const matchName = nameNormalized.includes(normalizedSearchTerm);
        
        // 2. Tên Chuyên khoa
        const specialtyNormalized = doctor.specialty 
            ? removeAccents(doctor.specialty.name.toLowerCase()) 
            : '';
        const matchSpecialty = specialtyNormalized.includes(normalizedSearchTerm);
        
        // 3. Tên Phòng khám
        const clinicNormalized = doctor.clinic 
            ? removeAccents(doctor.clinic.name.toLowerCase()) 
            : '';
        const matchClinic = clinicNormalized.includes(normalizedSearchTerm);

        // Trả về TRUE nếu khớp bất kỳ điều kiện nào
        return matchName || matchSpecialty || matchClinic;
      });
    }
    
    // 2. Lọc theo Dropdown Chuyên khoa (Giữ nguyên)
    if (specialtyFilter) {
      const specId = parseInt(specialtyFilter);
      result = result.filter((doctor: DoctorResponse) => doctor.specialty?.id === specId);
    }
    
    // 3. Lọc theo Dropdown Phòng khám (Giữ nguyên)
    if (clinicFilter) {
      const clinicId = parseInt(clinicFilter);
      result = result.filter((doctor: DoctorResponse) => doctor.clinic?.id === clinicId);
    }
    
    return result;
  }, [nameFilter, specialtyFilter, clinicFilter, allDoctors]);

  // --- RENDER LOGIC ---
  
  if (loading) return <div className={styles.loading}>Đang tải dữ liệu bác sĩ...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Tìm Kiếm Bác Sĩ</h1>
      
      {/* Thanh Lọc */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="name">Tên Bác Sĩ</label>
          <input
            type="text"
            id="name"
            className={styles.filterInput}
            placeholder="Nhập tên bác sĩ, phòng khám, chuyên khoa..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="specialty">Chuyên Khoa</label>
          <select
            id="specialty"
            className={styles.filterSelect}
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map(spec => (
              <option key={spec.id} value={spec.id}>{spec.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="clinic">Phòng Khám</label>
          <select
            id="clinic"
            className={styles.filterSelect}
            value={clinicFilter}
            onChange={e => setClinicFilter(e.target.value)}
          >
            <option value="">Tất cả phòng khám</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lưới hiển thị các bác sĩ */}
      <div className={styles.doctorGrid}>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <DoctorCard key={doctor.doctorId} doctor={doctor} />
          ))
        ) : (
          <p className={styles.noResults}>Không tìm thấy bác sĩ nào phù hợp với tiêu chí.</p>
        )}
      </div>
    </div>
  );
};