import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiLock,
  FiKey,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiShield,
} from "react-icons/fi";
import { API_URL } from "../../api/configApi";
import { showErrorToast, showSuccessToast } from "../notification/notification";

const MIN_LENGTH = 6;

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.email) {
          navigate("/auth");
          return;
        }
        const response = await axios.get(
          `${API_URL}/profile/check-password-status/${user.email}`
        );
        setHasPassword(response.data.hasPassword);
      } catch (err) {
        console.error("Error checking password status:", err);
        showErrorToast("Unable to check password status");
      }
    };

    checkPasswordStatus();
  }, [navigate]);

  const toggleVisible = (field) =>
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));

  const clearError = (field) =>
    setErrors((prev) => {
      if (!prev[field] && !prev.form) return prev;
      return { ...prev, [field]: "", form: "" };
    });

  const rules = [
    {
      key: "length",
      label: `Tối thiểu ${MIN_LENGTH} ký tự`,
      ok: newPassword.length >= MIN_LENGTH,
    },
    {
      key: "match",
      label: "Mật khẩu xác nhận trùng khớp",
      ok: confirmPassword.length > 0 && newPassword === confirmPassword,
    },
  ];

  const validate = () => {
    const next = {};

    if (hasPassword && !currentPassword) {
      next.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!newPassword) {
      next.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < MIN_LENGTH) {
      next.newPassword = `Mật khẩu tối thiểu ${MIN_LENGTH} ký tự`;
    }
    if (!confirmPassword) {
      next.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        throw new Error("User not found");
      }

      const endpoint = hasPassword
        ? "/profile/change-password"
        : "/profile/create-password";
      const payload = hasPassword
        ? { email: user.email, currentPassword, newPassword }
        : { email: user.email, newPassword };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (response.data.success) {
        showSuccessToast(
          hasPassword
            ? "Password changed successfully!"
            : "Password created successfully!"
        );
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");

        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      }
    } catch (err) {
      console.error("Error changing password:", err);
      const message =
        err.response?.data?.error ||
        "An error occurred while changing the password";
      setErrors({ form: message });
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dv-auth-shell" style={{ minHeight: "calc(100vh - 72px)" }}>
      <div className="dv-auth-card">
        <div className="dv-auth-head">
          <div className="dv-auth-logo">
            DRI<span>VON</span>
          </div>
          <h1 className="dv-auth-title">
            {hasPassword ? "Đổi mật khẩu" : "Tạo mật khẩu mới"}
          </h1>
          <p className="dv-auth-sub">
            {hasPassword
              ? "Cập nhật mật khẩu đăng nhập để bảo vệ tài khoản của bạn."
              : "Thiết lập mật khẩu đăng nhập để bảo vệ tài khoản của bạn."}
          </p>
        </div>

        {errors.form && (
          <div className="dv-alert dv-alert--error" role="alert">
            <FiAlertCircle />
            <span>{errors.form}</span>
          </div>
        )}

        <form className="dv-form" onSubmit={handleSubmit} noValidate>
          {hasPassword && (
            <div className="dv-field">
              <div className="dv-input-wrap">
                <span className="dv-input-icon">
                  <FiLock />
                </span>
                <input
                  type={visible.current ? "text" : "password"}
                  className={`dv-input ${errors.currentPassword ? "dv-input--error" : ""}`}
                  placeholder="Mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    clearError("currentPassword");
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="dv-input-toggle"
                  onClick={() => toggleVisible("current")}
                  aria-label={visible.current ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
                  tabIndex={-1}
                >
                  {visible.current ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <span className="dv-field-error">
                  <FiAlertCircle size={12} /> {errors.currentPassword}
                </span>
              )}
            </div>
          )}

          <div className="dv-field">
            <div className="dv-input-wrap">
              <span className="dv-input-icon">
                <FiKey />
              </span>
              <input
                type={visible.next ? "text" : "password"}
                className={`dv-input ${errors.newPassword ? "dv-input--error" : ""}`}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearError("newPassword");
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="dv-input-toggle"
                onClick={() => toggleVisible("next")}
                aria-label={visible.next ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                tabIndex={-1}
              >
                {visible.next ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="dv-field-error">
                <FiAlertCircle size={12} /> {errors.newPassword}
              </span>
            )}
            <ul className="dv-rules">
              {rules.map((rule) => (
                <li
                  key={rule.key}
                  className={`dv-rule ${rule.ok ? "dv-rule--ok" : ""}`}
                >
                  {rule.ok ? <FiCheck size={13} /> : <FiX size={13} />}
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="dv-field">
            <div className="dv-input-wrap">
              <span className="dv-input-icon">
                <FiLock />
              </span>
              <input
                type={visible.confirm ? "text" : "password"}
                className={`dv-input ${errors.confirmPassword ? "dv-input--error" : ""}`}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="dv-input-toggle"
                onClick={() => toggleVisible("confirm")}
                aria-label={visible.confirm ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                tabIndex={-1}
              >
                {visible.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="dv-field-error">
                <FiAlertCircle size={12} /> {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="dv-btn dv-btn-primary" disabled={loading}>
            {loading ? <span className="dv-spinner" /> : <FiShield />}
            {loading
              ? "Đang xử lý..."
              : hasPassword
                ? "Đổi mật khẩu"
                : "Tạo mật khẩu"}
          </button>

          <button
            type="button"
            className="dv-btn dv-btn-ghost"
            onClick={() => navigate("/profile")}
            disabled={loading}
          >
            <FiX />
            Huỷ
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;