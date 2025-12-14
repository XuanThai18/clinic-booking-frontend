# 🏥 Clinic Booking System - Frontend

> Hệ thống đặt lịch khám bệnh trực tuyến, kết nối Bệnh nhân và Bác sĩ nhanh chóng, tích hợp thanh toán VNPay an toàn.

![Status](https://img.shields.io/badge/Status-Development-yellow?style=flat-square)
![Tech](https://img.shields.io/badge/Tech-React_TypeScript-blue?style=flat-square)
![Build](https://img.shields.io/badge/Build-Vite-purple?style=flat-square)

---

## 🌟 Giới thiệu

Dự án Frontend cho hệ thống Clinic Booking. Ứng dụng cung cấp giao diện trực quan giúp bệnh nhân tìm kiếm bác sĩ, đặt lịch hẹn theo khung giờ (slot) và thanh toán trực tuyến. Đồng thời cung cấp công cụ quản lý toàn diện cho Bác sĩ và Admin.

## 🚀 Công nghệ sử dụng

* **Core:** [React](https://reactjs.org/) (v18+)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Routing:** React Router DOM v6
* **HTTP Client:** Axios
* **Payment:** Tích hợp cổng thanh toán VNPay (Sandbox)
* **UI/Styling:** CSS Modules / Tailwind CSS
* **Calendar:** React-Calendar

---

## 🎯 Tính năng chính

### 1. Phân hệ Bệnh nhân (Patient)
- **Tìm kiếm:** Tìm bác sĩ theo Tên, Chuyên khoa, Phòng khám.
- **Đặt lịch:** Xem lịch trống của bác sĩ và chọn giờ khám phù hợp.
- **Thanh toán:** Thanh toán online qua VNPay (Hỗ trợ QR, Thẻ nội địa, Quốc tế).
- **Quản lý lịch:** Xem lại lịch sử khám, trạng thái lịch hẹn (Đã xác nhận, Đã hủy...).

### 2. Phân hệ Bác sĩ (Doctor)
- **Quản lý lịch làm việc:** Đăng ký các ca làm việc (Sáng/Chiều) trong tuần.
- **Danh sách hẹn:** Xem danh sách bệnh nhân đã đặt lịch trong ngày.

### 3. Phân hệ Quản trị (Admin)
- **Dashboard:** Thống kê doanh thu, số lượng người dùng.
- **Quản lý Bác sĩ:** Thêm mới, cập nhật thông tin, chuyên khoa, giá khám.
- **Quản lý Người dùng:** Kiểm soát tài khoản hệ thống.
- **Quản lý Lịch hẹn:** Xóa lịch rác, hỗ trợ xử lý hoàn tiền hoặc hủy lịch.

---

## 🛠️ Hướng dẫn Cài đặt & Chạy

### Yêu cầu
* [Node.js](https://nodejs.org/) (Phiên bản 16.x trở lên)
* [npm](https://www.npmjs.com/) hoặc yarn

### Bước 1: Clone dự án
```bash
git clone [https://github.com/username/clinic-booking-frontend.git](https://github.com/username/clinic-booking-frontend.git)
cd clinic-booking-frontend
```
### Bước 2: Cài đặt thư viện
```bash
npm install
# Hoặc
yarn install
```
### Bước 3: Cấu hình môi trường (.env)
Tạo file .env tại thư mục gốc dự án (ngang hàng với package.json) và dán nội dung sau:
# Đường dẫn API Backend Spring Boot
VITE_API_URL=http://localhost:8080/api

# Cổng chạy Frontend (Mặc định Vite là 5173)
VITE_PORT=5173

### Bước 4: Chạy dự án
```bash
npm run dev
```
---
## Cấu trúc thư mục

```plaintext
src/
├── assets/           # Tài nguyên tĩnh (Hình ảnh, fonts, icons)
├── components/       # Các component dùng chung (Button, Modal, Input...)
├── contexts/         # React Context (AuthContext, ToastContext...)
├── layouts/          # Bố cục trang (MainLayout, AdminLayout...)
├── pages/            # Các trang giao diện chính
│   ├── admin/        # Giao diện dành cho Admin
│   ├── doctor/       # Giao diện dành cho Bác sĩ
│   ├── patient/      # Giao diện dành cho Bệnh nhân
│   └── auth/         # Login, Register
├── routes/           # Định nghĩa Router và PrivateRoute
├── services/         # Cấu hình Axios và các hàm gọi API
├── types/            # Định nghĩa kiểu dữ liệu (TypeScript Interfaces)
└── utils/            # Các hàm tiện ích (Format tiền tệ, ngày tháng)
```
