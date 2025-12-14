🏥 Clinic Booking System - Frontend
Dự án Frontend cho hệ thống Đặt lịch khám bệnh trực tuyến. Ứng dụng giúp bệnh nhân dễ dàng tìm kiếm bác sĩ, đặt lịch hẹn và thanh toán trực tuyến (VNPay). Đồng thời cung cấp công cụ quản lý mạnh mẽ cho Bác sĩ và Quản trị viên (Admin).

🚀 Công nghệ sử dụng
Dự án được xây dựng dựa trên các công nghệ hiện đại:

Core: React (với Vite)

Language: TypeScript (Đảm bảo type-safe)

Routing: React Router DOM (Quản lý điều hướng)

HTTP Client: Axios (Giao tiếp với Backend API)

Styling: CSS Modules / Tailwind CSS (Tùy cấu hình của bạn)

Calendar: React-Calendar (Hiển thị lịch làm việc)

Payment: Tích hợp cổng thanh toán VNPay (Sandbox)

🌟 Tính năng chính
1. Phân hệ Bệnh nhân (Patient)
🔍 Tìm kiếm bác sĩ: Theo chuyên khoa, tên, phòng khám.

📅 Đặt lịch khám: Chọn ngày giờ (theo slot) trực quan.

💳 Thanh toán Online: Tích hợp cổng thanh toán VNPay.

📝 Lịch sử khám: Xem lại các lịch hẹn đã đặt, trạng thái (Đã xác nhận, Đã hủy...).

2. Phân hệ Bác sĩ (Doctor)
timetable Quản lý lịch làm việc: Đăng ký khung giờ khám bệnh.

📋 Danh sách hẹn: Xem danh sách bệnh nhân đăng ký trong ngày.

✅ Xử lý lịch: Xác nhận hoặc Hủy lịch hẹn khi có việc đột xuất.

3. Phân hệ Quản trị (Admin)
📊 Dashboard: Thống kê doanh thu, số lượng lịch hẹn.

👨‍⚕️ Quản lý Bác sĩ: Thêm, sửa, xóa thông tin bác sĩ, chuyên khoa.

👥 Quản lý Người dùng: Kiểm soát tài khoản hệ thống.

📅 Quản lý Lịch hẹn: Xóa các lịch rác, hỗ trợ hoàn tiền (logic nghiệp vụ).

🛠️ Cài đặt và Chạy dự án
Yêu cầu tiên quyết
Node.js (Phiên bản 16.x trở lên)

npm hoặc yarn

Bước 1: Clone dự án
Bash

git clone https://github.com/username/clinic-booking-frontend.git
cd clinic-booking-frontend
Bước 2: Cài đặt thư viện
Bash

npm install
# Hoặc
yarn install
Bước 3: Cấu hình môi trường (.env)
Tạo file .env tại thư mục gốc và cấu hình đường dẫn API Backend:

Đoạn mã

# URL của Backend Spring Boot
VITE_API_URL=http://localhost:8080/api

# Cấu hình Port chạy Frontend (Nếu cần cố định)
VITE_PORT=5173
Bước 4: Chạy dự án (Development)
Bash

npm run dev
Truy cập: http://localhost:5173

📂 Cấu trúc thư mục
src/
├── assets/           # Hình ảnh, icons, fonts
├── components/       # Các component dùng chung (Button, Input, Modal...)
├── context/          # Context API (AuthContext, ToastContext...)
├── layouts/          # Bố cục trang (MainLayout, AdminLayout...)
├── pages/            # Các trang chính
│   ├── admin/        # Trang quản trị (Dashboard, Doctor Management...)
│   ├── auth/         # Trang Login, Register
│   ├── doctor/       # Trang dành cho Bác sĩ
│   └── patient/      # Trang dành cho Bệnh nhân (Home, Booking...)
├── routes/           # Định nghĩa Router và PrivateRoute
├── services/         # Các hàm gọi API (axios instance, authService, doctorService...)
├── types/            # TypeScript Interfaces/Types (User, Appointment, Schedule...)
├── utils/            # Các hàm tiện ích (formatDate, formatCurrency...)
└── App.tsx           # Entry point
