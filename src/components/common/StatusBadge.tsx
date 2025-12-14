import React from 'react';

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'PENDING_PAYMENT':
        case 'UNPAID': // Đề phòng bạn dùng cả 2
            return <span className="badge bg-warning text-dark">Chờ thanh toán</span>;
            
        case 'CONFIRMED':
            return <span className="badge bg-success">Đã thanh toán</span>;
            
        case 'REFUND_PENDING':
            return <span className="badge bg-info text-dark">Chờ hoàn tiền</span>;
            
        case 'CANCELLED':
            return <span className="badge bg-danger">Đã hủy</span>;
            
        case 'COMPLETED':
            return <span className="badge bg-primary">Đã khám xong</span>;
            
        default:
            return <span className="badge bg-secondary">{status}</span>;
    }
};

export default StatusBadge;