import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Import Services & Types
import { getDoctorByIdApi } from '../../services/doctorService';
import { getPublicDoctorScheduleApi } from '../../services/doctorService';
import { bookAppointmentApi, createPaymentUrlApi } from '../../services/appointmentService';
import { useAuth } from '../../store/AuthContext';
import type { DoctorResponse } from '../../types/doctor.types';
import type { ScheduleResponse } from '../../types/schedule.types';

// Import CSS
import styles from './PatientBooking.module.css';

// Helper Format Date
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper Format Money
const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const PatientBooking = () => {
    const { doctorId } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    // State
    const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
    const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [reason, setReason] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        // Nếu chưa đăng nhập
        if (!isAuthenticated) {
            alert("Vui lòng đăng nhập để thực hiện đặt lịch!");
            
            // Chuyển hướng về Login, NHƯNG kèm theo địa chỉ hiện tại (state: from)
            // Để đăng nhập xong nó tự quay lại trang này 
            navigate('/login', { state: { from: location.pathname } });
        }
    }, [isAuthenticated, navigate, location]);

    // 1. Load Thông tin Bác sĩ
    useEffect(() => {
        if (doctorId) {
            getDoctorByIdApi(Number(doctorId))
                .then(res => setDoctor(res.data))
                .catch(() => alert("Không tìm thấy bác sĩ"));
        }
    }, [doctorId]);

    // 2. Load Lịch khi thay đổi Ngày
    useEffect(() => {
        if (doctorId && selectedDate) {
            const dateStr = formatDate(selectedDate);
            // Gọi API lấy lịch (Em có thể dùng hàm getAvailableSchedules nếu backend đã lọc sẵn,
            // hoặc dùng getDoctorScheduleApi và tự lọc AVAILABLE ở frontend)
            getPublicDoctorScheduleApi(Number(doctorId), dateStr)
                .then(res => {
                    // Chỉ lấy những slot còn AVAILABLE
                    const availableSlots = res.data.filter(s => s.status === 'AVAILABLE');
                    setSchedules(availableSlots);
                    setSelectedScheduleId(null); // Reset chọn giờ khi đổi ngày
                })
                .catch(err => console.error(err));
        }
    }, [doctorId, selectedDate]);

    // 3. Logic chặn giờ quá khứ (cho ngày hôm nay)
    const isSlotValid = (timeSlot: string) => {
        const now = new Date();
        const checkDate = new Date(selectedDate);
        const isToday = checkDate.toDateString() === now.toDateString();

        if (isToday) {
            const [hour, minute] = timeSlot.split(/[: -]/).map(Number); // Parse "08:00"
            const slotTime = new Date();
            slotTime.setHours(hour, minute, 0);
            return slotTime > now; // Chỉ hiện nếu lớn hơn giờ hiện tại
        }
        return true;
    };

    const handleBooking = async () => {
    // --- VALIDATION ---
    if (!isAuthenticated) {
        alert("Vui lòng đăng nhập để đặt lịch!");
        navigate('/login');
        return;
    }
    if (!selectedScheduleId) return alert("Vui lòng chọn giờ khám!");
    if (!reason.trim()) return alert("Vui lòng nhập lý do khám!");

    // --- CONFIRMATION ---
    if (!window.confirm(`Xác nhận đặt lịch và thanh toán với Bác sĩ ${doctor?.fullName}?`)) {
        return;
    }

    try {
        setIsBooking(true); // Bật loading

        // --- BƯỚC 1: ĐẶT LỊCH (Gọi API tách riêng) ---
        const bookingResponse = await bookAppointmentApi({
            doctorId: Number(doctorId),
            scheduleId: selectedScheduleId,
            reason: reason
        });

        // Lấy ID an toàn (fallback để tránh lỗi null)
        const appointmentId = bookingResponse.data?.id; 

        if (!appointmentId) throw new Error("Không lấy được ID lịch hẹn");

        // --- BƯỚC 2: THANH TOÁN ---
        // Gọi API lấy link VNPay (Không cần truyền tiền, Backend tự tính)
        const paymentResponse = await createPaymentUrlApi(appointmentId);

        // --- BƯỚC 3: REDIRECT ---(backend trả về JSON { "url": "..." })
        if (paymentResponse.data && paymentResponse.data.url) {
        // Chuyển hướng sang VNPay
        window.location.href = paymentResponse.data.url; 
        } else {
            throw new Error("Hệ thống không trả về link thanh toán hợp lệ.");
        }

    } catch (error: any) {
        setIsBooking(false); // Tắt loading nếu lỗi
        console.error("Lỗi quy trình đặt lịch:", error);
        
        const msg = error.response?.data?.message || "Đặt lịch thất bại. Vui lòng thử lại.";
        alert(msg);
    }
    // Lưu ý: Nếu thành công thì trang sẽ redirect nên không cần setIsBooking(false) ở trường hợp success
};

    if (!doctor) return <div className={styles.container}>Đang tải thông tin...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {/* CỘT TRÁI: THÔNG TIN BÁC SĨ */}
                <div className={styles.leftCol}>
                    <div className={styles.doctorCard}>
                        <img 
                            src={doctor.image || "https://via.placeholder.com/150"} 
                            alt={doctor.fullName} 
                            className={styles.avatar} 
                        />
                        <h3 className={styles.docName}>{doctor.fullName}</h3>
                        <div className={styles.docSpecialty}>{doctor.specialty?.name}</div>
                        <p style={{fontSize:'0.9rem', color:'#666'}}>{doctor.clinic?.name}</p>
                        <p style={{fontSize:'0.9rem', color:'#666'}}>{doctor.clinic?.address}</p>
                        
                        <div className={styles.docPrice}>
                            Giá khám: {formatMoney(doctor.price)}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: CHỌN LỊCH */}
                <div className={styles.rightCol}>
                    <div className={styles.scheduleSection}>
                        <div className={styles.sectionTitle}>
                            <span className={styles.icon}>1</span> Chọn Ngày Khám
                        </div>
                        <Calendar 
                            onChange={(val) => setSelectedDate(val as Date)} 
                            value={selectedDate}
                            minDate={new Date()} // Chặn ngày quá khứ
                            locale="vi-VN"
                        />
                        
                        <div className={styles.sectionTitle} style={{marginTop: 30}}>
                            <span className={styles.icon}>2</span> Chọn Giờ Khám
                        </div>

                        {schedules.length === 0 ? (
                            <p style={{color: '#666', padding: 20, textAlign: 'center', background: '#f9f9f9', borderRadius: 8}}>
                                Bác sĩ không có lịch trống vào ngày này.
                            </p>
                        ) : (
                            <div className={styles.slotsGrid}>
                                {schedules.map(slot => {
                                    const isValid = isSlotValid(slot.timeSlot);
                                    return (
                                        <button
                                            key={slot.id}
                                            disabled={!isValid}
                                            onClick={() => isValid && setSelectedScheduleId(slot.id)}
                                            className={`
                                                ${styles.slotBtn} 
                                                ${selectedScheduleId === slot.id ? styles.selectedSlot : ''}
                                                ${!isValid ? styles.disabledSlot : ''}
                                            `}
                                        >
                                            {slot.timeSlot}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Ô NHẬP LÝ DO & NÚT ĐẶT */}
                        {selectedScheduleId && (
                            <div className={styles.reasonBox}>
                                <div className={styles.sectionTitle}>
                                    <span className={styles.icon}>3</span> Thông tin bổ sung
                                </div>
                                <label style={{fontWeight: 600, fontSize: '0.9rem'}}>Lý do khám / Triệu chứng (*):</label>
                                <textarea 
                                    className={styles.textarea}
                                    rows={3}
                                    placeholder="Ví dụ: Đau đầu, sốt nhẹ 2 ngày nay..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                                
                                <button 
                                    className={styles.bookBtn}
                                    onClick={handleBooking}
                                    disabled={isBooking || !reason.trim()}
                                >
                                    {isBooking ? "Đang xử lý..." : "Xác Nhận Đặt Lịch"}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};