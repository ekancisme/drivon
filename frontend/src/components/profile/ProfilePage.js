import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../css/ProfilePage.css';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
import cloudinaryConfig from '../../config/cloudinary';
import {
  FiUpload,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiEdit2,
  FiShield,
  FiKey,
  FiChevronRight,
  FiAlertCircle,
  FiImage,
  FiX,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
} from 'react-icons/fi';
import { Table } from "antd";

const DOC_TYPE_LABELS = {
  cccd: 'CCCD / CMND',
  license: 'Giấy phép lái xe (GPLX)',
  passport: 'Hộ chiếu',
  other: 'Giấy tờ khác',
};

const ProfilePage = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasPassword, setHasPassword] = useState(true);
  const [userImages, setUserImages] = useState([]);
  const [docType, setDocType] = useState('cccd');
  const [docDesc, setDocDesc] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docUploadError, setDocUploadError] = useState(null);
  const [docEditMode, setDocEditMode] = useState(false);
  const [pendingDocFiles, setPendingDocFiles] = useState([]);
  const [pendingDocPreviews, setPendingDocPreviews] = useState([]);
  const [pendingDocType, setPendingDocType] = useState('cccd');
  const [pendingDocDesc, setPendingDocDesc] = useState('');
  const docUrlInput = useRef();
  const fileInputRef = useRef();
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  useEffect(() => {
    setEditedUser({ ...user });
    checkPasswordStatus();
    if (user && user.userId) {
      fetchUserImages();
    }
    setLoading(false);
    setError(null);
  }, [user]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) return;
    axios.get(`${API_URL}/owner-withdraw/${userData.userId}`)
      .then(res => setWithdrawRequests(res.data))
      .catch(() => setWithdrawRequests([]));
  }, []);

  const checkPasswordStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile/check-password-status/${user.email}`);
      setHasPassword(response.data.hasPassword);
    } catch (err) {
      console.error('Error checking password status:', err);
      showErrorToast('Failed to check password status');
    }
  };

  const fetchUserImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/image`, { params: { userId: user.userId } });
      setUserImages(res.data);
    } catch (err) {
      showErrorToast('Cannot load document list');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedUser({ ...user });
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!editedUser.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!editedUser.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(editedUser.phone.trim())) {
      errors.phone = 'Invalid phone number (must be 10 digits)';
    }
    return errors;
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setError(validationErrors);
        return;
      }

      const response = await axios.put(`${API_URL}/profile/update`, editedUser);

      if (response.data) {
        onUpdateUser(response.data);
        setSuccessMessage('Profile updated successfully!');
        showSuccessToast('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.error || 'An error occurred while updating profile.';
      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const getDefaultAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128`;
  };

  const handleDocFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setDocUploadError('File size must not exceed 5MB');
        setDocFile(null);
        setDocPreview(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setDocUploadError('Please select an image file');
        setDocFile(null);
        setDocPreview(null);
        return;
      }
      setDocFile(file);
      setDocPreview(URL.createObjectURL(file));
      setDocUploadError(null);
    } else {
      setDocFile(null);
      setDocPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDocFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickDropZone = () => {
    fileInputRef.current.click();
  };

  const handleDocEditToggle = () => {
    if (!docEditMode) {
      setPendingDocFiles([]);
      setPendingDocPreviews([]);
      setPendingDocType(docType);
      setPendingDocDesc(docDesc);
    }
    setDocEditMode(!docEditMode);
  };

  const handleDocCancel = () => {
    setPendingDocFiles([]);
    setPendingDocPreviews([]);
    setPendingDocType(docType);
    setPendingDocDesc(docDesc);
    setDocEditMode(false);
  };

  const handleDocFilesChange = (e) => {
    if (!docEditMode) return;
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024 && file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setDocUploadError('Only images allowed, each file max 5MB!');
      return;
    }
    setPendingDocFiles(prev => [...prev, ...validFiles]);
    setPendingDocPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
  };

  // Helper: Check if a document type is verified
  const isDocTypeVerified = (docType) => {
    const images = groupedImages[docType] || [];
    return images.some(img => img.verified === true || img.verified === 1);
  };

  // Helper: Get all imageIds of a document type (optionally only unverified)
  const getImageIdsByDocType = (docType, onlyUnverified = false) => {
    const images = groupedImages[docType] || [];
    return images
      .filter(img => !onlyUnverified || !img.verified || img.verified === 0)
      .map(img => img.imageId);
  };

  const handleDocSave = async (e) => {
    e.preventDefault();
    setDocUploading(true);
    setDocUploadError(null);
    try {
      if (pendingDocFiles.length === 0) {
        setDocUploadError('Please select at least 1 document image');
        setDocUploading(false);
        return;
      }
      // Check if doc type is verified, block upload
      if (isDocTypeVerified(pendingDocType)) {
        setDocUploadError('This document type has already been verified. You cannot upload more images.');
        setDocUploading(false);
        return;
      }
      // Delete all previous images of this doc type (unverified only)
      const oldImageIds = getImageIdsByDocType(pendingDocType, true);
      for (const imageId of oldImageIds) {
        await axios.delete(`${API_URL}/user/image/${imageId}`);
      }
      // Upload all images to Cloudinary
      const uploadPromises = pendingDocFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        formData.append('api_key', cloudinaryConfig.apiKey);
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
        const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);
        return cloudinaryResponse.data.secure_url;
      });
      const imageUrls = await Promise.all(uploadPromises);
      // Send each image to backend
      for (const imageUrl of imageUrls) {
        await axios.post(`${API_URL}/user/image`, {
          userId: user.userId,
          imageUrl,
          documentType: pendingDocType,
          description: pendingDocDesc
        });
      }
      showSuccessToast('Document uploaded successfully!');
      setPendingDocFiles([]);
      setPendingDocPreviews([]);
      setDocDesc('');
      fetchUserImages();
      setDocEditMode(false);
    } catch (err) {
      setDocUploadError('Document upload failed!');
      showErrorToast('Document upload failed!');
    }
    setDocUploading(false);
  };

  const handleDeleteUserImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`${API_URL}/user/image/${imageId}`);
      showSuccessToast('Document deleted!');
      fetchUserImages();
    } catch (err) {
      showErrorToast('Failed to delete document!');
    }
  };

  const handleSign = async (requestId) => {
    if (!window.confirm('Are you sure you have received the money? This action cannot be undone!')) return;
    try {
      await axios.patch(`${API_URL}/owner-withdraw/${requestId}/sign`, { sign: true });
      setWithdrawRequests(his => his.map(w => w.requestId === requestId ? { ...w, sign: true } : w));
      showSuccessToast('Confirmed money receipt!');
    } catch {
      showErrorToast('Confirmation failed!');
    }
  };

  // Group userImages by documentType
  const groupedImages = userImages.reduce((acc, img) => {
    if (!acc[img.documentType]) acc[img.documentType] = [];
    acc[img.documentType].push(img);
    return acc;
  }, {});

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="pf-loader" role="status" aria-label="Đang tải" />
      </div>
    );
  }

  const dropzoneLocked = !docEditMode || docUploading || isDocTypeVerified(pendingDocType);

  return (
    <div className="profile-page">
      {successMessage && (
        <div className="pf-alert pf-alert--success" role="alert">
          <FiCheckCircle />
          <span>{successMessage}</span>
          <button
            type="button"
            className="pf-alert__close"
            onClick={() => setSuccessMessage(null)}
            aria-label="Đóng thông báo"
          >
            <FiX />
          </button>
        </div>
      )}

      {error && typeof error === 'string' && (
        <div className="pf-alert pf-alert--error" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
          <button
            type="button"
            className="pf-alert__close"
            onClick={() => setError(null)}
            aria-label="Đóng thông báo"
          >
            <FiX />
          </button>
        </div>
      )}

      <div className="pf-grid">
        {/* ================= LEFT COLUMN ================= */}
        <div className="pf-col">
          <div className="pf-card pf-card--glow">
            <div className="pf-identity">
              <div className="pf-avatar-wrap">
                <img
                  src={user.avatarUrl || getDefaultAvatarUrl(user.fullName)}
                  alt="Avatar"
                  className="pf-avatar"
                />
                <Link to="/change-avatar" className="pf-avatar-btn" title="Đổi ảnh đại diện">
                  <FiCamera />
                </Link>
              </div>
              <h2 className="pf-name">{user.fullName || 'Chưa cập nhật'}</h2>
              <p className="pf-email">{user.email}</p>
            </div>

            <div className="pf-info-list">
              <div className="pf-info-row">
                <FiUser />
                <div>
                  <span className="pf-info-label">Họ và tên</span>
                  <div className={`pf-info-value ${!user.fullName ? 'pf-info-value--empty' : ''}`}>
                    {user.fullName || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>
              <div className="pf-info-row">
                <FiMail />
                <div>
                  <span className="pf-info-label">Email</span>
                  <div className="pf-info-value">{user.email}</div>
                </div>
              </div>
              <div className="pf-info-row">
                <FiPhone />
                <div>
                  <span className="pf-info-label">Số điện thoại</span>
                  <div className={`pf-info-value ${!user.phone ? 'pf-info-value--empty' : ''}`}>
                    {user.phone || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>
              <div className="pf-info-row">
                <FiMapPin />
                <div>
                  <span className="pf-info-label">Địa chỉ</span>
                  <div className={`pf-info-value ${!user.address ? 'pf-info-value--empty' : ''}`}>
                    {user.address || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-head">
              <h3 className="pf-card-title">
                <FiEdit2 />
                Thông tin cá nhân
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="pf-btn pf-btn--ghost pf-btn--sm"
                >
                  <FiEdit2 />
                  Chỉnh sửa
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="pf-info-list">
                <div className="pf-info-row">
                  <FiUser />
                  <div>
                    <span className="pf-info-label">Họ và tên</span>
                    <div className={`pf-info-value ${!user.fullName ? 'pf-info-value--empty' : ''}`}>
                      {user.fullName || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
                <div className="pf-info-row">
                  <FiPhone />
                  <div>
                    <span className="pf-info-label">Số điện thoại</span>
                    <div className={`pf-info-value ${!user.phone ? 'pf-info-value--empty' : ''}`}>
                      {user.phone || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
                <div className="pf-info-row">
                  <FiMapPin />
                  <div>
                    <span className="pf-info-label">Địa chỉ</span>
                    <div className={`pf-info-value ${!user.address ? 'pf-info-value--empty' : ''}`}>
                      {user.address || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form className="dv-form" onSubmit={(e) => e.preventDefault()}>
                <div className="pf-field">
                  <label className="pf-label" htmlFor="fullName">Họ và tên</label>
                  <input
                    type="text"
                    className={`pf-input ${error?.fullName ? 'pf-input--error' : ''}`}
                    id="fullName"
                    name="fullName"
                    value={editedUser.fullName || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                  {error?.fullName && (
                    <span className="pf-field-error">
                      <FiAlertCircle size={12} /> {error.fullName}
                    </span>
                  )}
                </div>

                <div className="pf-field">
                  <label className="pf-label" htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="pf-input"
                    id="email"
                    value={user.email}
                    disabled
                  />
                  <span className="pf-hint">
                    <FiInfo size={12} /> Email không thể thay đổi
                  </span>
                </div>

                <div className="pf-field">
                  <label className="pf-label" htmlFor="phone">Số điện thoại</label>
                  <input
                    type="tel"
                    className={`pf-input ${error?.phone ? 'pf-input--error' : ''}`}
                    id="phone"
                    name="phone"
                    value={editedUser.phone || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                  {error?.phone && (
                    <span className="pf-field-error">
                      <FiAlertCircle size={12} /> {error.phone}
                    </span>
                  )}
                </div>

                <div className="pf-field">
                  <label className="pf-label" htmlFor="address">Địa chỉ</label>
                  <textarea
                    className="pf-textarea"
                    id="address"
                    name="address"
                    rows="3"
                    value={editedUser.address || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className="pf-actions">
                  <button type="button" className="pf-btn pf-btn--primary" onClick={handleSave}>
                    <FiCheckCircle />
                    Lưu thay đổi
                  </button>
                  <button type="button" className="pf-btn pf-btn--ghost" onClick={handleCancel}>
                    <FiX />
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pf-card">
            <div className="pf-card-head">
              <h3 className="pf-card-title">
                <FiShield />
                Bảo mật
              </h3>
            </div>
            <div className="pf-links">
              <Link to="/change-password" className="pf-link-item">
                <FiKey />
                <div>
                  <h4 className="pf-link-title">
                    {hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}
                  </h4>
                  <p className="pf-link-desc">
                    {hasPassword
                      ? 'Cập nhật mật khẩu đăng nhập của bạn'
                      : 'Tạo mật khẩu để bảo vệ tài khoản'}
                  </p>
                </div>
                <FiChevronRight />
              </Link>
              <Link to="/change-avatar" className="pf-link-item">
                <FiUser />
                <div>
                  <h4 className="pf-link-title">Đổi ảnh đại diện</h4>
                  <p className="pf-link-desc">Cập nhật ảnh đại diện của bạn</p>
                </div>
                <FiChevronRight />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="pf-col">
          <div className="pf-card">
            <div className="pf-card-head">
              <h3 className="pf-card-title">
                <FiImage />
                Giấy tờ xác minh
              </h3>
              <button
                type="button"
                onClick={handleDocEditToggle}
                className="pf-btn pf-btn--ghost pf-btn--sm"
              >
                {docEditMode ? <FiX /> : <FiEdit2 />}
                {docEditMode ? 'Đóng' : 'Chỉnh sửa'}
              </button>
            </div>

            <form className="dv-form" onSubmit={handleDocSave}>
              <div className="pf-doc-upload">
                <div>
                  <div
                    className={`pf-dropzone ${
                      dropzoneLocked ? 'pf-dropzone--locked' : 'pf-dropzone--active'
                    }`}
                    onDrop={dropzoneLocked ? undefined : handleDrop}
                    onDragOver={dropzoneLocked ? undefined : handleDragOver}
                    onClick={dropzoneLocked ? undefined : handleClickDropZone}
                  >
                    <FiUpload size={40} />
                    <p className="pf-dropzone-text">
                      Kéo thả ảnh vào đây hoặc bấm để chọn tệp
                    </p>
                    <p className="pf-dropzone-hint">PNG, JPG · tối đa 5MB mỗi ảnh</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleDocFilesChange}
                      disabled={dropzoneLocked}
                    />
                  </div>

                  {pendingDocPreviews.length > 0 && (
                    <div className="pf-preview-grid">
                      {pendingDocPreviews.map((url, idx) => (
                        <div className="pf-preview-item" key={idx}>
                          <img src={url} alt="Preview" />
                          <button
                            type="button"
                            className="pf-preview-remove"
                            title="Xoá ảnh này"
                            onClick={() => {
                              setPendingDocFiles(files => files.filter((_, i) => i !== idx));
                              setPendingDocPreviews(previews => previews.filter((_, i) => i !== idx));
                            }}
                            disabled={isDocTypeVerified(pendingDocType)}
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {docUploading && (
                    <p className="pf-hint" style={{ marginTop: 10 }}>
                      <span className="pf-spinner" /> Đang tải lên...
                    </p>
                  )}
                </div>

                <div>
                  <div className="pf-field">
                    <label className="pf-label" htmlFor="docType">Loại giấy tờ</label>
                    <select
                      id="docType"
                      className="pf-select"
                      value={pendingDocType}
                      onChange={e => setPendingDocType(e.target.value)}
                      disabled={!docEditMode}
                    >
                      <option value="cccd">CCCD / CMND</option>
                      <option value="license">Giấy phép lái xe (GPLX)</option>
                      <option value="passport">Hộ chiếu</option>
                      <option value="other">Giấy tờ khác</option>
                    </select>
                  </div>

                  <div className="pf-field">
                    <label className="pf-label" htmlFor="docDesc">Mô tả</label>
                    <input
                      id="docDesc"
                      type="text"
                      className="pf-input"
                      value={pendingDocDesc}
                      onChange={e => setPendingDocDesc(e.target.value)}
                      placeholder="Mô tả giấy tờ"
                      disabled={!docEditMode}
                    />
                  </div>

                  {isDocTypeVerified(pendingDocType) && (
                    <p className="pf-hint">
                      <FiCheckCircle size={12} /> Loại giấy tờ này đã được xác minh, không thể tải thêm.
                    </p>
                  )}
                </div>
              </div>

              {docEditMode && (
                <div className="pf-actions" style={{ marginTop: 16 }}>
                  <button
                    type="submit"
                    className="pf-btn pf-btn--primary"
                    disabled={docUploading || isDocTypeVerified(pendingDocType)}
                  >
                    {docUploading ? <span className="pf-spinner" /> : <FiCheckCircle />}
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    className="pf-btn pf-btn--ghost"
                    onClick={handleDocCancel}
                    disabled={docUploading}
                  >
                    <FiX />
                    Huỷ
                  </button>
                </div>
              )}

              {docUploadError && (
                <div className="pf-alert pf-alert--error" style={{ marginTop: 14, marginBottom: 0 }}>
                  <FiAlertCircle />
                  <span>{docUploadError}</span>
                </div>
              )}
            </form>

            <div style={{ marginTop: 22 }}>
              {userImages.length === 0 ? (
                <div className="pf-empty">Chưa có giấy tờ nào được tải lên.</div>
              ) : (
                Object.entries(groupedImages).map(([type, images]) => {
                  const verified = isDocTypeVerified(type);
                  return (
                    <div className="pf-doc-group" key={type}>
                      <div className="pf-doc-group-head">
                        <h4 className="pf-doc-group-title">
                          {DOC_TYPE_LABELS[type] || type.toUpperCase()}
                        </h4>
                        <span className={`pf-badge ${verified ? 'pf-badge--ok' : 'pf-badge--warn'}`}>
                          {verified ? <FiCheckCircle size={12} /> : <FiAlertCircle size={12} />}
                          {verified ? 'Đã xác minh' : 'Chờ xác minh'}
                        </span>
                      </div>

                      <div className="pf-doc-items">
                        {images.map((img) => {
                          const imgVerified = img.verified === true || img.verified === 1;
                          return (
                            <div className="pf-doc-item" key={img.imageId}>
                              <img
                                src={img.imageUrl}
                                alt={img.documentType}
                                className={`pf-doc-img ${imgVerified ? 'pf-doc-img--ok' : 'pf-doc-img--fail'}`}
                              />
                              <div className="pf-doc-meta">
                                {!imgVerified && img.description && (
                                  <span className="pf-doc-desc">{img.description}</span>
                                )}
                                <span className="pf-doc-time">
                                  Tải lên: {img.uploadedAt ? new Date(img.uploadedAt).toLocaleString() : ''}
                                </span>
                                <span className={`pf-badge ${imgVerified ? 'pf-badge--ok' : 'pf-badge--danger'}`}>
                                  {imgVerified ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                  {imgVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                                </span>
                              </div>
                              {docEditMode && !imgVerified && !verified && (
                                <button
                                  type="button"
                                  className="pf-doc-delete"
                                  title="Xoá giấy tờ"
                                  onClick={() => handleDeleteUserImage(img.imageId)}
                                >
                                  <FiTrash2 size={15} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-head">
              <h3 className="pf-card-title">
                <FiDollarSign />
                Yêu cầu rút tiền
              </h3>
            </div>
            <Table
              className="pf-table"
              dataSource={withdrawRequests}
              rowKey="requestId"
              pagination={false}
              columns={[
                { title: "Số tiền", dataIndex: "amount" },
                { title: "Trạng thái", dataIndex: "status" },
                { title: "Ghi chú", dataIndex: "note" },
                { title: "Ngày yêu cầu", dataIndex: "requestedAt" },
                {
                  title: "Đã nhận tiền",
                  dataIndex: "sign",
                  render: (sign, record) => {
                    if (sign) {
                      return <span style={{ color: '#BBF7D0', fontWeight: 600 }}>Đã xác nhận</span>;
                    }
                    if (record.status === 'completed') {
                      return <input type="checkbox" onChange={() => handleSign(record.requestId)} />;
                    }
                    return <span style={{ color: 'var(--text-dim)' }}>Chưa hoàn tất</span>;
                  }
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;