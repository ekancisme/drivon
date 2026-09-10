import React, { useState } from 'react';
import axios from 'axios';
import { FiCreditCard, FiDollarSign, FiFileText, FiArrowRight } from 'react-icons/fi';
import "../css/PaymentForm.css";
import { API_URL } from '../../api/configApi';
import { showErrorToast } from '../notification/notification';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderCode = Date.now();
      const origin = window.location.origin;

      const requestData = {
        orderCode: orderCode,
        amount: parseInt(formData.amount),
        description: formData.description,
        returnUrl: `${origin}/payment-success`,
        cancelUrl: `${origin}/payment-cancel`,
      };

      const response = await axios.post(
        `${API_URL}/payments/create`,
        requestData
      );

      if (response.data.error) {
        showErrorToast("Lỗi: " + response.data.error);
        return;
      }

      if (response.data.data && response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else {
        showErrorToast(
          "Không nhận được đường dẫn thanh toán từ máy chủ. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      showErrorToast(
        "Tạo yêu cầu thanh toán thất bại: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dv-payment-wrapper">
      <div className="dv-payment-card">
        <div className="dv-payment-header">
          <div className="dv-payment-icon">
            <FiCreditCard />
          </div>
          <h2>Cổng Thanh toán Trực tuyến</h2>
          <p>Thanh toán an toàn, bảo mật qua cổng VNPay & Thẻ ngân hàng</p>
        </div>

        <form onSubmit={handleSubmit} className="dv-payment-form">
          <div className="dv-payment-field">
            <label htmlFor="amount">
              <FiDollarSign className="field-icon" /> Số tiền thanh toán (VNĐ)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="Nhập số tiền (VD: 500000)"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1000"
              className="dv-payment-input"
            />
          </div>

          <div className="dv-payment-field">
            <label htmlFor="description">
              <FiFileText className="field-icon" /> Nội dung thanh toán
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Nhập ghi chú hoặc mã đơn thuê xe..."
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="dv-payment-input dv-payment-textarea"
            />
          </div>

          <button type="submit" className="dv-btn dv-btn-primary dv-payment-submit" disabled={loading}>
            {loading ? (
              <span className="dv-spinner" />
            ) : (
              <>
                <span>Tiến hành Thanh toán</span>
                <FiArrowRight />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
