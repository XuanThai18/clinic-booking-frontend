import { useEffect, useState } from 'react';
import { getMyHistoryApi, cancelMyAppointmentApi } from '../../services/patientService';
import { createPaymentUrlApi } from '../../services/appointmentService';
import type { AppointmentResponse } from '../../types/appointment.types';
import styles from '../admin/specialty/SpecialtyList.module.css'; // Tái sử dụng CSS bảng
import StatusBadge from '../../components/common/StatusBadge.tsx';

export const PatientAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMyHistoryApi();
      // Sắp xếp lịch mới nhất lên đầu
      setAppointments(res.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointment: AppointmentResponse) => {
    // 1. Tạo thông báo tùy theo trạng thái
    let confirmMessage = "Bạn có chắc chắn muốn hủy lịch hẹn này không?";

    // Logic nghiệp vụ: Nếu đã trả tiền thì phải cảnh báo về tiền nong
    if (appointment.status === 'CONFIRMED') {
        confirmMessage = "Lịch hẹn này ĐÃ THANH TOÁN. Nếu hủy, hệ thống sẽ tiến hành thủ tục hoàn tiền (chờ duyệt). Bạn có chắc chắn muốn hủy?";
    }

    // 2. Hiện Popup xác nhận
    if (!window.confirm(confirmMessage)) return;

    try {
        // 3. Gọi API (Dùng hàm đã tách file, KHÔNG dùng axios trực tiếp)
        await cancelMyAppointmentApi(appointment.id);
        
        alert("Yêu cầu hủy thành công!");
        
        // 4. Tải lại danh sách để cập nhật trạng thái mới
        fetchData(); 

    } catch (error: any) {
        // 5. Hiển thị thông báo lỗi chính xác từ Backend (Ví dụ: "Quá 2 tiếng không được hủy")
        const errorMessage = error.response?.data?.message || "Không thể hủy lịch hẹn này.";
        alert(errorMessage);
    }
};

  // Helper: Màu trạng thái
  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'PENDING': return <span style={{color: '#ffc107', fontWeight: 'bold'}}>Chờ xác nhận</span>;
          case 'CONFIRMED': return <span style={{color: '#0d6efd', fontWeight: 'bold'}}>Đã xác nhận</span>;
          case 'COMPLETED': return <span style={{color: '#198754', fontWeight: 'bold'}}>Đã khám xong</span>;
          case 'CANCELLED': return <span style={{color: '#dc3545', fontWeight: 'bold'}}>Đã hủy</span>;
          default: return status;
      }
  };

  const handleRepay = async (appointmentId: number) => {
      try {
        // Gọi API Backend để lấy link VNPay
        const res = await createPaymentUrlApi(appointmentId);
        
        // Truy cập vào thuộc tính .url
        if (res.data && res.data.url) {
            window.location.href = res.data.url; // Chuyển trang sang VNPay
        } 
    } catch (error) {
        console.error(error); // Log lỗi để dễ debug
        alert("Không thể tạo link thanh toán. Vui lòng thử lại sau.");
    }
  };

  if (loading) return <div>Đang tải lịch sử...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Lịch Sử Khám Bệnh Của Tôi</h2>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Ngày Khám</th>
              <th>Giờ</th>
              <th>Bác Sĩ</th>
              <th>Phòng Khám</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
                appointments.map(app => (
                    <tr key={app.id}>
                        <td>#{app.id}</td>
                        <td>{app.appointmentDate}</td>
                        <td style={{fontWeight: 'bold', color: '#007bff'}}>{app.appointmentTimeSlot}</td>
                        <td>
                            {app.doctorName} <br/>
                            <small style={{color: '#666'}}>{app.specialtyName}</small>
                        </td>
                        <td>{app.clinicName}</td>
                        
                        {/* 1. Thay thế hàm cũ bằng Component Badge */}
                        <td>
                            <StatusBadge status={app.status} />
                        </td>

                        <td>
                            {/* CASE 1: Đã khám xong -> Hiện kết quả */}
                            {app.status === 'COMPLETED' ? (
                                <div style={{maxWidth: 200, fontSize: '0.9rem'}}>
                                    <strong>Chẩn đoán:</strong> {app.diagnosis || "Chưa cập nhật"} <br/>
                                    {app.prescription && <small>Thuốc: {app.prescription}</small>}
                                </div>
                            ) : (
                                /* CASE 2: Chưa hoàn thành -> Hiện các nút hành động */
                                <div style={{display: 'flex', gap: '5px'}}>
                                    
                                    {/* Nút Thanh toán (Chỉ hiện khi chưa trả tiền) */}
                                    {(app.status === 'PENDING_PAYMENT' || app.status === 'PENDING') && (
                                        <button 
                                            className="btn btn-warning btn-sm"
                                            style={{color: '#000', fontWeight: 'bold'}}
                                            onClick={() => handleRepay(app.id)}
                                        >
                                            Thanh toán
                                        </button>
                                    )}

                                    {/* Nút Hủy (Hiện khi PENDING hoặc CONFIRMED) */}
                                    {['PENDING', 'PENDING_PAYMENT', 'CONFIRMED'].includes(app.status) && (
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleCancel(app)}
                                        >
                                            Hủy
                                        </button>
                                    )}
                                </div>
                            )}
                        </td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: 20}}>Bạn chưa đặt lịch khám nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};