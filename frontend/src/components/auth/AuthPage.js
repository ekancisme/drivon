import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ForgotPasswordPage from './ForgotPasswordPage';

const AuthPage = ({ handleLoginSuccess, handleSignupSuccess }) => {
  // 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState('login');

  return (
    <div className="dv-auth-shell">
      <div className="dv-auth-card dv-auth-card--wide">
        {/* Brand */}
        <div className="dv-auth-head">
          <div className="dv-auth-logo">DRI<span>VON</span></div>
          <h1 className="dv-auth-title">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Forgot password'}
          </h1>
          <p className="dv-auth-sub">
            {mode === 'login' && 'Đăng nhập để tiếp tục thuê xe trên Drivon.'}
            {mode === 'signup' && 'Chỉ mất 1 phút để bắt đầu hành trình cùng Drivon.'}
            {mode === 'forgot' && 'Khôi phục quyền truy cập vào tài khoản của bạn.'}
          </p>
        </div>

        {/* Tabs */}
        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Signup
            </button>
          </div>
        )}

        {/* Body */}
        {mode === 'login' && (
          <>
            <Login onLoginSuccess={handleLoginSuccess} embedded />
            <div className="dv-auth-foot">
              <button
                type="button"
                className="dv-link"
                onClick={() => setMode('forgot')}
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {mode === 'signup' && (
          <Signup onSignupSuccess={handleSignupSuccess} embedded />
        )}

        {mode === 'forgot' && (
          <>
            <ForgotPasswordPage embedded />
            <div className="dv-auth-foot">
              <button
                type="button"
                className="dv-link"
                onClick={() => setMode('login')}
              >
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;