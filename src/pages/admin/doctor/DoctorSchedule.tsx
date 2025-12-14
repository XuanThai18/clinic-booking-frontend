import { useState, useEffect } from 'react';
import Select from 'react-select';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import CSS mặc định

import { 
    createDoctorScheduleApi, 
    getDoctorScheduleApi, 
    getMyDoctorProfileApi, 
    getAdminDoctorsApi 
} from '../../../services/doctorService';
import { getWorkingDaysApi } from '../../../services/scheduleService';

import { TIME_SLOTS, type ScheduleResponse } from '../../../types/schedule.types';
import { useAuth } from '../../../store/AuthContext';
import styles from './DoctorSchedule.module.css';

// --- UTILS ---
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Hàm parse giờ an toàn (Sửa lỗi split of undefined)
const getStartHourAndMinute = (slotLabel: string | undefined) => {
    if (!slotLabel) return { hour: 0, minute: 0 };
    try {
        const startTimePart = slotLabel.split(' - ')[0]; // VD: "07:00"
        if (!startTimePart) return { hour: 0, minute: 0 };

        const parts = startTimePart.split(':');
        if (parts.length < 2) return { hour: 0, minute: 0 };

        return { 
            hour: parseInt(parts[0], 10), 
            minute: parseInt(parts[1], 10) 
        };
    } catch (e) {
        return { hour: 0, minute: 0 };
    }
};

// --- STYLES CHO SELECT ---
const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#007bff' : '#ced4da',
    borderRadius: '8px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 123, 255, 0.15)' : 'none',
    '&:hover': { borderColor: '#007bff' }
  }),
  menu: (base: any) => ({ ...base, zIndex: 9999, borderRadius: '8px' }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isSelected ? 'white' : '#333',
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : 'white',
    cursor: 'pointer'
  }),
};

type DoctorOption = { value: number; label: string };

