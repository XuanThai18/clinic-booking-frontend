import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import styles from './ErrorPage.module.css';

export const ErrorPage = () => {
  const error = useRouteError(); // Lấy thông tin về lỗi vừa xảy ra
  let errorMessage = "Đã xảy ra lỗi không mong muốn.";
  let errorTitle = "Oops!";
  let errorCode = "Error";

  // Kiểm tra xem có phải là lỗi do Router ném ra không (ví dụ 404)
  if (isRouteErrorResponse(error)) {
    errorCode = error.status.toString();
    if (error.status === 404) {
      errorTitle = "Trang không tìm thấy";
      errorMessage = "Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.";
    } else if (error.status === 401) {
      errorTitle = "Chưa xác thực";
      errorMessage = "Bạn cần đăng nhập để xem trang này.";
    } else if (error.status === 503) {
      errorTitle = "Dịch vụ không khả dụng";
      errorMessage = "Hệ thống đang bận, vui lòng thử lại sau.";
    } else {
        errorTitle = error.statusText;
        errorMessage = error.data?.message || "Lỗi không xác định.";
    }
  } else if (error instanceof Error) {
    // Lỗi do code (Crash)
    errorMessage = error.message;
  }

  return (
    <div className={styles.errorContainer}>
      <h1 className={styles.errorCode}>{errorCode}</h1>
      <h2 className={styles.errorTitle}>{errorTitle}</h2>
      <p className={styles.errorMessage}>{errorMessage}</p>
      
      <Link to="/" className={styles.homeButton}>
        Quay Về Trang Chủ
      </Link>
    </div>
  );
};