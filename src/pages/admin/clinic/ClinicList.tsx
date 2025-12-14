import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllClinicsApi, deleteClinicApi } from '../../../services/clinicService';
import type { ClinicResponse } from '../../../types/clinic.types';
// Tái sử dụng CSS của SpecialtyList cho đồng bộ
import styles from '../specialty/SpecialtyList.module.css'; 

export const ClinicList = () => {
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAllClinicsApi();
      setClinics(response.data);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải danh sách phòng khám!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng khám này không?")) {
      try {
        await deleteClinicApi(id);
        setClinics(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        alert("Xóa thất bại! Có thể phòng khám đang có bác sĩ làm việc.");
      }
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Phòng Khám</h2>
        <Link to="/admin/add-clinic" className={styles.addButton}>
          + Thêm Mới
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên Phòng Khám</th>
              <th>Địa Chỉ</th>
              <th>SĐT</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr key={clinic.id}>
                <td className={styles.colId}>#{clinic.id}</td>
                <td>
                  {clinic.imageUrls ? (
                    <img src={clinic.imageUrls[0]} alt={clinic.name} className={styles.specialtyImage} />
                  ) : (
                    <span className={styles.noImage}>No Image</span>
                  )}
                </td>
                <td className={styles.colName}>{clinic.name}</td>
                <td>{clinic.address}</td>
                <td>{clinic.phoneNumber}</td>
                <td className={styles.actions}>
                  <Link to={`/admin/edit-clinic/${clinic.id}`} className={styles.editButton}>
                    Sửa
                  </Link>
                  <button onClick={() => handleDelete(clinic.id)} className={styles.deleteButton}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};