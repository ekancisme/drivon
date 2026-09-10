import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiLogIn,
} from "react-icons/fi";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = ({ onLoginSuccess, embedded = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = "Vui lòng nhập email";
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = "Email không hợp lệ";
    }
    if (!password) {
      next.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      next.password = "Mật khẩu tối thiểu 6 ký tự";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      if (response.data) {
        const userDataWithToken = { ...response.data.user, token: response.data.token };
        showSuccessToast('Login successful!');
        onLoginSuccess(userDataWithToken);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Login failed. Please try again.";
      setErrors({ form: message });
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await axios.post(
        `${API_URL}/auth/google`,
        {
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        }
      );

      if (response.data) {
        const userDataWithToken = { ...response.data.user, token: response.data.token };
        showSuccessToast('Google login successful!');
        onLoginSuccess(userDataWithToken);
      }
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Google login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    showErrorToast("Google login failed. Please try again.");
  };

  const body = (
    <>
      {!embedded && (
        <div className="dv-auth-head">
          <div className="dv-auth-logo">DRI<span>VON</span></div>
          <h1 className="dv-auth-title">Welcome back</h1>
          <p className="dv-auth-sub">Đăng nhập để tiếp tục thuê xe trên Drivon.</p>
        </div>
      )}

      {errors.form && (
        <div className="dv-alert dv-alert--error" role="alert">
          <FiAlertCircle />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="dv-form" noValidate>
        <div className="dv-field">
          <div className="dv-input-wrap">
            <span className="dv-input-icon"><FiMail /></span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.form) setErrors((p) => ({ ...p, email: '', form: '' }));
              }}
              className={`dv-input ${errors.email ? 'dv-input--error' : ''}`}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <span className="dv-field-error">
              <FiAlertCircle size={12} /> {errors.email}
            </span>
          )}
        </div>

        <div className="dv-field">
          <div className="dv-input-wrap">
            <span className="dv-input-icon"><FiLock /></span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password || errors.form) setErrors((p) => ({ ...p, password: '', form: '' }));
              }}
              className={`dv-input ${errors.password ? 'dv-input--error' : ''}`}
              autoComplete="current-password"
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
          {errors.password && (
            <span className="dv-field-error">
              <FiAlertCircle size={12} /> {errors.password}
            </span>
          )}
        </div>

        <button type="submit" className="dv-btn dv-btn-primary" disabled={isLoading}>
          {isLoading ? <span className="dv-spinner" /> : <FiLogIn />}
          {isLoading ? "Signing in..." : "Login"}
        </button>

        <div className="dv-divider">hoặc</div>

        <div className="dv-google-wrap">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            popup_type="popup"
            popup_properties={{
              width: 500,
              height: 600,
              left: window.screenX + (window.outerWidth - 500) / 2,
              top: window.screenY + (window.outerHeight - 600) / 2,
            }}
            theme="filled_black"
            shape="pill"
            size="large"
            text="continue_with"
          />
        </div>
      </form>
    </>
  );

  if (embedded) {
    return <div className="dv-auth-body">{body}</div>;
  }

  return (
    <div className="dv-auth-shell">
      <div className="dv-auth-card">
        {body}
      </div>
    </div>
  );
};

export default Login;