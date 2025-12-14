import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// Import styles từ file module
import styles from './PaymentFailed.module.css'; 

const PaymentFailed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const responseCode = searchParams.get('vnp_ResponseCode');
    const orderInfo = searchParams.get('vnp_OrderInfo');

    const handleRetry = () => {
        navigate('/patient/appointments');
    };

    const handleHome = () => {
        navigate('/');
    };

    const getErrorMessage = () => {
        if (responseCode === '24') return "Bạn đã hủy giao dịch thanh toán.";
        if (responseCode === '51') return "Tài khoản của bạn không đủ số dư.";
        return "Giao dịch không thành công do lỗi hệ thống hoặc ngân hàng từ chối.";
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconContainer}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="11" stroke="#dc3545" strokeWidth="2" fill="#fff5f5"/>
                        <path d="M8 8L16 16M16 8L8 16" stroke="#dc3545" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>

                <h1 className={styles.title}>Thanh Toán Thất Bại!</h1>
                
                <p className={styles.message}>
                    {getErrorMessage()}
                </p>

                <div className={styles.details}>
                    <p><strong>Mã lỗi:</strong> {responseCode || 'Unknown'}</p>
                    <p><strong>Nội dung:</strong> {orderInfo || 'Không xác định'}</p>
                </div>

                <div className={styles.warningBox}>
                    <p className={styles.warningText}>
                        Lịch hẹn của bạn vẫn được giữ ở trạng thái 
                        <span className={styles.highlightText}> "Chờ thanh toán"</span>. 
                        Vui lòng thanh toán lại trong vòng 15 phút để tránh bị hủy đơn.
                    </p>
                </div>

                <div className={styles.buttonGroup}>
                    {/* Cách gộp 2 class trong CSS Modules: dùng Template String */}
                    <button 
                        onClick={handleRetry} 
                        className={`${styles.btn} ${styles.btnRetry}`}
                    >
                        Thử thanh toán lại
                    </button>
                    
                    <button 
                        onClick={handleHome} 
                        className={`${styles.btn} ${styles.btnHome}`}
                    >
                        Về trang chủ
                    </button>
                </div>

                <p className={styles.contactInfo}>
                    Cần hỗ trợ? Gọi ngay: <a href="tel:19001234">1900 1234</a>
                </p>
            </div>
        </div>
    );
};

export default PaymentFailed;