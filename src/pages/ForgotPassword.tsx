import { useState } from 'react';
import { forgotPasswordApi } from '../services/authService';
import styles from '../pages/ForgotPassword.module.css';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await forgotPasswordApi(email);
            setMessage("Đã gửi email! Vui lòng kiểm tra hộp thư.");
        } catch (error) {
            alert("Email không tồn tại hoặc lỗi hệ thống.");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <h2>Quên Mật Khẩu</h2>
                <p className={styles.subtitle}>
                    Nhập email của bạn để nhận link đặt lại mật khẩu.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />

                    <button type="submit" className={styles.submitBtn}>
                        Gửi Link Đặt Lại
                    </button>
                </form>

                {message && (
                    <p className={styles.successMsg}>{message}</p>
                )}
            </div>
        </div>
    );
};