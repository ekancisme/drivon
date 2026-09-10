import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Modal, Button, List, Rate, Avatar, Divider, Pagination, Slider } from 'antd';
import { showErrorToast, showSuccessToast } from '../notification/notification';
import '../notification/noti.css';
import 'antd/dist/reset.css';
import RentalForm from './RentalForm';
import { GiGearStickPattern } from "react-icons/gi";
import './viewCarDetail.css';
import { TbAutomaticGearboxFilled } from "react-icons/tb";
import { FaGasPump, FaCalendarAlt, FaUserFriends, FaCogs, FaRoad, FaMapMarkerAlt, FaInfoCircle, FaExclamationCircle } from "react-icons/fa";
import { BsEvStationFill } from "react-icons/bs";
import { BsFillFuelPumpDieselFill } from "react-icons/bs";
import {
  FaBluetoothB, FaCamera, FaParking, FaSnowflake, FaMapMarkedAlt,
  FaShieldAlt, FaPhoneAlt, FaCommentDots, FaStar, FaChair,
  FaIdCard, FaFileContract, FaBan, FaCheckCircle, FaSuitcase,
  FaChevronLeft, FaChevronRight, FaBolt
} from "react-icons/fa";
import Loader from '../others/loader';
import { useCarData } from '../../contexts/CarDataContext';
import { API_URL } from '../../api/configApi';

// Danh mục tiện nghi: key -> nhãn + icon
const AMENITY_CATALOG = {
  gps: { label: 'Bản đồ / GPS', icon: <FaMapMarkedAlt /> },
  bluetooth: { label: 'Bluetooth', icon: <FaBluetoothB /> },
  camera360: { label: 'Camera 360', icon: <FaCamera /> },
  parking: { label: 'Cảm biến lùi', icon: <FaShieldAlt /> },
  parking_sensor: { label: 'Cảm biến lùi', icon: <FaShieldAlt /> },
  airbag: { label: 'Túi khí an toàn', icon: <FaShieldAlt /> },
  ac: { label: 'Điều hòa', icon: <FaSnowflake /> },
  usb: { label: 'Cổng sạc USB', icon: <FaBolt /> },
  child_seat: { label: 'Ghế trẻ em', icon: <FaChair /> },
  luggage: { label: 'Khoang hành lý rộng', icon: <FaSuitcase /> },
};

const DEFAULT_AMENITIES = ['gps', 'bluetooth', 'camera360', 'parking', 'airbag', 'ac', 'usb', 'child_seat'];

