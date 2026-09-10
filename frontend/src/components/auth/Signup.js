import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import {
    FiUser,
    FiMail,
    FiLock,
    FiPhone,
    FiMapPin,
    FiEye,
    FiEyeOff,
    FiAlertCircle,
    FiShield,
    FiCheck,
    FiUserPlus,
} from 'react-icons/fi';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0|\+84)[0-9]{9,10}$/;

const passwordRules = (pw) => [
    { key: 'len', label: 'Ít nhất 6 ký tự', ok: pw.length >= 6 },
    { key: 'upper', label: 'Có 1 chữ in hoa', ok: /[A-Z]/.test(pw) },
    { key: 'num', label: 'Có 1 chữ số', ok: /[0-9]/.test(pw) },
];

const Signup = ({ onSignupSuccess, embedded = false }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [resendCount, setResendCount] = useState(0);
    const [lastResendTime, setLastResendTime] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name] || errors.form) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
                form: ''
            }));
        }
    };

    const validate = () => {
        const next = {};
        if (!formData.fullName.trim()) next.fullName = 'Vui lòng nhập họ tên';
        else if (formData.fullName.trim().length < 2) next.fullName = 'Họ tên quá ngắn';

        if (!formData.email.trim()) next.email = 'Vui lòng nhập email';
        else if (!EMAIL_RE.test(formData.email.trim())) next.email = 'Email không hợp lệ';

        if (!formData.password) next.password = 'Vui lòng nhập mật khẩu';
        else if (passwordRules(formData.password).some(r => !r.ok)) next.password = 'Mật khẩu chưa đủ mạnh';

        if (!formData.phone.trim()) next.phone = 'Vui lòng nhập số điện thoại';
        else if (!PHONE_RE.test(formData.phone.trim())) next.phone = 'Số điện thoại không hợp lệ';

        if (!formData.address.trim()) next.address = 'Vui lòng nhập địa chỉ';

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/signup`, formData);
            if (response.data) {
                showSuccessToast('Registration successful. Please check your email to verify your account.');
                setShowVerification(true);
            }
        } catch (err) {
            if (err.response?.data) {
                // Handle validation errors (object with field names as keys)
                if (typeof err.response.data === 'object' && !err.response.data.general) {
                    // Show toast for each field error
                    Object.values(err.response.data).forEach(errorMsg => {
                        if (errorMsg) {
                            showErrorToast(errorMsg);
                        }
                    });
                    setErrors(err.response.data);
                } else if (typeof err.response.data === 'object' && err.response.data.general) {
                    // Handle general error from backend (object with 'general' key)
                     showErrorToast(err.response.data.general);
                     setErrors({}); // Clear field errors if a general error is present
                }
                else if (typeof err.response.data === 'string'){
                     // Handle general error message (string)
                     showErrorToast(err.response.data);
                     setErrors({}); // Clear field errors if a general error is present
                }
                else {
                    // Fallback for unexpected error response format
                    showErrorToast('Registration failed. Unknown error format.');
                    setErrors({});
                }
            } else {
                // Handle network errors or no response
                showErrorToast('Registration failed. No response from server.');
                setErrors({});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/verify-email`, {
                email: formData.email,
                code: verificationCode
            });
            if (response.data) {
                // Format data same as Login
                const userDataWithToken = { ...response.data.user, token: response.data.token };
                showSuccessToast('Email verification successful!');
                onSignupSuccess(userDataWithToken);
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                'Verification failed. Please try again.';
            setErrors({ form: message });
            showErrorToast(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        // Check if user has exceeded resend limit (3 times in 5 minutes)
        const now = new Date();
        if (lastResendTime && (now - lastResendTime) < 5 * 60 * 1000) {
            if (resendCount >= 3) {
                showErrorToast('You have sent the code too many times. Please try again in 5 minutes.');
                return;
            }
        } else {
            // Reset counter if 5 minutes have passed
            setResendCount(0);
        }

        setErrors({});
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/resend-verification`, {
                email: formData.email
            });
            showSuccessToast('New verification code has been sent to your email.');
            setResendCount(prev => prev + 1);
            setLastResendTime(now);
        } catch (err) {
            if (err.response?.data) {
                showErrorToast(err.response.data);
            } else {
                showErrorToast('Failed to resend verification code. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const response = await axios.post(`${API_URL}/auth/google`, {
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.sub
            });

            if (response.data) {
                // Format data same as Login
                const userDataWithToken = { ...response.data.user, token: response.data.token };
                showSuccessToast('Google signup successful!');
                onSignupSuccess(userDataWithToken);
            }
        } catch (err) {
            showErrorToast(err.response?.data?.message || 'Google signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        showErrorToast('Google signup failed. Please try again.');
    };

    const rules = passwordRules(formData.password);

    /* ---------- Verification step ---------- */
    if (showVerification) {
        const content = (
            <>
                {!embedded && (
                    <div className="dv-auth-head">
                        <div className="dv-auth-logo">DRI<span>VON</span></div>
                        <h1 className="dv-auth-title">Xác thực email</h1>
                        <p className="dv-auth-sub">
                            Mã 6 chữ số đã được gửi tới <strong>{formData.email}</strong>
                        </p>
                    </div>
                )}

                {errors.form && (
                    <div className="dv-alert dv-alert--error" role="alert">
                        <FiAlertCircle />
                        <span>{errors.form}</span>
                    </div>
                )}

                <form onSubmit={handleVerifyEmail} className="dv-form" noValidate>
                    <div className="dv-field">
                        <div className="dv-input-wrap">
                            <span className="dv-input-icon"><FiShield /></span>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Nhập mã xác thực"
                                value={verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setVerificationCode(value);
                                    if (errors.form) setErrors({});
                                }}
                                className="dv-input dv-otp"
                                maxLength="6"
                                autoComplete="one-time-code"
                            />
                        </div>
                        <span className="dv-hint">Mã gồm 6 chữ số, hiệu lực trong 5 phút.</span>
                    </div>

                    <button
                        type="submit"
                        className="dv-btn dv-btn-primary"
                        disabled={isLoading || verificationCode.length < 6}
                    >
                        {isLoading ? <span className="dv-spinner" /> : <FiCheck />}
                        {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                    </button>

                    <button
                        type="button"
                        className="dv-btn dv-btn-ghost"
                        onClick={handleResendCode}
                        disabled={
                            isLoading ||
                            (resendCount >= 3 && lastResendTime && (new Date() - lastResendTime) < 5 * 60 * 1000)
                        }
                    >
                        {resendCount >= 3 ? 'Đã gửi 3 lần' : 'Gửi lại mã'}
                    </button>
                </form>
            </>
        );

        if (embedded) return <div className="dv-auth-body">{content}</div>;
        return (
            <div className="dv-auth-shell">
                <div className="dv-auth-card">{content}</div>
            </div>
        );
    }

    /* ---------- Signup step ---------- */
    const content = (
        <>
            {!embedded && (
                <div className="dv-auth-head">
                    <div className="dv-auth-logo">DRI<span>VON</span></div>
                    <h1 className="dv-auth-title">Create your account</h1>
                    <p className="dv-auth-sub">Chỉ mất 1 phút để bắt đầu hành trình cùng Drivon.</p>
                </div>
            )}

            {errors.general && (
                <div className="dv-alert dv-alert--error" role="alert">
                    <FiAlertCircle />
                    <span>{errors.general}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="dv-form" noValidate>
                <div className="dv-field">
                    <div className="dv-input-wrap">
                        <span className="dv-input-icon"><FiUser /></span>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Họ và tên"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`dv-input ${errors.fullName ? 'dv-input--error' : ''}`}
                            autoComplete="name"
                        />
                    </div>
                    {errors.fullName && (
                        <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.fullName}</span>
                    )}
                </div>

                <div className="dv-field">
                    <div className="dv-input-wrap">
                        <span className="dv-input-icon"><FiMail /></span>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`dv-input ${errors.email ? 'dv-input--error' : ''}`}
                            autoComplete="email"
                        />
                    </div>
                    {errors.email && (
                        <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.email}</span>
                    )}
                </div>

                <div className="dv-field">
                    <div className="dv-input-wrap">
                        <span className="dv-input-icon"><FiLock /></span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            className={`dv-input ${errors.password ? 'dv-input--error' : ''}`}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="dv-input-toggle"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    {formData.password && (
                        <>
                            <div className="dv-strength">
                                {rules.map((r) => (
                                    <span
                                        key={r.key}
                                        className={`dv-strength-bar ${
                                            r.ok
                                                ? (rules.filter(x => x.ok).length === 3
                                                    ? 'dv-strength-bar--on-strong'
                                                    : 'dv-strength-bar--on-fair')
                                                : 'dv-strength-bar--on-weak'
                                        }`}
                                    />
                                ))}
                            </div>
                            <ul className="dv-rules">
                                {rules.map((r) => (
                                    <li key={r.key} className={`dv-rule ${r.ok ? 'dv-rule--ok' : ''}`}>
                                        <FiCheck size={12} /> {r.label}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {errors.password && (
                        <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.password}</span>
                    )}
                </div>

                <div className="dv-field">
                    <div className="dv-input-wrap">
                        <span className="dv-input-icon"><FiPhone /></span>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Số điện thoại"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`dv-input ${errors.phone ? 'dv-input--error' : ''}`}
                            autoComplete="tel"
                        />
                    </div>
                    {errors.phone && (
                        <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.phone}</span>
                    )}
                </div>

                <div className="dv-field">
                    <div className="dv-input-wrap">
                        <span className="dv-input-icon"><FiMapPin /></span>
                        <input
                            type="text"
                            name="address"
                            placeholder="Địa chỉ"
                            value={formData.address}
                            onChange={handleChange}
                            className={`dv-input ${errors.address ? 'dv-input--error' : ''}`}
                            autoComplete="street-address"
                        />
                    </div>
                    {errors.address && (
                        <span className="dv-field-error"><FiAlertCircle size={12} /> {errors.address}</span>
                    )}
                </div>

                <button type="submit" className="dv-btn dv-btn-primary" disabled={isLoading}>
                    {isLoading ? <span className="dv-spinner" /> : <FiUserPlus />}
                    {isLoading ? 'Đang tạo tài khoản...' : 'Sign Up'}
                </button>

                <div className="dv-divider">hoặc</div>

                <div className="dv-google-wrap">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        text="signup_with"
                    />
                </div>
            </form>
        </>
    );

    if (embedded) return <div className="dv-auth-body">{content}</div>;
    return (
        <div className="dv-auth-shell">
            <div className="dv-auth-card dv-auth-card--wide">{content}</div>
        </div>
    );
};

export default Signup;