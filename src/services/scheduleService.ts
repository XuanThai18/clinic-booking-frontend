import api from '../lib/axios';

export const getWorkingDaysApi = (year: number, month: number, doctorId?: number) => {
  return api.get<string[]>(`/doctor/schedules/working-days`, {
    params: { year, month, doctorId }
  });
};