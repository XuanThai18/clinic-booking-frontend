import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../services/authService';
import styles from './ResetPassword.module.css';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Lấy token từ URL ?token=...
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }
        if (!token) {
            alert("Token không hợp lệ!");
            return;
        }

        try {
            await resetPasswordApi(token, password);
            alert("Đổi mật khẩu thành công! Hãy đăng nhập ngay.");
            navigate('/login');
        } catch (error) {
            alert("Link đã hết hạn hoặc không hợp lệ.");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Đặt Lại Mật Khẩu</h2>

            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className={styles.input}
                />

                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className={styles.input}
                />

                <button type="submit" className={styles.button}>
                    Đổi Mật Khẩu
                </button>
            </form>
        </div>
    );
};