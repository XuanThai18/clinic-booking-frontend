import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsersApi, deleteUserApi } from '../../../services/userService';
import type { UserResponse } from '../../../types/auth.types';
import styles from '../specialty/SpecialtyList.module.css'; // Tái sử dụng CSS

export const UserList = () => {
  // --- 1. STATES ---
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại (bắt đầu từ 0)
  const [totalPages, setTotalPages] = useState(0);   // Tổng số trang
  const [totalElements, setTotalElements] = useState(0); // Tổng số bản ghi

  // Filter State
  const [keyword, setKeyword] = useState('');     // Từ khóa tìm kiếm
  const [roleFilter, setRoleFilter] = useState(''); // Lọc theo role

  // --- 2. FETCH DATA (GỌI API) ---
  // Hàm này sẽ chạy lại mỗi khi currentPage, keyword hoặc roleFilter thay đổi
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API với các tham số tìm kiếm và phân trang
        // Mặc định size=10 (em có thể đổi)
        const response = await getAllUsersApi(currentPage, 10, keyword, roleFilter);
        
        // Cập nhật dữ liệu từ UserResponsePage
        setUsers(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } catch (error) {
        console.error(error);
        alert("Lỗi tải danh sách người dùng!");
      } finally {
        setLoading(false);
      }
    };

    // Debounce: Đợi người dùng ngừng gõ 500ms mới gọi API (để tránh gọi liên tục)
    const timeoutId = setTimeout(() => {
        fetchData();
    }, 500);

    // Dọn dẹp timeout cũ nếu người dùng gõ tiếp
    return () => clearTimeout(timeoutId);
  }, [currentPage, keyword, roleFilter]);

  // --- 3. XỬ LÝ SỰ KIỆN ---

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
      setCurrentPage(0); // Reset về trang đầu khi tìm kiếm mới
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRoleFilter(e.target.value);
      setCurrentPage(0); // Reset về trang đầu
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        await deleteUserApi(id);
        // Sau khi xóa, load lại trang hiện tại để cập nhật danh sách
        // (Hoặc có thể lọc mảng users như cũ, nhưng load lại an toàn hơn với phân trang)
        setUsers(prev => prev.filter(item => item.id !== id));
        alert("Xóa thành công!");
      } catch (error) {
        alert("Xóa thất bại!");
      }
    }
  };

  // Hàm tô màu Role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ROLE_SUPER_ADMIN': return '#dc3545'; 
      case 'ROLE_ADMIN': return '#fd7e14'; 
      case 'ROLE_DOCTOR': return '#0d6efd'; 
      case 'ROLE_PATIENT': return '#198754'; 
      default: return '#6c757d'; 
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Người Dùng</h2>
        <Link to="/admin/add-user" className={styles.addButton}>+ Thêm Mới</Link>
      </div>

      {/* --- THANH CÔNG CỤ (FILTER & SEARCH) --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* Ô Tìm Kiếm */}
        <input 
          type="text" 
          placeholder="Tìm theo tên hoặc email..." 
          value={keyword}
          onChange={handleSearchChange}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1, minWidth: '200px' }}
        />
        
        {/* Dropdown Lọc Role */}
        <select 
            value={roleFilter} 
            onChange={handleRoleChange}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px', cursor: 'pointer' }}
        >
            <option value="">Tất cả vai trò</option>
            <option value="ROLE_ADMIN">Quản Trị Viên</option>
            <option value="ROLE_DOCTOR">Bác Sĩ</option>
            <option value="ROLE_PATIENT">Bệnh Nhân</option>
        </select>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className={styles.tableWrapper}>
        {loading ? (
            <div className={styles.loading}>Đang tải dữ liệu...</div>
        ) : (
            <table className={styles.table}>
            <thead>
                <tr>
                <th>ID</th>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vai Trò</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
                </tr>
            </thead>
            <tbody>
                {users.length > 0 ? (
                    users.map((user) => (
                    <tr key={user.id}>
                        <td className={styles.colId}>#{user.id}</td>
                        <td className={styles.colName}>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber || '-'}</td>
                        <td>
                        <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                            {user.roles.map(role => (
                                <span key={role} style={{
                                    backgroundColor: getRoleBadgeColor(role),
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}>
                                    {role.replace('ROLE_', '')}
                                </span>
                            ))}
                        </div>
                        </td>
                        <td>
                            {user.isActive ? (
                                <span style={{color: 'green', fontWeight: 'bold'}}>Hoạt động</span>
                            ) : (
                                <span style={{color: 'red', fontWeight: 'bold'}}>Bị khóa</span>
                            )}
                        </td>
                        <td className={styles.actions}>
                        <Link to={`/admin/edit-user/${user.id}`} className={styles.editButton}>Sửa</Link>
                        <button onClick={() => handleDelete(user.id)} className={styles.deleteButton}>Xóa</button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7} style={{textAlign: 'center', padding: '30px', color: '#666'}}>
                            Không tìm thấy người dùng nào phù hợp.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        )}
      </div>

      {/* --- PHÂN TRANG (PAGINATION) --- */}
      {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', gap: '15px' }}>
              <button 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{
                    padding: '8px 16px', 
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    backgroundColor: currentPage === 0 ? '#eee' : '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '5px'
                }}
              >
                &laquo; Trước
              </button>
              
              <span style={{fontWeight: 'bold', color: '#555'}}>
                  Trang {currentPage + 1} / {totalPages} (Tổng {totalElements} user)
              </span>
              
              <button 
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{
                    padding: '8px 16px', 
                    cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer',
                    backgroundColor: currentPage + 1 >= totalPages ? '#eee' : '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '5px'
                }}
              >
                Sau &raquo;
              </button>
          </div>
      )}
    </div>
  );
};