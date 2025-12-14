import { useEffect, useState } from 'react';
import { getAllAppointmentsApi, updateAppointmentStatusApi } from '../../../services/appointmentService';
import type { AppointmentResponse, AppointmentStatus } from '../../../types/appointment.types';
import styles from './ProcessManagement.module.css';

export const ProcessManagement = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dữ liệu
  const fetchData = async () => {
    try {
      const response = await getAllAppointmentsApi();
      // Sắp xếp theo ngày giờ mới nhất
      setAppointments(response.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm chuyển trạng thái
  const handleMoveStatus = async (id: number, newStatus: AppointmentStatus) => {
    if (!window.confirm(`Xác nhận chuyển sang trạng thái: ${newStatus}?`)) return;

    try {
      await updateAppointmentStatusApi(id, newStatus);
      // Cập nhật UI ngay lập tức (Optimistic update)
      setAppointments(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  // Phân loại danh sách vào các cột
  const pendingApps = appointments.filter(a => a.status === 'PENDING');
  const confirmedApps = appointments.filter(a => a.status === 'CONFIRMED');
  const completedApps = appointments.filter(a => a.status === 'COMPLETED');
  const cancelledApps = appointments.filter(a => a.status === 'CANCELLED');

  // Component con để render 1 thẻ (Card)
  const AppointmentCard = ({ app }: { app: AppointmentResponse }) => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>#{app.id}</span>
        <span>{app.appointmentDate}</span>
      </div>
      
      <div className={styles.patientName}>{app.patientName}</div>
      
      <div className={styles.doctorInfo}>
        👨‍⚕️ {app.doctorName}
      </div>
      
      <div className={styles.timeInfo}>
        ⏰ {app.appointmentTimeSlot}
      </div>

      <div className={styles.actions}>
        {/* Logic nút bấm tùy theo trạng thái hiện tại */}
        
        {/* Cột PENDING: Có thể Duyệt hoặc Hủy */}
        {app.status === 'PENDING' && (
          <>
            <button className={`${styles.btn} ${styles.btnApprove}`} onClick={() => handleMoveStatus(app.id, 'CONFIRMED')}>
              ✔ Duyệt
            </button>
            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={() => handleMoveStatus(app.id, 'CANCELLED')}>
              ✕ Hủy
            </button>
          </>
        )}

        {/* Cột CONFIRMED: Có thể Hoàn thành hoặc Hủy */}
        {app.status === 'CONFIRMED' && (
          <>
            <button className={`${styles.btn} ${styles.btnComplete}`} onClick={() => handleMoveStatus(app.id, 'COMPLETED')}>
              🏁 Xong
            </button>
            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={() => handleMoveStatus(app.id, 'CANCELLED')}>
              ✕ Hủy
            </button>
          </>
        )}

        {/* Các cột khác không cần nút (hoặc có thể thêm nút hoàn tác nếu muốn) */}
        {(app.status === 'COMPLETED' || app.status === 'CANCELLED') && (
            <span style={{fontSize: '0.8rem', color: '#888', fontStyle: 'italic', width: '100%', textAlign: 'center'}}>
                Đã kết thúc
            </span>
        )}
      </div>
    </div>
  );

  if (loading) return <div>Đang tải bảng tiến trình...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản Lý Tiến Trình (Kanban Board)</h2>
      </div>

      <div className={styles.board}>
        {/* CỘT 1: CHỜ DUYỆT */}
        <div className={`${styles.column} ${styles.colPending}`}>
          <div className={styles.columnHeader}>
            CHỜ DUYỆT <span className={styles.countBadge}>{pendingApps.length}</span>
          </div>
          <div className={styles.cardList}>
            {pendingApps.map(app => <AppointmentCard key={app.id} app={app} />)}
          </div>
        </div>

        {/* CỘT 2: ĐÃ DUYỆT / SẮP KHÁM */}
        <div className={`${styles.column} ${styles.colConfirmed}`}>
          <div className={styles.columnHeader}>
            ĐÃ DUYỆT <span className={styles.countBadge}>{confirmedApps.length}</span>
          </div>
          <div className={styles.cardList}>
            {confirmedApps.map(app => <AppointmentCard key={app.id} app={app} />)}
          </div>
        </div>

        {/* CỘT 3: ĐÃ HOÀN THÀNH */}
        <div className={`${styles.column} ${styles.colCompleted}`}>
          <div className={styles.columnHeader}>
            HOÀN THÀNH <span className={styles.countBadge}>{completedApps.length}</span>
          </div>
          <div className={styles.cardList}>
            {completedApps.map(app => <AppointmentCard key={app.id} app={app} />)}
          </div>
        </div>

        {/* CỘT 4: ĐÃ HỦY */}
        <div className={`${styles.column} ${styles.colCancelled}`}>
          <div className={styles.columnHeader}>
            ĐÃ HỦY <span className={styles.countBadge}>{cancelledApps.length}</span>
          </div>
          <div className={styles.cardList}>
            {cancelledApps.map(app => <AppointmentCard key={app.id} app={app} />)}
          </div>
        </div>
      </div>
    </div>
  );
};