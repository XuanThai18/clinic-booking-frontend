import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSpecialtiesApi, deleteSpecialtyApi, updateSpecialtyApi } from '../../../services/specialtyService'; 
import type { SpecialtyResponse } from '../../../types/specialty.types';
import styles from './SpecialtyList.module.css'; // 1. Import CSS Module

export const SpecialtyList = () => {
  const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllSpecialtiesApi();
        setSpecialties(response.data);
      } catch (error) {
        console.error(error);
        alert("Lỗi tải danh sách!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyên khoa này không?")) {
      try {
        await deleteSpecialtyApi(id); 
        console.log("Đang xóa ID:", id);
        setSpecialties(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        alert("Xóa thất bại!");
      }
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải danh sách...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Chuyên Khoa</h2>
        <Link to="/admin/add-specialty" className={styles.addButton}>
          + Thêm Mới
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình Ảnh</th>
              <th>Tên Chuyên Khoa</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {specialties.map((spec) => (
              <tr key={spec.id}>
                <td className={styles.colId}>#{spec.id}</td>
                <td>
                  {spec.imageUrls && spec.imageUrls.length > 0 ? (
                    <img 
                        src={spec.imageUrls[0]} 
                        alt={spec.name} 
                        className={styles.specialtyImage} 
                    />
                  ) : (
                    <span className={styles.noImage}>No Image</span>
                  )}
                </td>
                <td className={styles.colName}>{spec.name}</td>
                <td className={styles.actions}>
                  <Link to={`/admin/edit-specialty/${spec.id}`} className={styles.editButton}>
                    Sửa
                  </Link>
                  <button onClick={() => handleDelete(spec.id)} className={styles.deleteButton}>
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