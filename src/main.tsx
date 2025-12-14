import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router' // <-- Chúng ta sẽ tạo file này
import './index.css' // (Giả sử em có file CSS chung)
import { AuthProvider } from './store/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* <-- 2. Bọc toàn bộ ứng dụng */}
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)