export const DoctorSchedule = () => {
    const { hasRole } = useAuth();
    const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPER_ADMIN');
    const isDoctor = hasRole('ROLE_DOCTOR');

    // --- STATE ---
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
    const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([]);
    
    const [existingSchedules, setExistingSchedules] = useState<ScheduleResponse[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // State hiển thị dấu chấm trên lịch
    const [workingDays, setWorkingDays] = useState<string[]>([]);
    const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());

    // --- 1. KHỞI TẠO ---
    useEffect(() => {
        const init = async () => {
            if (isAdmin) {
                try {
                    const res = await getAdminDoctorsApi();
                    setDoctorOptions(res.data.map(d => ({
                        value: d.doctorId,
                        label: `[#${d.doctorId}] ${d.fullName} - ${d.specialty?.name}`
                    })));
                } catch (err) { console.error(err); }
            } else if (isDoctor) {
                try {
                    const res = await getMyDoctorProfileApi();
                    setSelectedDoctorId(res.data.doctorId);
                } catch (err) { alert("Lỗi tải hồ sơ bác sĩ."); }
            }
        };
        init();
    }, [isAdmin, isDoctor]);

    // --- 2. LOAD WORKING DAYS (DẤU CHẤM) ---
    useEffect(() => {
        if (selectedDoctorId) {
            const year = activeStartDate.getFullYear();
            const month = activeStartDate.getMonth() + 1;
            getWorkingDaysApi(year, month)
                .then(res => setWorkingDays(res.data))
                .catch(console.error);
        } else {
            setWorkingDays([]);
        }
    }, [selectedDoctorId, activeStartDate]);

    // --- 3. LOAD CHI TIẾT LỊCH ---
    useEffect(() => {
        if (selectedDoctorId && selectedDate) {
            setLoading(true);
            const dateStr = formatDate(selectedDate);
            getDoctorScheduleApi(selectedDoctorId, dateStr)
                .then(res => {
                    setExistingSchedules(res.data);
                    setSelectedSlots([]); 
                })
                .finally(() => setLoading(false));
        }
    }, [selectedDoctorId, selectedDate]);

    // --- LOGIC CHECK TRẠNG THÁI SLOT (QUAN TRỌNG) ---
    const getSlotStatus = (slot: any) => { 
        if (!slot) return '';

        // 1. CHẶN QUÁ KHỨ (Nếu là ngày hôm nay)
        const now = new Date();
        const checkDate = new Date(selectedDate);
        const isToday = checkDate.getDate() === now.getDate() && 
                        checkDate.getMonth() === now.getMonth() && 
                        checkDate.getFullYear() === now.getFullYear();

        if (isToday) {
            const { hour, minute } = getStartHourAndMinute(slot.label);
            const slotTime = new Date(); // Lấy ngày giờ hiện tại
            slotTime.setHours(hour, minute, 0); // Gán giờ slot vào

            // Nếu giờ slot nhỏ hơn giờ hiện tại -> Disable
            if (slotTime < now) return 'past'; 
        }

        // 2. CHECK DB
        const schedule = existingSchedules?.find(s => s.timeSlot === slot.id);
        if (schedule) {
            if (schedule.status === 'BOOKED') return 'booked';
            return 'disabled'; // Đã đăng ký
        }

        // 3. CHECK SELECTION
        if (selectedSlots.includes(slot.id)) return 'selected';
        
        return ''; // Trống
    };

    const handleSlotClick = (slot: any) => {
        const status = getSlotStatus(slot);
        if (status === 'booked' || status === 'disabled' || status === 'past') return;

        const slotId = slot.id;
        if (selectedSlots.includes(slotId)) {
            setSelectedSlots(prev => prev.filter(s => s !== slotId));
        } else {
            setSelectedSlots(prev => [...prev, slotId]);
        }
    };

    const handleSave = async () => {
        if (!selectedDoctorId) return alert("Chưa chọn bác sĩ!");
        if (selectedSlots.length === 0) return alert("Chưa chọn giờ!");

        try {
            setLoading(true);
            const dateStr = formatDate(selectedDate);
            await createDoctorScheduleApi({
                doctorId: selectedDoctorId,
                date: dateStr,
                timeSlots: selectedSlots
            });
            
            // Reload
            const res = await getDoctorScheduleApi(selectedDoctorId, dateStr);
            setExistingSchedules(res.data);
            setSelectedSlots([]);

            // Reload dấu chấm
            const year = activeStartDate.getFullYear();
            const month = activeStartDate.getMonth() + 1;
            const wdRes = await getWorkingDaysApi(year, month, selectedDoctorId);
            if (wdRes?.data) setWorkingDays(wdRes.data);

            alert("Lưu lịch thành công!");
        } catch (e) { alert("Lỗi lưu lịch!"); } 
        finally { setLoading(false); }
    };

    return (
        <div className={styles.container}>
            <style>{`
                .dot-marker { height: 6px; width: 6px; background-color: #28a745; border-radius: 50%; margin: 2px auto 0; }
                .react-calendar { width: 100%; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 8px; font-family: inherit; }
                .react-calendar__tile { height: 70px; display: flex; flex-direction: column; align-items: center; padding-top: 10px; }
                .react-calendar__tile--now { background: #e6f7ff; }
                .react-calendar__tile--active { background: #007bff !important; color: white; }
            `}</style>

            <div className={styles.header}>
                <h2 className={styles.title}>
                    {isAdmin ? "Quản Lý Lịch (Admin Mode)" : "Đăng Ký Lịch Làm Việc"}
                </h2>
            </div>

            {isAdmin && (
                <div style={{marginBottom: 20}}>
                    <label style={{fontWeight: 600, display: 'block', marginBottom: 5}}>Chọn Bác sĩ:</label>
                    <Select 
                        options={doctorOptions}
                        placeholder="Tìm bác sĩ..."
                        onChange={(opt) => setSelectedDoctorId(opt?.value || null)}
                        styles={customStyles}
                    />
                </div>
            )}

            {(isAdmin && !selectedDoctorId) ? (
                 <p style={{textAlign: 'center', color: '#666', padding: 30, background: '#f9f9f9', borderRadius: 8}}>
                    Vui lòng chọn một bác sĩ để xem lịch.
                 </p>
            ) : (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'flex-start'}}>
                    {/* CỘT TRÁI: CALENDAR */}
                    <div style={{flex: '1 1 350px'}}>
                        <h4 style={{marginBottom: 10, color: '#007bff'}}>1. Chọn Ngày</h4>
                        <Calendar
                            onChange={(val) => setSelectedDate(val as Date)}
                            value={selectedDate}
                            onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setActiveStartDate(activeStartDate)}
                            tileContent={({ date, view }) => view === 'month' && workingDays.includes(formatDate(date)) ? <div className="dot-marker"></div> : null}
                            locale="vi-VN"
                            minDate={new Date()} // Chặn ngày quá khứ
                        />
                    </div>

                    {/* CỘT PHẢI: SLOTS */}
                    <div style={{flex: '1 1 350px'}}>
                        <h4 style={{marginBottom: 10, color: '#007bff'}}>
                            2. Chọn Giờ ({formatDate(selectedDate)})
                        </h4>
                        
                        <div className={styles.slotsGrid}>
                            {TIME_SLOTS.map(slot => {
                                const status = getSlotStatus(slot);
                                // Xác định class CSS dựa trên status
                                let className = styles.slotItem;
                                if (status === 'booked') className += ` ${styles.booked}`;
                                else if (status === 'disabled') className += ` ${styles.disabled}`;
                                else if (status === 'selected') className += ` ${styles.selected}`;
                                else if (status === 'past') className += ` ${styles.disabled}`; // Style giống disabled

                                return (
                                    <button 
                                        key={slot.id}
                                        className={className}
                                        onClick={() => handleSlotClick(slot)}
                                        disabled={status === 'booked' || status === 'disabled' || status === 'past'}
                                        style={status === 'past' ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                    >
                                        {slot.label} <br/>
                                        {status === 'booked' && <small>(Kín)</small>}
                                        {status === 'disabled' && <small>(Đã ĐK)</small>}
                                        {status === 'past' && <small>(Đã qua)</small>}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{marginTop: 20, borderTop: '1px solid #eee', paddingTop: 20}}>
                            <button 
                                className={styles.saveButton} 
                                onClick={handleSave}
                                disabled={loading || selectedSlots.length === 0}
                                style={{width: '100%', padding: '12px'}}
                            >
                                {loading ? "Đang lưu..." : `Lưu ${selectedSlots.length} Khung Giờ`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};