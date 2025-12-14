import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDoctorsApi, deleteDoctorApi } from '../../../services/doctorService';
import type { DoctorResponse } from '../../../types/doctor.types';
import styles from '../specialty/SpecialtyList.module.css'; // Tái sử dụng CSS bảng

// Hàm định dạng tiền tệ
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const DoctorList = () => {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAdminDoctorsApi();
      setDoctors(response.data);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải danh sách bác sĩ!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ bác sĩ này không?")) {
      try {
        await deleteDoctorApi(id);
        setDoctors(prev => prev.filter(item => item.doctorId !== id));
      } catch (error) {
        alert("Xóa thất bại!");
      }
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Bác Sĩ</h2>
        <Link to="/admin/add-doctor" className={styles.addButton}>+ Thêm Hồ Sơ</Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Avatar</th>
              <th>Họ Tên</th>
              <th>Học Vị</th>
              <th>Chuyên Khoa</th>
              <th>Phòng Khám</th>
              <th>Giá Khám</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.doctorId}>
                <td className={styles.colId}>#{doc.doctorId}</td>
                <td>
                  {doc.image ? (
                    <img src={doc.image} alt={doc.fullName} className={styles.specialtyImage} style={{borderRadius: '50%'}} />
                  ) : (
                    <span className={styles.noImage}>N/A</span>
                  )}
                </td>
                <td className={styles.colName}>{doc.fullName}</td>
                <td>{doc.academicDegree}</td>
                <td>{doc.specialty?.name}</td>
                <td>{doc.clinic?.name}</td>
                <td style={{fontWeight: 'bold', color: '#28a745'}}>{formatMoney(doc.price)}</td>
                <td className={styles.actions}>
                  <Link to={`/admin/edit-doctor/${doc.doctorId}`} className={styles.editButton}>Sửa</Link>
                  <button onClick={() => handleDelete(doc.doctorId)} className={styles.deleteButton}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};