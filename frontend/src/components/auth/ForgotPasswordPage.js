import React, { useState } from "react";
import axios from "axios";
import {
  FiMail,
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = ({ embedded = false }) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password
  const [codeSent, setCodeSent] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least 1 uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least 1 number";
    }
    return null;
  };

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "Vui lòng nhập email" });
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setErrors({ email: "Email không hợp lệ" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/send-reset-code`, {
        email,
      });
      showSuccessToast("Verification code has been sent to your email");
      setCodeSent(true);
      setStep(2);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Unable to send verification code";
      setErrors({ form: message });
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (verificationCode.length < 6) {
      setErrors({ code: "Mã xác thực gồm 6 chữ số" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/verify-reset-code`, {
        email,
        code: verificationCode,
      });
      showSuccessToast("Valid verification code");
      setStep(3);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Invalid verification code";
      setErrors({ code: message });
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors({ newPassword: passwordError });
      showErrorToast(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      showErrorToast("Passwords do not match");
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        code: verificationCode,
        newPassword,
      });
      showSuccessToast("Password reset successfully");
      setTimeout(() => (window.location.href = "/auth"), 2000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Unable to reset password";
      setErrors({ form: message });
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { n: 1, label: 'Email' },
    { n: 2, label: 'Mã' },
    { n: 3, label: 'Mật khẩu' },
  ];

  const content = (
    <>
      {!embedded && (
        <div className="dv-auth-head">
          <div className="dv-auth-logo">DRI<span>VON</span></div>
          <h1 className="dv-auth-title">Forgot password</h1>
          <p className="dv-auth-sub">
            {step === 1 && "Nhập email để nhận mã xác thực."}
            {step === 2 && `Mã đã được gửi tới ${email}.`}
            {step === 3 && "Tạo mật khẩu mới cho tài khoản của bạn."}
          </p>
        </div>
      )}

      <div className="dv-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div
              className={`dv-step ${
                step === s.n ? 'dv-step--active' : step > s.n ? 'dv-step--done' : ''
              }`}
            >
              {step > s.n ? <FiCheck size={13} /> : s.n}
            </div>
            {i < steps.length - 1 && (
              <span className={`dv-step-line ${step > s.n ? 'dv-step-line--done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {errors.form && (
        <div className="dv-alert dv-alert--error" role="alert">
          <FiAlertCircle />
          <span>{errors.form}</span>
        </div>
      )}

      {codeSent && step === 2 && (
        <div className="dv-alert dv-alert--info">
          <FiShield />
          <span>Mã xác thực có hiệu lực trong vài phút. Kiểm tra cả hộp thư spam.</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendCode} className="dv-form" noValidate>
          <div className="dv-field">
            <div className="dv-input-wrap">
              <span className="dv-input-icon"><FiMail /></span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.form) setErrors({});
                }}
                className={`dv-input ${errors.email ? 'dv-input--error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.email}</span>
            )}
          </div>

          <button type="submit" className="dv-btn dv-btn-primary" disabled={isLoading}>
            {isLoading ? <span className="dv-spinner" /> : <FiMail />}
            {isLoading ? 'Đang gửi...' : 'Send verification code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="dv-form" noValidate>
          <div className="dv-field">
            <div className="dv-input-wrap">
              <span className="dv-input-icon"><FiShield /></span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Nhập mã xác thực"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/[^0-9]/g, ''));
                  if (errors.code || errors.form) setErrors({});
                }}
                className={`dv-input dv-otp ${errors.code ? 'dv-input--error' : ''}`}
                maxLength="6"
                autoComplete="one-time-code"
              />
            </div>
            {errors.code && (
              <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.code}</span>
            )}
          </div>

          <button
            type="submit"
            className="dv-btn dv-btn-primary"
            disabled={isLoading || verificationCode.length < 6}
          >
            {isLoading ? <span className="dv-spinner" /> : <FiCheck />}
            {isLoading ? 'Đang kiểm tra...' : 'Verify'}
          </button>

          <button
            type="button"
            className="dv-btn dv-btn-ghost"
            onClick={handleSendCode}
            disabled={isLoading}
          >
            Resend code
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => { setStep(1); setErrors({}); }}
          >
            <FiArrowLeft size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
            Đổi email khác
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="dv-form" noValidate>
          <div className="dv-field">
            <div className="dv-input-wrap">
              <span className="dv-input-icon"><FiLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                placeholder="Confirm new password"
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
              <FiCheck size={12} /> Be at least 6 characters
            </li>
            <li className={`dv-rule ${/[A-Z]/.test(newPassword) ? 'dv-rule--ok' : ''}`}>
              <FiCheck size={12} /> Contain at least 1 uppercase letter
            </li>
            <li className={`dv-rule ${/[0-9]/.test(newPassword) ? 'dv-rule--ok' : ''}`}>
              <FiCheck size={12} /> Contain at least 1 number
            </li>
          </ul>

          <button type="submit" className="dv-btn dv-btn-primary" disabled={isLoading}>
            {isLoading ? <span className="dv-spinner" /> : <FiCheck />}
            {isLoading ? 'Đang cập nhật...' : 'Reset password'}
          </button>
        </form>
      )}
    </>
  );

  if (embedded) return <div className="dv-auth-body">{content}</div>;
  return (
    <div className="dv-auth-shell">
      <div className="dv-auth-card">{content}</div>
    </div>
  );
};

export default ForgotPasswordPage;