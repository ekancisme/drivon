import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiHome, FiList, FiCalendar, FiDollarSign, FiTag, FiFileText } from 'react-icons/fi';
import { API_URL } from '../../api/configApi';

const RentalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [rentalData, setRentalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let data = null;
    if (location.state && location.state.rentalData) {
      data = location.state.rentalData;
      setRentalData(data);
      setLoading(false);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const orderCode = searchParams.get('orderCode');
      if (orderCode) {
        axios.get(`${API_URL}/payments/order/${orderCode}`)
          .then(res => {
            setRentalData(res.data);
          })
          .catch(() => {
            setRentalData(null);
          })
          .finally(() => setLoading(false));
      } else {
        setRentalData(null);
        setLoading(false);
      }
    }
  }, [location]);

  const handleConfirmOrder = async (redirectTo = null) => {
    if (!rentalData) return;
    setConfirming(true);
    try {
      const payload = {
        orderCode: rentalData.orderCode,
        amount: rentalData.amount,
        userId: rentalData.userId,
        carId: rentalData.carLicensePlate || rentalData.carId,
        paymentMethod: rentalData.paymentMethod || 'bank',
        additionalRequirements: rentalData.additionalRequirements,
        rentalStartDate: rentalData.rentalStartDate,
        rentalEndDate: rentalData.rentalEndDate,
        promotionCode: rentalData.promotionCode,
        discountPercent: rentalData.discountPercent,
        bookingId: rentalData.bookingId,
      };
      const res = await axios.post(`${API_URL}/payments/confirm`, payload);
      if (res.data && res.data.success) {
        setTimeout(() => {
          if (redirectTo) {
            navigate(redirectTo);
          } else {
            navigate('/my-rentals');
          }
        }, 500);
      }
    } catch (err) {
      console.error('Order confirmation error:', err);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="dv-auth-shell">
        <div className="dv-auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="dv-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1.5rem' }} />
          <h3 style={{ color: 'var(--text)' }}>Đang tải thông tin đơn đặt xe...</h3>
        </div>
      </div>
    );
  }

  if (!rentalData || !rentalData.orderCode) {
    return (
      <div className="dv-auth-shell">
        <div className="dv-auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="dv-alert dv-alert--error" style={{ marginBottom: '1.5rem' }}>
            <span>Không tìm thấy thông tin đơn hàng hoặc phiên đã kết thúc.</span>
          </div>
          <Link to="/" className="dv-btn dv-btn-primary" style={{ textDecoration: 'none' }}>
            <FiHome /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dv-auth-shell" style={{ padding: '3rem 1rem' }}>
      <div className="dv-auth-card" style={{ maxWidth: '680px', width: '100%' }}>
        <div className="dv-auth-head" style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid rgba(34, 197, 94, 0.4)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1rem',
          }}>
            <FiCheckCircle />
          </div>
          <h1 className="dv-auth-title" style={{ fontSize: '1.75rem', color: '#22c55e' }}>
            Đặt xe thành công!
          </h1>
          <p className="dv-auth-sub">
            {rentalData.paymentMethod === 'cash'
              ? "Cảm ơn bạn đã đặt xe. Vui lòng thanh toán tiền mặt khi nhận xe."
              : "Cảm ơn bạn đã đặt xe. Giao dịch thanh toán trực tuyến đã hoàn tất."}
          </p>
        </div>

        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Mã đơn hàng:</span>
            <strong style={{ color: 'var(--cyan)' }}>{rentalData.orderCode || rentalData.paymentId}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Biển số / Mã xe:</span>
            <strong style={{ color: 'var(--text)' }}>{rentalData.carLicensePlate || rentalData.carId}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ngày nhận xe:</span>
            <strong style={{ color: 'var(--text)' }}>
              {rentalData.rentalStartDate ? new Date(rentalData.rentalStartDate).toLocaleDateString('vi-VN') : 'Theo thỏa thuận'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ngày trả xe:</span>
            <strong style={{ color: 'var(--text)' }}>
              {rentalData.rentalEndDate ? new Date(rentalData.rentalEndDate).toLocaleDateString('vi-VN') : 'Theo thỏa thuận'}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
            <strong style={{ color: 'var(--primary-light)', fontSize: '1.25rem' }}>
              {rentalData.amount ? Number(rentalData.amount).toLocaleString('vi-VN') + ' đ' : 'Chưa xác định'}
            </strong>
          </div>

          {rentalData.promotionCode && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Mã giảm giá:</span>
              <span className="dv-badge dv-badge--purple">{rentalData.promotionCode} (-{rentalData.discountPercent}%)</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Hình thức:</span>
            <span style={{ color: 'var(--text)' }}>{rentalData.paymentMethod === 'cash' ? 'Tiền mặt khi nhận xe' : 'Thanh toán trực tuyến'}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button
            type="button"
            className="dv-btn dv-btn-secondary"
            onClick={() => handleConfirmOrder('/')}
            disabled={confirming}
          >
            <FiHome /> Trang chủ
          </button>
          <button
            type="button"
            className="dv-btn dv-btn-primary"
            onClick={() => handleConfirmOrder('/my-rentals')}
            disabled={confirming}
          >
            <FiList /> Chuyến đi của tôi
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalSuccess;