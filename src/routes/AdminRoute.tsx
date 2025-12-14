import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

type AdminRouteProps = {
  allowedRoles: string[];
};

export const AdminRoute = ({ allowedRoles }: AdminRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 1. Chờ load xong auth state
  if (loading) {
    return <div>Đang xác thực...</div>;
  }

  // 1. TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP NHƯNG KHÔNG CÓ QUYỀN
  const hasPermission = user?.roles?.some(role => allowedRoles.includes(role));
  
  if (!hasPermission) {
    // chuyển hướng về Dashboard:
    return <Navigate to="/admin" replace />;
  }

  // 3. HỢP LỆ
  return <Outlet />;
};