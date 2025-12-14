import { useEffect, useState, useMemo } from 'react';
import { getDoctorAppointmentsApi } from '../../../services/appointmentService';
import type { AppointmentResponse, AppointmentStatus } from '../../../types/appointment.types';
import styles from '../../admin/doctor/DoctorHistory.module.css';

// --- HÀM HELPER: Xử lý tiếng Việt ---
const removeVietnameseTonesLower = (str: string) => {
  if (!str) return '';
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized.replace(/đ/g, 'd').toLowerCase();
};


// Hàm tô màu trạng thái
const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
        case 'COMPLETED': return { bg: '#198754', color: '#fff', label: 'Đã Khám Xong' };
        case 'CANCELLED': return { bg: '#dc3545', color: '#fff', label: 'Đã Hủy' };
        default: return { bg: '#6c757d', color: '#fff', label: status };
    }
};

export const DoctorHistory = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE BỘ LỌC ---
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' = All, 'COMPLETED', 'CANCELLED'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDoctorAppointmentsApi();
        // Chỉ lấy các lịch đã kết thúc (Completed hoặc Cancelled)
        const history = res.data.filter(a => 
            a.status === 'COMPLETED' || a.status === 'CANCELLED'
        );
        // Sắp xếp mới nhất lên đầu
        setAppointments(history.sort((a, b) => b.id - a.id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOGIC LỌC (Client-side) ---
  const filteredList = useMemo(() => {
      return appointments.filter(app => {
          // 1. Lọc theo từ khóa (Thông minh: Không dấu, không hoa thường)
          // Chuẩn hóa từ khóa tìm kiếm
          const searchClean = removeVietnameseTonesLower(keyword);
          
          // Chuẩn hóa dữ liệu trong bảng để so sánh
          const nameClean = removeVietnameseTonesLower(app.patientName);
          const phoneClean = removeVietnameseTonesLower(app.patientPhone || '');
          const diagnosisClean = removeVietnameseTonesLower(app.diagnosis || '');

          const matchKeyword = 
              nameClean.includes(searchClean) ||
              phoneClean.includes(searchClean) ||
              diagnosisClean.includes(searchClean);

          // 2. Lọc theo trạng thái
          const matchStatus = statusFilter ? app.status === statusFilter : true;

          // 3. Lọc theo ngày
          let matchDate = true;
          if (fromDate || toDate) {
              const appDate = new Date(app.appointmentDate);
              if (fromDate) matchDate = matchDate && appDate >= new Date(fromDate);
              if (toDate) matchDate = matchDate && appDate <= new Date(toDate);
          }

          return matchKeyword && matchStatus && matchDate;
      });
  }, [appointments, keyword, statusFilter, fromDate, toDate]);
  if (loading) return <div className={styles.loading}>Đang tải lịch sử...</div>;

  return (
    <div className={styles.container}>
        <div className={styles.header}>
        <h2 className={styles.title}>Lịch Sử Khám Bệnh</h2>
        </div>

        {/* THANH TÌM KIẾM MỚI */}
        <div className={styles.filterBar}>
        <div className={`${styles.filterGroup} ${styles.searchBox}`}>
            <label className={styles.label}>Tìm kiếm:</label>
            <input 
            type="text" 
            placeholder="Tên bệnh nhân, SĐT, chẩn đoán..." 
            className={styles.input}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            />
        </div>

        <div className={`${styles.filterGroup} ${styles.statusBox}`}>
            <label className={styles.label}>Trạng thái:</label>
            <select 
            className={styles.select}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            >
            <option value="">Tất cả</option>
            <option value="COMPLETED">Đã Khám Xong</option>
            <option value="CANCELLED">Đã Hủy</option>
            </select>
        </div>

        <div className={`${styles.filterGroup} ${styles.dateBox}`}>
            <label className={styles.label}>Từ ngày:</label>
            <input type="date" className={styles.input} value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>

        <div className={`${styles.filterGroup} ${styles.dateBox}`}>
            <label className={styles.label}>Đến ngày:</label>
            <input type="date" className={styles.input} value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        </div>

        {/* BẢNG DỮ LIỆU MỚI */}
        <div className={styles.tableWrapper}>
        <table className={styles.table}>
            <thead>
            <tr>
                <th style={{width: '15%'}}>Ngày Khám</th>
                <th style={{width: '20%'}}>Bệnh Nhân</th>
                <th style={{width: '15%'}}>Trạng Thái</th>
                <th style={{width: '50%'}}>Kết Quả Khám</th>
            </tr>
            </thead>
            <tbody>
            {filteredList.length > 0 ? (
                filteredList.map((app) => {
                const badge = getStatusBadge(app.status);
                return (
                    <tr key={app.id}>
                    <td>
                        <div className={styles.dateCell}>{app.appointmentDate}</div>
                        <div className={styles.timeCell}>{app.appointmentTimeSlot}</div>
                    </td>
                    <td>
                        <div className={styles.patientName}>{app.patientName}</div>
                        <div className={styles.patientPhone}>SĐT: {app.patientPhone || '---'}</div>
                    </td>
                    <td>
                        <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                        {badge.label}
                        </span>
                    </td>
                    <td>
                        {app.status === 'COMPLETED' ? (
                        <div className={`${styles.resultBox} ${styles.completed}`}>
                            <p className={styles.diagnosis}>Chẩn đoán: {app.diagnosis}</p>
                            {app.prescription && (
                            <p className={styles.prescription}>💊 {app.prescription}</p>
                            )}
                        </div>
                        ) : (
                        <span style={{color: '#adb5bd'}}>---</span>
                        )}
                    </td>
                    </tr>
                );
                })
            ) : (
                <tr><td colSpan={4} className={styles.empty}>Không tìm thấy lịch sử nào phù hợp.</td></tr>
            )}
            </tbody>
        </table>
        </div>
    </div>
    );
};