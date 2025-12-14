// Định nghĩa các khung giờ cố định (Hardcode cho tiện)
export const TIME_SLOTS = [
    { id: '08:00', label: '08:00 - 08:30' },
    { id: '08:30', label: '08:30 - 09:00' },
    { id: '09:00', label: '09:00 - 09:30' },
    { id: '09:30', label: '09:30 - 10:00' },
    { id: '10:00', label: '10:00 - 10:30' },
    { id: '10:30', label: '10:30 - 11:00' },
    { id: '11:00', label: '11:00 - 11:30' },
    { id: '11:30', label: '11:30 - 12:00' },
    { id: '13:30', label: '13:30 - 14:00' },
    { id: '14:00', label: '14:00 - 14:30' },
    { id: '14:30', label: '14:30 - 15:00' },
    { id: '15:00', label: '15:00 - 15:30' },
    { id: '15:30', label: '15:30 - 16:00' },
    { id: '16:00', label: '16:00 - 16:30' },
    { id: '16:30', label: '16:30 - 17:00' },
];

export interface ScheduleCreateRequest {
    doctorId: number;
    date: string; // YYYY-MM-DD
    timeSlots: string[]; // ["08:00", "09:00"]
}

export interface ScheduleResponse {
    id: number;
    date: string;
    timeSlot: string;
    status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED'; // Enum
    doctorId: number;
}