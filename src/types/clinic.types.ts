export interface ClinicResponse {
  id: number;
  name: string;
  address: string;
  phoneNumber?: string;
  description?: string;
  imageUrls?: string[];
}

export interface ClinicRequest {
  name: string;
  address: string;
  phoneNumber?: string;
  description?: string;
  imageUrls?: string[];
}