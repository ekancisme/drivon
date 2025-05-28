import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "./Button";

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/change-password",
        {
          email,
          oldPassword,
          newPassword,
        }
      );
      setMessage("Thay đổi mật khẩu thành công");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      setError(err.response?.data || "Không thể thay đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
        <div style={{ color: "red" }}>Link không hợp lệ</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Thay đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="auth-input"
            required
            minLength="6"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="auth-input"
            required
            minLength="6"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-input"
            required
            minLength="6"
          />
        </div>

        {message && (
          <div
            style={{
              color: "green",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#d4edda",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="auth-button">
          Thay đổi mật khẩu
        </Button>

        <Button
          type="button"
          onClick={() => navigate("/login")}
          className="auth-button secondary"
          style={{ marginTop: "10px" }}
        >
          Quay lại đăng nhập
        </Button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
