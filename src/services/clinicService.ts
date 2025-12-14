import api from '../lib/axios';
import type { ClinicResponse, ClinicRequest } from '../types/clinic.types';

export const getAllClinicsApi = () => {
  return api.get<ClinicResponse[]>('/public/clinics'); 
};

export const getClinicByIdApi = (id: number) => {
  return api.get<ClinicResponse>(`/public/clinics/${id}`);
};

export const createClinicApi = (data: ClinicRequest) => {
  return api.post<ClinicResponse>('/admin/clinics', data);
};

export const updateClinicApi = (id: number, data: ClinicRequest) => {
  return api.put<ClinicResponse>(`/admin/clinics/${id}`, data);
};

export const deleteClinicApi = (id: number) => {
  return api.delete<void>(`/admin/clinics/${id}`);
};