import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login'; // <-- 1. Import trang Login
import { Home } from '../pages/Home'; // <-- 1. Import trang Home
import { FindDoctorPage } from '../pages/FindDoctorPage'; // <-- 1. Import trang FindDoctorPage
import { AdminRoute } from './AdminRoute';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ErrorPage } from '../pages/ErrorPage';
import { AddSpecialty } from '../pages/admin/specialty/AddSpecialty';
import { SpecialtyList } from '../pages/admin/specialty/SpecialtyList';
import { EditSpecialty } from '../pages/admin/specialty/EditSpecialty';
import { ClinicForm } from '../pages/admin/clinic/ClinicForm';
import { ClinicList } from '../pages/admin/clinic/ClinicList';
import { DoctorList } from '../pages/admin/doctor/DoctorList';
import { DoctorForm } from '../pages/admin/doctor/DoctorForm';
import { DoctorDetail } from '../pages/admin/doctor/DoctorDetail';
import { About } from '../pages/About';
import { SpecialtyDetail } from '../pages/admin/specialty/SpecialtyDetail';
import { UserForm } from '../pages/admin/user/UserForm';
import { UserList } from '../pages/admin/user/UserList';
import { AppointmentList } from '../pages/appointment/AppointmentList';
import { DoctorSchedule } from '../pages/admin/doctor/DoctorSchedule';
import { ProcessManagement } from '../pages/admin/process/ProcessManagement';
import { DoctorDashboard } from '../pages/admin/doctor/DoctorDashboard';
import { DoctorAppointmentManager } from '../pages/admin/doctor/DoctorAppointmentManager';
import { PatientAppointments } from '../pages/patient/PatientAppointments';
import { PatientProfile } from '../pages/patient/PatientProfile';
import { PatientBooking } from '../pages/patient/PatientBooking';
import { DoctorProfile } from '../pages/admin/doctor/DoctorProfile';
import { DoctorHistory } from '../pages/admin/doctor/DoctorHistory';
import { ResetPassword } from '../pages/ResetPassword';
import { ForgotPassword } from '../pages/ForgotPassword';
import PaymentFailed from '../pages/payment/PaymentFailed';
import PaymentSuccess from '../pages/payment/PaymentSuccess';


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "find-doctor", element: <FindDoctorPage /> },
      { path: "doctors/:id", element: <DoctorDetail />  },
      { path: "about", element: <About /> },
      { path: "specialty/:id", element: <SpecialtyDetail /> },
      { path: "booking/:doctorId", element: <PatientBooking /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "payment-success", element: <PaymentSuccess /> },
      { path: "payment-failed", element: <PaymentFailed /> },
      {
        path: "admin",
        // Cổng 1: Cho phép cả ADMIN và SUPER_ADMIN vào trang Admin chung
        element: <AdminRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']} />,
        children: [
          { path: "", element: <AdminDashboard /> },
          { path: "add-specialty", element: <AddSpecialty /> },
          { path: "specialties", element: <SpecialtyList /> },
          { path: "edit-specialty/:id", element: <EditSpecialty /> },
          { path: "add-clinic", element: <ClinicForm /> },
          { path: "edit-clinic/:id", element: <ClinicForm /> },
          { path: "clinics", element: <ClinicList /> },
          { path: "doctors", element: <DoctorList /> },
          { path: "add-doctor", element: <DoctorForm /> },
          { path: "edit-doctor/:id", element: <DoctorForm /> },
          { path: "appointments", element: <AppointmentList /> },
          { path: "users", element: <UserList /> },
          { path: "add-user", element: <UserForm /> },
          { path: "edit-user/:id", element: <UserForm /> },
          { path: "workflow", element: <ProcessManagement /> },
          { path: "schedules", element: <DoctorSchedule /> },
          // --- KHU VỰC CẤM (CHỈ SUPER ADMIN) ---
          {
            // Cổng 2: Bọc riêng các route User lại, chỉ cho SUPER_ADMIN vào
            element: <AdminRoute allowedRoles={['ROLE_SUPER_ADMIN']} />,
            children: [
                
            ]
          },
        ]
      },
      // --- CỔNG 3: KHU VỰC BÁC SĨ (Phòng làm việc riêng) ---
      {
            path: "doctor", // Đường dẫn bắt đầu bằng /doctor
            element: <AdminRoute allowedRoles={['ROLE_DOCTOR']} />, // Chỉ Bác sĩ mới vào được
            children: [
              // 1. Trang chủ của Bác sĩ (Dashboard với các Card)
          { 
            path: "", // Đường dẫn /doctor
            element: <DoctorDashboard /> 
          },

          // 2. Các trang chức năng con
          { 
            path: "schedule", // Đường dẫn /doctor/schedule
            element: <DoctorSchedule /> 
          },
          { 
            path: "appointments", // Đường dẫn /doctor/appointments
            element: <DoctorAppointmentManager /> 
          },
          { path: "profile", element: <DoctorProfile /> },
          { path: "history", element: <DoctorHistory /> },
            ]
      },
      // --- CỔNG 4: KHU VỰC BỆNH NHÂN ---
      {
        path: "patient",
        element: <AdminRoute allowedRoles={['ROLE_PATIENT']} />, // Nhớ đảm bảo AdminRoute cho phép ROLE_PATIENT
        children: [
          { path: "appointments", element: <PatientAppointments /> },
          { path: "profile", element: <PatientProfile /> },
          // Mặc định vào patient sẽ vào trang lịch sử
          { path: "", element: <PatientAppointments /> },

        ]
      }
    ],
  },
]);