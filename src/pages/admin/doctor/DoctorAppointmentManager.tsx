import { useEffect, useState } from 'react';
import { getDoctorAppointmentsApi, updateAppointmentStatusApi, completeAppointmentApi } from '../../../services/appointmentService'; // Import thêm API mới
import type { AppointmentResponse, AppointmentStatus } from '../../../types/appointment.types';
import styles from '../../admin/specialty/SpecialtyList.module.css'; // CSS bảng
import stylesForm from '../../admin/user/UserForm.module.css'; // CSS Form
import modalStyles from '../../admin/doctor/DoctorModal.module.css';

// Hàm tô màu trạng thái
const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
        case 'PENDING': return { bg: '#ffc107', color: '#000', label: 'Chờ Xác Nhận' };
        case 'CONFIRMED': return { bg: '#0d6efd', color: '#fff', label: 'Sắp Khám' };
        case 'COMPLETED': return { bg: '#198754', color: '#fff', label: 'Đã Khám Xong' };
        case 'CANCELLED': return { bg: '#dc3545', color: '#fff', label: 'Đã Hủy' };
        default: return { bg: '#6c757d', color: '#fff', label: status };
    }
};

export const DoctorAppointmentManager = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE CHO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState(''); // Đổi tên 'note' thành 'prescription' cho khớp DTO backend

  // --- LOAD DỮ LIỆU ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDoctorAppointmentsApi();
      // Sắp xếp: Lịch mới nhất hoặc sắp đến giờ khám lên đầu
      setAppointments(res.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ MỞ MODAL KHÁM ---
  const handleOpenCompleteModal = (id: number) => {
      setSelectedAppId(id);
      setDiagnosis('');
      setPrescription('');
      setIsModalOpen(true);
  };

  // --- XỬ LÝ LƯU KẾT QUẢ KHÁM ---
  const handleSaveResult = async () => {
      if (!selectedAppId) return;
      if (!diagnosis.trim()) { alert("Vui lòng nhập chẩn đoán!"); return; }

      try {
          // Gọi API hoàn tất (Backend sẽ set status = COMPLETED)
          await completeAppointmentApi(selectedAppId, { diagnosis, prescription });
          
          // Cập nhật UI
          setAppointments(prev => prev.map(app => 
              app.id === selectedAppId ? { ...app, status: 'COMPLETED' } : app
          ));
          
          alert("Đã lưu bệnh án và hoàn tất lịch hẹn!");
          setIsModalOpen(false); // Đóng modal

      } catch (e) { 
          console.error(e);
          alert("Lỗi khi lưu kết quả khám."); 
      }
  };

  // --- XỬ LÝ HỦY LỊCH ---
  const handleCancel = async (id: number) => {
      if(window.confirm("Bạn muốn hủy lịch hẹn này?")) {
          try {
              await updateAppointmentStatusApi(id, 'CANCELLED');
              setAppointments(prev => prev.map(app => app.id === id ? {...app, status: 'CANCELLED'} : app));
          } catch (e) { alert("Lỗi cập nhật"); }
      }
  };

  if (loading) return <div className={styles.loading}>Đang tải danh sách...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Danh Sách Bệnh Nhân Đặt Lịch</h2>
        <button className={styles.addButton} onClick={fetchData} style={{background:'#007bff'}}>Làm mới</button>
      </div>

      {/* --- BẢNG DANH SÁCH --- */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Bệnh Nhân</th>
              <th>SĐT</th>
              <th>Ngày Khám</th>
              <th>Giờ</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
                appointments.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                        <tr key={app.id}>
                            <td className={styles.colId}>#{app.id}</td>
                            <td className={styles.colName}>{app.patientName}</td>
                            <td>{app.patientPhone || "---"}</td>
                            <td>{app.appointmentDate}</td>
                            <td style={{fontWeight: 'bold', color: '#007bff'}}>{app.appointmentTimeSlot}</td>
                            <td>
                                <span style={{
                                    backgroundColor: badge.bg, color: badge.color,
                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem'
                                }}>
                                    {badge.label}
                                </span>
                            </td>
                            <td className={styles.actions}>
                                {/* Nút Khám Xong (Mở Modal) - Chỉ hiện khi Đã Xác Nhận */}
                                {app.status === 'CONFIRMED' && (
                                    <button 
                                        onClick={() => handleOpenCompleteModal(app.id)}
                                        className={styles.addButton} 
                                        style={{padding: '6px 10px', fontSize: '0.8rem', marginRight: 5}}
                                        title="Nhập kết quả khám"
                                    >
                                        📝 Khám & Kết Luận
                                    </button>
                                )}

                                {/* Nút Hủy */}
                                {['PENDING', 'CONFIRMED'].includes(app.status) && (
                                    <button 
                                        onClick={() => handleCancel(app.id)}
                                        className={styles.deleteButton}
                                        style={{fontSize: '0.8rem'}}
                                        title="Hủy hẹn"
                                    >
                                        ✕
                                    </button>
                                )}
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: 20}}>Chưa có lịch hẹn nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL NHẬP KẾT QUẢ KHÁM --- */}
      {isModalOpen && (
    <div className={modalStyles.overlay}>
        <div className={modalStyles.modal}>
            
            {/* HEADER */}
            <div className={modalStyles.header}>
                <h3 className={modalStyles.title}>
                    Kết Quả Khám Bệnh <span style={{fontWeight:'normal', color:'#666'}}>(Mã #{selectedAppId})</span>
                </h3>
            </div>
            
            {/* BODY */}
            <div className={modalStyles.body}>
                {/* Input Chẩn đoán */}
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Chẩn đoán bệnh <span style={{color:'red'}}>*</span>:</label>
                    <input 
                        className={modalStyles.input} 
                        value={diagnosis} 
                        onChange={e => setDiagnosis(e.target.value)} 
                        placeholder="VD: Viêm họng cấp, Sốt xuất huyết..."
                        autoFocus // Tự động focus vào ô này khi mở modal
                    />
                </div>
                
                {/* Input Đơn thuốc */}
                <div className={modalStyles.formGroup}>
                    <label className={modalStyles.label}>Đơn thuốc / Dặn dò:</label>
                    <textarea 
                        className={modalStyles.textarea} 
                        rows={5} 
                        value={prescription} 
                        onChange={e => setPrescription(e.target.value)} 
                        placeholder="VD: Thuốc Paracetamol (sáng/tối), uống nhiều nước, tái khám sau 3 ngày..."
                    />
                </div>
            </div>

            {/* FOOTER (BUTTONS) */}
            <div className={modalStyles.footer}>
                <button 
                    className={`${modalStyles.btn} ${modalStyles.btnCancel}`}
                    onClick={() => setIsModalOpen(false)}
                >
                    Hủy Bỏ
                </button>
                <button 
                    className={`${modalStyles.btn} ${modalStyles.btnSave}`}
                    onClick={handleSaveResult} 
                >
                    Lưu & Hoàn Tất
                </button>
            </div>
        </div>
    </div>
)}
    </div>
  );
};