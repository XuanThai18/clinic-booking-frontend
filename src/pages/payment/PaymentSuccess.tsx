import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Lấy ID lịch hẹn từ URL nếu cần hiển thị chi tiết
    const appointmentId = searchParams.get("id"); 

    useEffect(() => {
        // Tự động chuyển về trang lịch sử sau 5 giây
        const timer = setTimeout(() => {
            navigate("/patient/appointments");
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1 style={{ color: "green" }}>Thanh toán thành công! ✅</h1>
            <p>Lịch hẹn #{appointmentId} của bạn đã được xác nhận.</p>
            <p>Vé khám điện tử đã được gửi tới email của bạn.</p>
            <button onClick={() => navigate("/patient/appointments")}>
                Xem lịch hẹn ngay
            </button>
        </div>
    );
};

export default PaymentSuccess;