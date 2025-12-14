import { useEffect, useState, useMemo } from 'react';
import { getAllAppointmentsApi, updateAppointmentStatusApi, deleteAppointmentApi } from '../../services/appointmentService';
import type { AppointmentResponse, AppointmentStatus } from '../../types/appointment.types';
import styles from '../../pages/admin/specialty/SpecialtyList.module.css'; // Tái sử dụng CSS bảng

// Hàm tô màu cho trạng thái
const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
        case 'PENDING': return { bg: '#ffc107', color: '#000', label: 'Chờ Xác Nhận' };
        case 'CONFIRMED': return { bg: '#0d6efd', color: '#fff', label: 'Đã Xác Nhận' };
        case 'COMPLETED': return { bg: '#198754', color: '#fff', label: 'Đã Khám' };
        case 'CANCELLED': return { bg: '#dc3545', color: '#fff', label: 'Đã Hủy' };
        default: return { bg: '#6c757d', color: '#fff', label: status };
    }
};

export const AppointmentList = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CÁC BỘ LỌC ---
  const [keyword, setKeyword] = useState(''); // Tìm tên BN hoặc BS
  const [statusFilter, setStatusFilter] = useState<string>(''); // Lọc trạng thái
  const [dateFilter, setDateFilter] = useState(''); // Lọc ngày khám

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAllAppointmentsApi();
      // Sắp xếp: Mới nhất lên đầu
      const sorted = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAppointments(sorted);
    } catch (error) {
      console.error(error);
      alert("Lỗi tải danh sách lịch hẹn!");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC LỌC DỮ LIỆU (Client-side) ---
  const filteredAppointments = useMemo(() => {
      return appointments.filter(app => {
          const searchLower = keyword.toLowerCase();
          // 1. Tìm theo tên BN hoặc BS
          const matchKeyword = 
              app.patientName.toLowerCase().includes(searchLower) ||
              app.doctorName.toLowerCase().includes(searchLower);
          
          // 2. Lọc theo trạng thái
          const matchStatus = statusFilter ? app.status === statusFilter : true;

          // 3. Lọc theo ngày khám
          const matchDate = dateFilter ? app.appointmentDate === dateFilter : true;

          return matchKeyword && matchStatus && matchDate;
      });
  }, [appointments, keyword, statusFilter, dateFilter]);


  // --- XỬ LÝ THAY ĐỔI TRẠNG THÁI ---
  const handleStatusChange = async (id: number, newStatus: AppointmentStatus) => {
      if (window.confirm(`Bạn có chắc muốn chuyển trạng thái thành "${newStatus}"?`)) {
          try {
              await updateAppointmentStatusApi(id, newStatus);
              // Cập nhật lại giao diện ngay lập tức
              setAppointments(prev => prev.map(app => 
                  app.id === id ? { ...app, status: newStatus } : app
              ));
          } catch (err) {
              alert("Cập nhật thất bại!");
          }
      }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Xóa lịch hẹn này vĩnh viễn?")) {
      try {
        await deleteAppointmentApi(id);
        setAppointments(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        alert("Xóa thất bại!");
      }
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải danh sách...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Lịch Hẹn</h2>
        <button className={styles.addButton} onClick={fetchData}>↻ Tải Lại</button>
      </div>

      {/* --- THANH CÔNG CỤ --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Tìm tên Bác sĩ hoặc Bệnh nhân..." 
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 2 }}
        />
        
        <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}
        >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="PENDING">Chờ Xác Nhận</option>
            <option value="CONFIRMED">Đã Xác Nhận</option>
            <option value="COMPLETED">Đã Khám Xong</option>
            <option value="CANCELLED">Đã Hủy</option>
        </select>

        <input 
          type="date" 
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 1 }}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Bệnh Nhân</th>
              <th>Bác Sĩ</th>
              <th>Ngày Khám</th>
              <th>Giờ</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
                filteredAppointments.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                        <tr key={app.id}>
                            <td className={styles.colId}>#{app.id}</td>
                            <td>
                                <div style={{fontWeight: 600}}>{app.patientName}</div>
                                {/* <div style={{fontSize: '0.8rem', color: '#666'}}>{app.patientPhone}</div> */}
                            </td>
                            <td>
                                <div>{app.doctorName}</div>
                                <div style={{fontSize: '0.8rem', color: '#666'}}>{app.clinicName}</div>
                            </td>
                            <td>{app.appointmentDate}</td>
                            <td style={{fontWeight: 'bold', color: '#007bff'}}>{app.appointmentTimeSlot}</td>
                            <td>
                                <span style={{
                                    backgroundColor: badge.bg,
                                    color: badge.color,
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    {badge.label}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                {/* Nút Duyệt (Chỉ hiện khi đang Pending) */}
                                {app.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleStatusChange(app.id, 'CONFIRMED')}
                                        className={styles.editButton}
                                        style={{backgroundColor: '#28a745', color: 'white'}}
                                        title="Xác nhận lịch"
                                    >
                                        ✓
                                    </button>
                                )}

                                {/* Nút Hủy (Hiện khi chưa hoàn thành/hủy) */}
                                {['PENDING', 'CONFIRMED'].includes(app.status) && (
                                    <button 
                                        onClick={() => handleStatusChange(app.id, 'CANCELLED')}
                                        className={styles.deleteButton}
                                        title="Hủy lịch"
                                    >
                                        ✕
                                    </button>
                                )}
                                
                                {/* Nút Xóa vĩnh viễn (Chỉ cho Admin) */}
                                <button onClick={() => handleDelete(app.id)} style={{border:'none', background:'transparent', cursor:'pointer', marginLeft: 5}}>🗑️</button>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: '20px'}}>Không tìm thấy lịch hẹn nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};