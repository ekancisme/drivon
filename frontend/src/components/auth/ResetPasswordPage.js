import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheck,
  FiXCircle,
} from "react-icons/fi";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setErrors({ newPassword: "Vui lòng nhập mật khẩu mới" });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ newPassword: "Mật khẩu tối thiểu 6 ký tự" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu nhập lại không khớp" });
      showErrorToast("Mật khẩu nhập lại không khớp");
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/reset-password`,
        {
          token,
          newPassword,
        }
      );
      showSuccessToast("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      setErrors({ form: message });
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="dv-auth-shell">
        <div className="dv-auth-card">
          <div className="dv-auth-head">
            <div className="dv-auth-logo">DRI<span>VON</span></div>
            <h1 className="dv-auth-title">Liên kết không hợp lệ</h1>
            <p className="dv-auth-sub">Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          </div>

          <div className="dv-alert dv-alert--error" role="alert">
            <FiXCircle />
            <span>Vui lòng yêu cầu lại email đặt lại mật khẩu.</span>
          </div>

          <Link to="/auth" className="dv-btn dv-btn-primary" style={{ textDecoration: 'none' }}>
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dv-auth-shell">
      <div className="dv-auth-card">
        <div className="dv-auth-head">
          <div className="dv-auth-logo">DRI<span>VON</span></div>
          <h1 className="dv-auth-title">Đặt lại mật khẩu</h1>
          <p className="dv-auth-sub">Đặt mật khẩu mới cho tài khoản Drivon của bạn.</p>
        </div>

        {errors.form && (
          <div className="dv-alert dv-alert--error" role="alert">
            <FiAlertCircle />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dv-form" noValidate>
          <div className="dv-field">
            <div className="dv-input-wrap">
              <span className="dv-input-icon"><FiLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword || errors.form) setErrors((p) => ({ ...p, newPassword: '', form: '' }));
                }}
                className={`dv-input ${errors.newPassword ? 'dv-input--error' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="dv-input-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.newPassword}</span>
            )}
          </div>

          <div className="dv-field">
            <div className="dv-input-wrap">
              <span className="dv-input-icon"><FiLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword || errors.form) setErrors((p) => ({ ...p, confirmPassword: '', form: '' }));
                }}
                className={`dv-input ${errors.confirmPassword ? 'dv-input--error' : ''}`}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && (
              <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.confirmPassword}</span>
            )}
          </div>

          <ul className="dv-rules">
            <li className={`dv-rule ${newPassword.length >= 6 ? 'dv-rule--ok' : ''}`}>
              <FiCheck size={12} /> Ít nhất 6 ký tự
            </li>
            <li className={`dv-rule ${confirmPassword && confirmPassword === newPassword ? 'dv-rule--ok' : ''}`}>
              <FiCheck size={12} /> Mật khẩu nhập lại khớp
            </li>
          </ul>

          <button type="submit" className="dv-btn dv-btn-primary" disabled={isLoading}>
            {isLoading ? <span className="dv-spinner" /> : <FiCheck />}
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>

        <div className="dv-auth-foot">
          <Link to="/auth" className="dv-link">Về trang đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;