const ViewCarDetail = () => {
  const { licensePlate } = useParams();
  const navigate = useNavigate();
  const { carsData, getCarByLicensePlate, fetchCarsData } = useCarData();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const calendarRef = useRef(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponList, setCouponList] = useState([]);
  const [carFilter, setCarFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const carsPerPage = 3;
  const [mainImage, setMainImage] = useState('');
  const [otherImages, setOtherImages] = useState([]);
  const [carContracts, setCarContracts] = useState({});
  const [ownerInfo, setOwnerInfo] = useState(null);

  // State cho modal xem ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // State cho dữ liệu đánh giá từ API
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {},
    reviews: []
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // State cho modal xem tất cả đánh giá
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [allReviewsFilter, setAllReviewsFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Lấy 2 đánh giá nổi bật: ưu tiên 5 sao, nếu không có thì lấy 2 đánh giá sao bất kỳ (cao nhất trước)
  const topHighlightReviews = (() => {
    const fiveStars = reviewsData.reviews.filter(review => review.rating === 5);
    if (fiveStars.length > 0) {
      return fiveStars.slice(0, 2);
    }
    // Nếu không có 5 sao, lấy 2 đánh giá sao cao nhất còn lại
    const sorted = [...reviewsData.reviews].sort((a, b) => b.rating - a.rating);
    return sorted.slice(0, 2);
  })();

  // Lọc đánh giá cho modal
  const allReviewsFiltered = allReviewsFilter === 0
    ? reviewsData.reviews
    : reviewsData.reviews.filter(review => review.rating === allReviewsFilter);

  // Tính toán phân trang cho modal
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = allReviewsFiltered.slice(indexOfFirstReview, indexOfLastReview);

  // Đặt filteredCars lên trên các useEffect để tránh lỗi ReferenceError
  const filteredCars = useMemo(() => {
    return carsData.filter(item => {
      if (!car) return false;
      if (item.licensePlate === car.licensePlate) return false;
      if (!item.contract || item.contract.status !== 'ACTIVE_LEASE') return false;
      if (item.status !== 'available') return false;
      if (carFilter === 'brand') return item.brand === car.brand;
      if (carFilter === 'type') return item.type === car.type;
      return true;
    });
  }, [carsData, car, carFilter]);

  useEffect(() => {
    // Fetch cars data using context first
    const loadCarData = async () => {
      try {
        await fetchCarsData();
      } catch (error) {
        console.error('Error loading cars data:', error);
      }
    };
    loadCarData();
  }, [fetchCarsData]);

  useEffect(() => {
    // Try to get car from context first
    const carFromContext = getCarByLicensePlate(licensePlate);

    if (carFromContext) {
      // Car found in context, use it
      setCar(carFromContext);
      setMainImage(carFromContext.mainImage);
      setOtherImages(carFromContext.otherImages || []);
      setContract(carFromContext.contract);
      setReviewsData(carFromContext.reviewStats);
      setReviewsLoading(false);
      setLoading(false);

      // Set owner info from contract data
      if (carFromContext.contract) {
        setOwnerInfo({
          userId: carFromContext.contract.customerId,
          fullName: carFromContext.contract.name,
          email: carFromContext.contract.email,
          phone: carFromContext.contract.phone
        });
      } else if (carFromContext.ownerId) {
        // Fallback to car's ownerId if contract is not available
        setOwnerInfo({
          userId: carFromContext.ownerId.toString(),
          fullName: carFromContext.contract?.name || 'Car Owner',
          email: carFromContext.contract?.email || '',
          phone: carFromContext.contract?.phone || ''
        });
      }
    } else {
      // Car not found in context, fetch individually
      axios.get(`${API_URL}/cars/${licensePlate}`)
        .then(res => {
          console.log('Car data:', res.data);
          setCar(res.data);
          setMainImage(res.data.mainImage);
          setOtherImages(res.data.otherImages || []);
          setLoading(false);

          // Set owner info from car data if available
          if (res.data.ownerId) {
            setOwnerInfo({
              userId: res.data.ownerId.toString(),
              fullName: 'Car Owner',
              email: '',
              phone: ''
            });
          }
        })
        .catch(error => {
          console.error('Error fetching car:', error);
          setError('Car not found');
          setLoading(false);
        });

      // Fetch hợp đồng gần nhất của xe
      axios.get(`${API_URL}/contracts/by-car/${licensePlate}`)
        .then(res => {
          console.log('Contract data:', res.data);
          setContract(res.data);
          // Set owner info from contract data
          if (res.data) {
            setOwnerInfo({
              userId: res.data.customerId,
              fullName: res.data.name,
              email: res.data.email,
              phone: res.data.phone
            });
          }
        })
        .catch(error => {
          console.error('Error fetching contract:', error);
          setContract(null);
          // Try to get owner info from car data if contract fetch fails
          if (car && car.ownerId) {
            setOwnerInfo({
              userId: car.ownerId.toString(),
              fullName: 'Car Owner',
              email: '',
              phone: ''
            });
          }
        });

      // Fetch reviews
      setReviewsLoading(true);
      axios.get(`${API_URL}/reviews/car/${licensePlate}`)
        .then(res => {
          setReviewsData(res.data);
          setReviewsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching reviews:', error);
          setReviewsLoading(false);
        });
    }
  }, [licensePlate, carsData, getCarByLicensePlate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        event.target.className !== 'bi bi-calendar-range'
      ) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    if (showCouponModal) {
      axios.get(`${API_URL}/promotions`)
        .then(res => setCouponList(res.data))
        .catch(() => setCouponList([]));
    }
  }, [showCouponModal]);

  useEffect(() => {
    const fetchContracts = async () => {
      // Lấy danh sách xe cần fetch contract (chưa có trong carContracts)
      const carsToFetch = filteredCars.filter(item => !carContracts[item.licensePlate]);
      if (carsToFetch.length === 0) return; // Không có xe mới, không setState

      const newContracts = {};
      await Promise.all(carsToFetch.map(async (item) => {
        try {
          const res = await axios.get(`${API_URL}/contracts/by-car/${item.licensePlate}`);
          newContracts[item.licensePlate] = res.data;
        } catch {
          newContracts[item.licensePlate] = null;
        }
      }));
      // Chỉ setCarContracts nếu có contract mới
      if (Object.keys(newContracts).length > 0) {
        setCarContracts(prev => ({ ...prev, ...newContracts }));
      }
    };
    if (filteredCars.length > 0) fetchContracts();
    // Đã loại bỏ carContracts khỏi dependency để tránh vòng lặp vô tận
  }, [filteredCars]);

  useEffect(() => {
    if (zoomLevel === 1) {
      setTranslate({ x: 0, y: 0 });
      setLastTranslate({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  const handleApplyCoupon = (coupon) => {
    if (selectedCoupon && selectedCoupon.code === coupon.code) {
      setSelectedCoupon(null);
      showErrorToast('Coupon removed');
    } else {
      setSelectedCoupon(coupon);
      showSuccessToast(`Applied coupon: ${coupon.code}`);
    }
  };

  const handleSelectCar = (selectedCar) => {
    navigate(`/cars/${selectedCar.licensePlate}`);
    setContract(null);
    setMainImage(selectedCar.mainImage);
    setOtherImages(selectedCar.otherImages || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThumbnailClick = (img, idx) => {
    const newOtherImages = [...otherImages];
    newOtherImages[idx] = mainImage;
    setMainImage(img);
    setOtherImages(newOtherImages);
  };

  // Hàm xử lý double click vào ảnh chính
  const handleMainImageDoubleClick = () => {
    setSelectedImage(mainImage);
    setShowImageModal(true);
  };

  // Hàm xử lý double click vào thumbnail
  const handleThumbnailDoubleClick = (img) => {
    setSelectedImage(img);
    setShowImageModal(true);
  };

  // Hàm đóng modal ảnh
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
    setZoomLevel(1);
    setTranslate({ x: 0, y: 0 });
    setLastTranslate({ x: 0, y: 0 });
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1));
  };

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setStartPan({ x: e.clientX, y: e.clientY });
    setLastTranslate({ ...translate });
    setIsPanning(true);
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    setTranslate({
      x: lastTranslate.x + dx,
      y: lastTranslate.y + dy,
    });
  };

  const handleMouseUpOrLeave = () => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const maxIndex = Math.max(0, filteredCars.length - carsPerPage);
  const translateX = -(currentIndex * (240 + 24)); // 240px width + 24px gap

  const handlePrev = () => setCurrentIndex(idx => Math.max(0, idx - 1));
  const handleNext = () => setCurrentIndex(idx => Math.min(maxIndex, idx + 1));

  useEffect(() => { setCurrentIndex(0); }, [carFilter, carsData, car]);

  // Thêm state cho modal license warning
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  // Thêm state để phân biệt trạng thái license
  const [licenseStatus, setLicenseStatus] = useState('none'); // 'none', 'uploaded', 'pending'

  const handleRentClick = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      showErrorToast('Please log in to rent a car');
      return;
    }

    // Debug: Log user and owner info
    console.log('Current user:', user);
    console.log('Owner info:', ownerInfo);
    console.log('User ID:', user.userId);
    console.log('Owner ID:', ownerInfo?.userId);
    console.log('User ID type:', typeof user.userId);
    console.log('Owner ID type:', typeof ownerInfo?.userId);

    // Check if user is trying to rent their own car
    if (ownerInfo && String(user.userId) === String(ownerInfo.userId)) {
      console.log('User is trying to rent their own car');
      showErrorToast('This is your car');
      return;
    }

    // Check license
    try {
      const res = await axios.get(`${API_URL}/user/image/check-license/${user.userId}`);
      if (!res.data.hasLicense) {
        setLicenseStatus('none');
        setShowLicenseModal(true);
        return;
      } else if (!res.data.verified) {
        setLicenseStatus('pending');
        setShowLicenseModal(true);
        return;
      }
    } catch (e) {
      setLicenseStatus('none');
      setShowLicenseModal(true);
      return;
    }
    setShowRentalForm(true);
  };

  const handleRentalSuccess = (rentalData) => {
    showSuccessToast('Car booking successful!');
    setShowRentalForm(false);
    // You can add additional logic here, such as redirecting to a confirmation page
  };

  const handleContactOwner = () => {
    console.log('Contact owner clicked');
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Current user:', user);
    console.log('Owner info:', ownerInfo);

    if (!user) {
      showErrorToast('Please log in to contact car owner');
      navigate('/auth');
      return;
    }

    if (!ownerInfo) {
      showErrorToast('Unable to get car owner information');
      return;
    }

    // Check if user is trying to contact themselves
    if (user.userId === ownerInfo.userId) {
      showErrorToast('You cannot contact yourself');
      return;
    }

    // Create default message
    const defaultMessage = `Hello, I'm interested in your ${car.brand} ${car.model}`;

    console.log('Navigating to messages with:', {
      selectedUser: {
        id: ownerInfo.userId,
        name: ownerInfo.fullName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerInfo.fullName)}&background=random`,
        lastMessage: defaultMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      initialMessage: defaultMessage
    });

    // Điều hướng đến trang messages với thông tin chủ xe
    navigate('/messages', {
      state: {
        selectedUser: {
          id: ownerInfo.userId,
          name: ownerInfo.fullName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerInfo.fullName)}&background=random`,
          lastMessage: defaultMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        initialMessage: defaultMessage
      }
    });
  };

  if (loading) return <div className="loading"><Loader /></div>;

  // Hàm xử lý mở modal
  const handleShowAllReviews = () => {
    setShowAllReviewsModal(true);
  };

  // Hàm xử lý đóng modal
  const handleCloseAllReviews = () => {
    setShowAllReviewsModal(false);
  };

  if (error) return <div className="error-state">{error}</div>;
  if (!car) return <div className="error-state">No car data available</div>;

  // ===== Dữ liệu dẫn xuất cho UI nâng cấp =====
  const ownerAvatar = ownerInfo
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerInfo.fullName || 'Owner')}&background=0b1220&color=22d3ee&bold=true`
    : '';

  const galleryImages = [mainImage, ...(otherImages || [])].filter(Boolean);

  const handleGalleryStep = (dir) => {
    if (galleryImages.length < 2) return;
    const idx = galleryImages.indexOf(mainImage);
    const nextIdx = (idx + dir + galleryImages.length) % galleryImages.length;
    const nextImg = galleryImages[nextIdx];
    setMainImage(nextImg);
    setOtherImages(galleryImages.filter((_, i) => i !== nextIdx));
  };

  const fuelLabel =
    car.fuelType === 'gasoline' ? 'Xăng' :
    car.fuelType === 'diesel' ? 'Dầu Diesel' :
    car.fuelType === 'electric' ? 'Điện' :
    car.fuelType === 'hybrid' ? 'Hybrid' : car.fuelType;

  const consumptionLabel = car.fuelType === 'electric'
    ? `${car.fuelConsumption} kWh`
    : `${car.fuelConsumption} L/100km`;

  const amenityKeys = Array.isArray(car.amenities) && car.amenities.length > 0
    ? car.amenities.map(a => (typeof a === 'string' ? a : a?.key)).filter(Boolean)
    : DEFAULT_AMENITIES;

  const amenities = amenityKeys
    .map(key => {
      const entry = AMENITY_CATALOG[key];
      if (entry) return { key, label: entry.label, icon: entry.icon };
      return { key, label: String(key), icon: <FaCheckCircle /> };
    });

  // Tính số ngày & chi phí
  const startDate = dateRange[0].startDate;
  const endDate = dateRange[0].endDate;
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  const pricePerDay = contract?.pricePerDay || 0;
  const depositAmount = contract?.deposit || 0;
  const rentalTotal = pricePerDay * totalDays;
  const insurancePerDay = Math.round(pricePerDay * 0.1);
  const insuranceTotal = insurancePerDay * totalDays;
  const grandTotal = rentalTotal + insuranceTotal + depositAmount;

  const formatVND = (n) => (n || 0).toLocaleString('vi-VN');

  return (
    <div className="car-detail-page">
      <div className="row car-detail-main container-fluid">
        <div className="col-12 col-md-7 car-detail-images">

          {/* ===== GALLERY ===== */}
          <div className="gallery-card">
            <div className="car-detail-main-image">
              <img
                src={mainImage}
                alt="car"
                onDoubleClick={handleMainImageDoubleClick}
                style={{ cursor: 'pointer' }}
              />
              {galleryImages.length > 1 && (
                <>
                  <button className="gallery-nav left" onClick={() => handleGalleryStep(-1)} aria-label="Previous image">
                    <FaChevronLeft />
                  </button>
                  <button className="gallery-nav right" onClick={() => handleGalleryStep(1)} aria-label="Next image">
                    <FaChevronRight />
                  </button>
                </>
              )}
              <div className="gallery-hint">Nhấp đúp để xem chi tiết</div>
            </div>
            {otherImages && otherImages.length > 0 && (
              <div className="car-detail-thumbnails">
                {otherImages.slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`car-thumb-${idx + 1}`}
                    onClick={() => handleThumbnailClick(img, idx)}
                    onDoubleClick={() => handleThumbnailDoubleClick(img)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ===== THÔNG SỐ CHI TIẾT ===== */}
          <div className="section-card">
            <h3 className="section-title">Thông số chi tiết</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-icon"><FaChair /></span>
                <div className="spec-meta">
                  <span className="spec-label">Số chỗ</span>
                  <span className="spec-value">{car.seats} chỗ</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon">
                  {car.transmission === 'manual' ? <GiGearStickPattern /> : <TbAutomaticGearboxFilled />}
                </span>
                <div className="spec-meta">
                  <span className="spec-label">Hộp số</span>
                  <span className="spec-value">{car.transmission === 'manual' ? 'Số sàn' : 'Số tự động'}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon">
                  {car.fuelType === 'electric' ? <BsEvStationFill /> :
                    car.fuelType === 'diesel' ? <BsFillFuelPumpDieselFill /> : <FaGasPump />}
                </span>
                <div className="spec-meta">
                  <span className="spec-label">Nhiên liệu</span>
                  <span className="spec-value">{fuelLabel}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon"><FaRoad /></span>
                <div className="spec-meta">
                  <span className="spec-label">Mức tiêu thụ</span>
                  <span className="spec-value">{consumptionLabel}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon"><FaCalendarAlt /></span>
                <div className="spec-meta">
                  <span className="spec-label">Năm sản xuất</span>
                  <span className="spec-value">{car.year}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon"><FaIdCard /></span>
                <div className="spec-meta">
                  <span className="spec-label">Biển số xe</span>
                  <span className="spec-value spec-plate">{car.licensePlate}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon"><FaMapMarkerAlt /></span>
                <div className="spec-meta">
                  <span className="spec-label">Khu vực</span>
                  <span className="spec-value">{car.location}</span>
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-icon"><FaCogs /></span>
                <div className="spec-meta">
                  <span className="spec-label">Dòng xe</span>
                  <span className="spec-value">{car.type || 'Đang cập nhật'}</span>
                </div>
              </div>
            </div>
            {car.description && (
              <div className="spec-desc">
                <span className="spec-icon"><FaInfoCircle /></span>
                <p>{car.description}</p>
              </div>
            )}
          </div>

          {/* ===== TIỆN NGHI ===== */}
          <div className="section-card">
            <h3 className="section-title">Tiện nghi trên xe</h3>
            <div className="amenities-grid">
              {amenities.map(item => (
                <span className="amenity-tag" key={item.key}>
                  <span className="amenity-icon">{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* ===== QUY ĐỊNH & ĐIỀU KHOẢN ===== */}
          <div className="section-card">
            <h3 className="section-title">Quy định &amp; Điều khoản thuê xe</h3>
            <div className="terms-grid">
              <div className="term-card">
                <div className="term-head">
                  <FaIdCard />
                  <h4>Giấy tờ cần thiết</h4>
                </div>
                <ul>
                  <li>CCCD/CMND hoặc Hộ chiếu còn hiệu lực.</li>
                  <li>Giấy phép lái xe hạng B2 trở lên, còn hiệu lực.</li>
                  <li>Bằng lái phải được xác minh trên hệ thống Drivon.</li>
                </ul>
              </div>
              <div className="term-card">
                <div className="term-head">
                  <FaFileContract />
                  <h4>Điều kiện lái xe</h4>
                </div>
                <ul>
                  <li>Người thuê phải từ 21 tuổi trở lên.</li>
                  <li>Chỉ sử dụng xe cho mục đích cá nhân, không vận chuyển hàng hóa hay cho thuê lại.</li>
                  <li>Không sử dụng xe vào mục đích trái pháp luật.</li>
                  <li>Tự chịu trách nhiệm bảo quản và đền bù hư hỏng do lỗi cá nhân.</li>
                </ul>
              </div>
              <div className="term-card">
                <div className="term-head">
                  <FaBan />
                  <h4>Chính sách hủy xe</h4>
                </div>
                <ul>
                  <li>Hủy trước 24h nhận xe: hoàn 100% tiền cọc.</li>
                  <li>Hủy trong vòng 24h: phí hủy 30% giá trị đơn thuê.</li>
                  <li>Trả xe muộn so với hợp đồng sẽ phát sinh phụ phí.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ===== ĐÁNH GIÁ & BÌNH LUẬN ===== */}
          <div className="car-reviews">
            <h1>Đánh giá từ khách thuê</h1>

            {/* Review overview */}
            <div className="reviews-overview">
              <div className="overview-left">
                <div className="average-rating">
                  <div className="rating-number">{reviewsData.averageRating}/5</div>
                  <div className="rating-stars">
                    <Rate disabled allowHalf value={reviewsData.averageRating} />
                  </div>
                  <div className="total-reviews">{reviewsData.totalReviews} đánh giá</div>
                </div>
              </div>

              <div className="overview-right">
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="rating-bar-item">
                      <span className="star-label">{star} sao</span>
                      <div className="rating-bar">
                        <div
                          className="rating-bar-fill"
                          style={{
                            width: `${reviewsData.totalReviews > 0 ? (reviewsData.ratingCounts[star] / reviewsData.totalReviews) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="star-count">{reviewsData.ratingCounts[star] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            {/* Featured reviews list */}
            <div className="reviews-list">
              {reviewsLoading ? (
                <p className="muted-text">Đang tải đánh giá...</p>
              ) : topHighlightReviews.length === 0 ? (
                <div className="no-reviews">
                  <p>Chưa có đánh giá nổi bật.</p>
                </div>
              ) : (
                topHighlightReviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <Avatar src={review.userAvatar} size={40} />
                        <div className="reviewer-details">
                          <div className="reviewer-name-date">
                            <span className="reviewer-name">{review.userName}</span>
                            <span className="review-date">{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="review-rating">
                        <Rate disabled defaultValue={review.rating} />
                      </div>
                    </div>
                    <div className="review-content">
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* View more reviews button */}
            <div className="reviews-footer">
              <Button type="primary" size="large" onClick={handleShowAllReviews} disabled={reviewsLoading}>
                Xem tất cả đánh giá ({reviewsData.totalReviews})
              </Button>
            </div>
          </div>

          {/* ===== XE TƯƠNG TỰ ===== */}
          <div className="same-car">
            <div className="same-car-filter">
              <button onClick={() => setCarFilter('all')} className={carFilter === 'all' ? 'active' : ''}>Tất cả</button>
              <button onClick={() => setCarFilter('brand')} className={carFilter === 'brand' ? 'active' : ''}>Cùng hãng</button>
              <button onClick={() => setCarFilter('type')} className={carFilter === 'type' ? 'active' : ''}>Cùng dòng</button>
            </div>
            <div className="same-car-slider-wrapper">
              {filteredCars.length > carsPerPage && (
                <button className="same-car-arrow left" onClick={handlePrev} disabled={currentIndex === 0}>&lt;</button>
              )}
              <div className="same-car-list slide" style={{ transform: `translateX(${translateX}px)` }}>
                {filteredCars.length === 0 && <div className="muted-text">Không có xe tương tự</div>}
                {filteredCars.map(item => (
                  <div className="same-car-card" key={item.licensePlate} onClick={() => handleSelectCar(item)} style={{ cursor: 'pointer' }}>
                    <div className="same-car-image-wrapper">
                      <img src={item.mainImage} alt={item.model} className="same-car-image" />
                      <div className="same-car-info-overlay">
                        <div className="same-car-title">{item.brand} {item.model}</div>
                        <div className="same-car-specs">
                          <span>{item.seats} chỗ</span>
                          <span className="spec-sep">|</span>
                          <span>
                            {item.transmission === 'manual' ? <GiGearStickPattern className="same-car-icon" /> : <TbAutomaticGearboxFilled className="same-car-icon" />}
                          </span>
                          <span className="spec-sep">|</span>
                          <span>
                            {item.fuelType === 'gasoline' || item.fuelType === 'hybrid' ? <FaGasPump className="same-car-icon" /> :
                              item.fuelType === 'diesel' ? <BsFillFuelPumpDieselFill className="same-car-icon" /> :
                              item.fuelType === 'electric' ? <BsEvStationFill className="same-car-icon" /> : null}
                          </span>
                          <span className="spec-sep">|</span>
                          <span>
                            {item.fuelType === 'electric' ? ` ${item.fuelConsumption}kWh` : ` ${item.fuelConsumption}L`}
                          </span>
                        </div>
                        <div className="same-car-specs">
                          <span className="same-car-price">
                            {carContracts[item.licensePlate]?.pricePerDay
                              ? `${carContracts[item.licensePlate].pricePerDay.toLocaleString()} VND/ngày`
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredCars.length > carsPerPage && (
                <button className="same-car-arrow right" onClick={handleNext} disabled={currentIndex >= maxIndex}>&gt;</button>
              )}
            </div>
          </div>
        </div>

        {/* ===== STICKY BOOKING SIDEBAR ===== */}
        <div className="col-12 col-md-4 car-detail-info">
          <div className="booking-card">
            <div className="booking-header">
              <h2>{car.brand} {car.model}</h2>
              <div className="booking-rating">
                <FaStar className="star-icon" />
                <span>{reviewsData.averageRating || '—'}</span>
                <span className="muted-text">({reviewsData.totalReviews} đánh giá)</span>
              </div>
            </div>

            <div className="booking-price">
              <span className="price-amount">{pricePerDay ? formatVND(pricePerDay) : '—'}</span>
              <span className="price-unit">VND/ngày</span>
            </div>

            {/* Chọn ngày nhận - trả xe */}
            <div className="booking-dates" ref={calendarRef}>
              <div className="date-display" onClick={() => setShowCalendar(v => !v)}>
                <div className="date-field">
                  <span className="date-label">Nhận xe</span>
                  <span className="date-value">{startDate.toLocaleDateString('vi-VN')}</span>
                </div>
                <span className="date-divider">→</span>
                <div className="date-field">
                  <span className="date-label">Trả xe</span>
                  <span className="date-value">{endDate.toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              {showCalendar && (
                <div className="calendar-popover">
                  <DateRange
                    editableDateInputs={true}
                    onChange={item => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    minDate={new Date()}
                    months={1}
                    direction="horizontal"
                  />
                </div>
              )}
            </div>

            {/* Bảng tính chi phí */}
            <div className="booking-summary">
              <div className="summary-row">
                <span>Đơn giá</span>
                <span>{formatVND(pricePerDay)} VND × {totalDays} ngày</span>
              </div>
              <div className="summary-row">
                <span>Tiền thuê xe</span>
                <span>{formatVND(rentalTotal)} VND</span>
              </div>
              <div className="summary-row">
                <span>Bảo hiểm ({formatVND(insurancePerDay)}/ngày)</span>
                <span>{formatVND(insuranceTotal)} VND</span>
              </div>
              <div className="summary-row">
                <span>Tiền cọc (hoàn lại)</span>
                <span>{formatVND(depositAmount)} VND</span>
              </div>
              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span>{formatVND(grandTotal)} VND</span>
              </div>
            </div>

            {/* Thông tin chủ xe */}
            {ownerInfo && (
              <div className="owner-card">
                <img className="owner-avatar" src={ownerAvatar} alt={ownerInfo.fullName} />
                <div className="owner-meta">
                  <span className="owner-name">{ownerInfo.fullName}</span>
                  <span className="owner-sub">
                    <FaStar className="star-icon" /> {reviewsData.averageRating || '—'} · Chủ xe
                  </span>
                </div>
                <div className="owner-actions">
                  <a
                    className="btn-call"
                    href={ownerInfo.phone ? `tel:${ownerInfo.phone}` : undefined}
                    title="Gọi chủ xe"
                  >
                    <FaPhoneAlt />
                  </a>
                  <button className="btn-message" onClick={handleContactOwner} title="Nhắn tin">
                    <FaCommentDots />
                  </button>
                </div>
              </div>
            )}

            <button className="btn-rent-car" onClick={handleRentClick}>Đặt xe ngay</button>
            <button className="btn-contact-owner" onClick={handleContactOwner}>Liên hệ chủ xe</button>

            <div className="booking-benefits">
              <span><FaCheckCircle /> Nhận xe nhanh chóng</span>
              <span><FaCheckCircle /> Thanh toán an toàn</span>
              <span><FaCheckCircle /> Thủ tục đơn giản</span>
              <span><FaCheckCircle /> Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {showRentalForm && (
        <RentalForm
          visible={showRentalForm}
          onClose={() => setShowRentalForm(false)}
          car={car}
          user={JSON.parse(localStorage.getItem('user'))}
          dateRange={dateRange}
          contract={contract}
          onSuccess={handleRentalSuccess}
        />
      )}

      <Modal
        title={<h2 className="modal-title-center">Đánh giá từ khách thuê</h2>}
        open={showAllReviewsModal}
        onCancel={handleCloseAllReviews}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        <div className="reviews-filter">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${allReviewsFilter === 0 ? 'active' : ''}`}
              onClick={() => { setAllReviewsFilter(0); setCurrentPage(1); }}
            >
              Tất cả ({reviewsData.totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map(star => (
              <button
                key={star}
                className={`filter-btn ${allReviewsFilter === star ? 'active' : ''}`}
                onClick={() => { setAllReviewsFilter(star); setCurrentPage(1); }}
              >
                {star} sao ({reviewsData.ratingCounts[star] || 0})
              </button>
            ))}
          </div>
        </div>

        <div className="reviews-list">
          {currentReviews.length === 0 ? (
            <div className="no-reviews">
              <p>Không có đánh giá cho {allReviewsFilter > 0 ? `${allReviewsFilter} sao` : 'bộ lọc này'}</p>
            </div>
          ) : (
            currentReviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <Avatar src={review.userAvatar} size={40} />
                    <div className="reviewer-details">
                      <div className="reviewer-name-date">
                        <span className="reviewer-name">{review.userName}</span>
                        <span className="review-date">{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    <Rate disabled defaultValue={review.rating} />
                  </div>
                </div>
                <div className="review-content">
                  <p className="review-comment">{review.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          current={currentPage}
          pageSize={reviewsPerPage}
          total={allReviewsFiltered.length}
          onChange={(page) => setCurrentPage(page)}
          style={{ textAlign: 'center', marginTop: '2rem' }}
          showSizeChanger={false}
        />
      </Modal>

      <Modal
        title={<h2 className="modal-title-center">Xem ảnh xe</h2>}
        open={showImageModal}
        onCancel={handleCloseImageModal}
        footer={null}
        width={900}
        centered
        destroyOnClose
        style={{ top: 20 }}
      >
        <div
          className="image-modal-content"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{ cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
        >
          <div
            className="panning-container"
            style={{ transform: `translate(${translate.x}px, ${translate.y}px)` }}
          >
            <img
              src={selectedImage}
              alt="Selected car image"
              style={{
                width: '100%',
                transform: `scale(${zoomLevel})`,
                transition: isPanning ? 'none' : 'transform 0.1s linear',
              }}
            />
          </div>
        </div>
        <div className="zoom-controls">
          <span className="zoom-label">Zoom</span>
          <Button onClick={handleZoomOut} disabled={zoomLevel <= 1} size="small">-</Button>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoomLevel}
            onChange={setZoomLevel}
            style={{ flex: 1, margin: '0 15px' }}
          />
          <Button onClick={handleZoomIn} disabled={zoomLevel >= 3} size="small">+</Button>
        </div>
      </Modal>

      <Modal
        open={showLicenseModal}
        onCancel={() => setShowLicenseModal(false)}
        footer={null}
        centered
        destroyOnClose
        closable={false}
        className="license-warning-modal"
        maskStyle={{ background: 'rgba(0,0,0,0.7)' }}
      >
        <div className="license-modal-body">
          <button
            className="license-modal-close-btn"
            onClick={() => setShowLicenseModal(false)}
            aria-label="Close"
          >
            ×
          </button>
          <FaExclamationCircle size={64} className="license-warn-icon" />
          {licenseStatus === 'none' && (
            <>
              <div className="license-modal-text">
                Bạn cần <span className="strong">tải lên giấy phép lái xe</span> trước khi có thể thuê xe.
              </div>
              <button
                className="license-modal-upload-btn"
                onClick={() => { setShowLicenseModal(false); navigate('/profile'); }}
              >
                Tải lên giấy phép
              </button>
            </>
          )}
          {licenseStatus === 'pending' && (
            <div className="license-modal-text">
              Giấy phép lái xe của bạn đang <span className="strong">chờ xác minh</span>.<br />
              Vui lòng chờ quản trị viên phê duyệt trước khi thuê xe.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ViewCarDetail;