import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Rate, Input, Result } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/MyRentals.css";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import {
  FiInfo,
  FiCreditCard,
  FiRepeat,
  FiXOctagon,
  FiStar,
  FiCalendar,
  FiMapPin,
  FiFileText,
  FiAlertCircle,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { API_URL } from '../../api/configApi';
import { showSuccessToast, showErrorToast } from '../notification/notification';

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "ongoing", label: "Đang thuê" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã huỷ" },
];

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [ratingRental, setRatingRental] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverValue, setHoverValue] = useState(undefined);
  const [reviewedRentals, setReviewedRentals] = useState([]);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [carsInfo, setCarsInfo] = useState({});
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState(null);
  const [isSwitchModalVisible, setIsSwitchModalVisible] = useState(false);
  const [rentalToSwitch, setRentalToSwitch] = useState(null);
  const [isSwitchToBankModalVisible, setIsSwitchToBankModalVisible] = useState(false);
  const [rentalToSwitchToBank, setRentalToSwitchToBank] = useState(null);
  // State cho modal hủy đặt xe
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [rentalToCancel, setRentalToCancel] = useState(null);
  const [refundBankAccount, setRefundBankAccount] = useState("");
  const [refundBankName, setRefundBankName] = useState("");

  // TAB + PHÂN TRANG
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rentalsPerPage = 6;

  const getBookingStatus = (rental) =>
    (rental.bookingStatus || rental.booking_status || rental.booking_status_text || "").toLowerCase();

  const matchesTab = (rental, tab) => {
    if (tab === "all") return true;
    const bookingStatus = getBookingStatus(rental);
    const paymentStatus = (rental.status || "").toLowerCase();
    switch (tab) {
      case "pending":
        return bookingStatus === "pending" || (!bookingStatus && paymentStatus === "pending");
      case "ongoing":
        return bookingStatus === "ongoing";
      case "completed":
        return bookingStatus === "completed";
      case "cancelled":
        return bookingStatus === "cancelled" || bookingStatus === "cancel_requested";
      default:
        return true;
    }
  };

  const filteredRentals = rentals.filter((rental) => matchesTab(rental, activeTab));
  const totalPages = Math.ceil(filteredRentals.length / rentalsPerPage);
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * rentalsPerPage,
    currentPage * rentalsPerPage
  );

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.key] = rentals.filter((rental) => matchesTab(rental, tab.key)).length;
    return acc;
  }, {});

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tooltips = ["Very Bad", "Bad", "Average", "Good", "Very Good"];

  const customIcons = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      showErrorToast("Please log in to view rental history");
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchRentalsWithCleanup(userData.userId);

    // Fetch danh sách các booking đã review từ backend
    axios.get(`${API_URL}/reviews/user/${userData.userId}`)
      .then(res => {
        // Giả sử mỗi review có bookingId
        const reviewedBookingIds = res.data.map(r => r.bookingId);
        setReviewedRentals(reviewedBookingIds);
      })
      .catch(() => setReviewedRentals([]));
  }, [navigate]);

  const fetchRentals = async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/payments/user/${userId}`
      );
      const payments = response.data;

      // Lấy status booking cho từng payment
      const paymentsWithBookingStatus = await Promise.all(
        payments.map(async (payment) => {
          if (!payment.bookingId) return payment;
          try {
            const bookingRes = await axios.get(`${API_URL}/bookings/${payment.bookingId}`);
            console.log('Booking API trả về cho bookingId', payment.bookingId, ':', bookingRes.data);
            return { ...payment, bookingStatus: bookingRes.data.status };
          } catch (err) {
            return { ...payment, bookingStatus: "Unknown" };
          }
        })
      );

      // Lọc bỏ đơn không có thời gian thuê/trả
      const filteredRentalsData = paymentsWithBookingStatus.filter(rental => {
        // Ẩn đơn không có thời gian thuê hoặc thời gian trả
        const hasRentalDates = rental.rentalStartDate && rental.rentalEndDate;
        // Debug log để kiểm tra dữ liệu
        if (!hasRentalDates) {
          console.log('Filtered out rental due to missing dates:', rental);
        }
        return hasRentalDates;
      });

      setRentals(filteredRentalsData);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      showErrorToast("Unable to load rental history");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup function gọi sau fetchRentals để dọn dẹp dữ liệu cũ
  const fetchRentalsWithCleanup = async (userId) => {
    await fetchRentals(userId);
    await cleanupInvalidPayments();
  };

  // Fetch car info for all rentals
  useEffect(() => {
    if (rentals.length > 0) {
      const carIds = rentals.map(r => r.carId).filter(Boolean);
      const uniqueCarIds = [...new Set(carIds)];
      uniqueCarIds.forEach(carId => {
        if (!carsInfo[carId]) {
          axios.get(`${API_URL}/cars/${carId}`)
            .then(res => {
              setCarsInfo(prev => ({ ...prev, [carId]: res.data }));
            })
            .catch(() => {});
        }
      });
    }
    // eslint-disable-next-line
  }, [rentals]);

  const getStatusTone = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "ok";
      case "PENDING":
        return "warn";
      case "REFUNDED":
        return "danger";
      case "CANCELLED":
        return "muted";
      default:
        return "muted";
    }
  };

  const getBookingStatusTone = (bookingStatus) => {
    switch (bookingStatus?.toLowerCase()) {
      case "pending":
        return "muted";
      case "approved":
        return "info";
      case "cancelled":
        return "danger";
      case "ongoing":
        return "warn";
      case "completed":
        return "ok";
      case "cancel_requested":
        return "warn";
      default:
        return "muted";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (amount) =>
    amount != null ? `${Number(amount).toLocaleString("vi-VN")} VND` : "N/A";

  const handleViewDetails = (rental) => {
    setSelectedRental(rental);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRental(null);
  };

  const handleRateCar = (rental) => {
    setRatingRental(rental);
    setIsRatingModalVisible(true);
  };

  const handleRatingModalClose = () => {
    setIsRatingModalVisible(false);
    setRatingRental(null);
    setRating(0);
    setComment("");
    setIsReviewSubmitted(false);
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      showErrorToast("Please select a star rating.");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/reviews/car/${ratingRental.carId}`, //rate car
        {
          rating: rating,
          comment: comment,
        },
        {
          params: {
            bookingId: ratingRental.bookingId,
            reviewerId: user.userId,
          },
        }
      );
      showSuccessToast("Review saved successfully!");
      setIsReviewSubmitted(true);
      setReviewedRentals((prev) => [...prev, ratingRental.bookingId]);
      setTimeout(() => {
        handleRatingModalClose();
      }, 2000);
    } catch (error) {
      showErrorToast("Failed to submit review. Please try again!");
    }
  };

  const handlePayment = (rental) => {
    const bankPaymentRequest = {
      orderCode: Date.now(),
      amount: rental.amount,
      description: `Payment: ${rental.orderCode.toString().slice(-8)}`, // Shortened and no accents
      returnUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/my-rentals?cancel=true`,
      userId: user.userId,
      carId: rental.carId,
      bookingId: rental.bookingId,
    };

    axios.post(`${API_URL}/payments/create`, bankPaymentRequest)
      .then(response => {
        if (response.data.data && response.data.data.checkoutUrl) {
          window.location.href = response.data.data.checkoutUrl;
        } else {
          showErrorToast('Unable to redirect to payment page. Please try again.');
        }
      })
      .catch(() => {
        showErrorToast('An error occurred while creating payment link.');
      });
  };

  const handleDeleteRental = (rental) => {
    setRentalToDelete(rental);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!rentalToDelete) return;

    try {
      console.log('User confirmed deletion, proceeding...');
      const paymentId = rentalToDelete.paymentId || rentalToDelete.id || rentalToDelete.payment_id;
      console.log('Payment ID:', paymentId);
      console.log('Booking ID:', rentalToDelete.bookingId);

      if (!paymentId && !rentalToDelete.bookingId) {
        showErrorToast('Unable to find ID to delete.');
        return;
      }

      // Try booking endpoint first since we just added it
      if (rentalToDelete.bookingId) {
        console.log('Trying to delete booking:', rentalToDelete.bookingId);
        const response = await axios.delete(`${API_URL}/bookings/${rentalToDelete.bookingId}`);
        console.log('Delete booking response:', response);
        showSuccessToast('Car booking deleted successfully!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseDeleteModal();
        return;
      }

      // Try payment endpoint as fallback
      if (paymentId) {
        console.log('Trying to delete payment:', paymentId);
        const response = await axios.delete(`${API_URL}/payments/${paymentId}`);
        console.log('Delete payment response:', response);
        showSuccessToast('Payment deleted successfully!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseDeleteModal();
        return;
      }

    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error details:', error.response?.data);
      showErrorToast(`Unable to delete: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setRentalToDelete(null);
  };

  const handleSwitchToBank = (rental) => {
    setRentalToSwitchToBank(rental);
    setIsSwitchToBankModalVisible(true);
  };

  const handleConfirmSwitchToBank = async () => {
    if (!rentalToSwitchToBank) return;

    try {
      console.log('User confirmed switch to bank');
      console.log('Updating payment method for payment:', rentalToSwitchToBank.paymentId);

      // Chỉ update payment method và status, không tạo paymentId mới
      const updateRequest = {
        paymentMethod: 'bank',
        status: 'PENDING' // Bank cần thanh toán sau
      };

      console.log('Update payment request:', updateRequest);

      const response = await axios.put(`${API_URL}/payments/update/${rentalToSwitchToBank.paymentId}`, updateRequest);
      console.log('Update payment response:', response.data);

      if (response.data || response.status === 200) {
        showSuccessToast('Successfully switched to bank payment! You can pay later.');
        fetchRentalsWithCleanup(user.userId);
        handleCloseSwitchToBankModal();
      } else {
        console.error('No response data received');
        showErrorToast('Unable to change payment method.');
      }
    } catch (error) {
      console.error('Error switching to bank:', error);
      console.error('Error details:', error.response?.data);
      showErrorToast(`An error occurred: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseSwitchToBankModal = () => {
    setIsSwitchToBankModalVisible(false);
    setRentalToSwitchToBank(null);
  };

  const cleanupInvalidPayments = async () => {
    try {
      console.log('Starting cleanup of invalid payments...');
      const response = await axios.get(`${API_URL}/payments/user/${user.userId}`);
      const payments = response.data;

      // Tìm các payments không có ngày thuê/trả
      const invalidPayments = payments.filter(payment => {
        const hasInvalidDates = !payment.rentalStartDate || !payment.rentalEndDate;
        if (hasInvalidDates) {
          console.log('Found invalid payment:', payment.paymentId || payment.orderCode, payment);
        }
        return hasInvalidDates;
      });

      // Xóa từng payment invalid
      for (const payment of invalidPayments) {
        try {
          const paymentId = payment.paymentId || payment.id;
          if (paymentId) {
            console.log('Deleting invalid payment:', paymentId);
            await axios.delete(`${API_URL}/payments/${paymentId}`);
          } else if (payment.orderCode) {
            console.log('Cancelling invalid payment by orderCode:', payment.orderCode);
            await axios.post(`${API_URL}/payments/cancel`, {
              orderCode: payment.orderCode
            });
          }
        } catch (deleteError) {
          console.warn('Could not delete invalid payment:', payment, deleteError);
        }
      }

      if (invalidPayments.length > 0) {
        console.log(`Cleaned up ${invalidPayments.length} invalid payments`);
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  };

  const handleSwitchToCash = (rental) => {
    setRentalToSwitch(rental);
    setIsSwitchModalVisible(true);
  };

  const handleConfirmSwitch = async () => {
    if (!rentalToSwitch) return;

    try {
      console.log('User confirmed switch to cash');
      console.log('Updating payment method for payment:', rentalToSwitch.paymentId);

      // Chỉ update payment method và status, không tạo paymentId mới
      const updateRequest = {
        paymentMethod: 'cash',
        status: 'PAID' // Cash được coi như đã thanh toán
      };

      console.log('Update payment request:', updateRequest);

      const response = await axios.put(`${API_URL}/payments/update/${rentalToSwitch.paymentId}`, updateRequest);
      console.log('Update payment response:', response.data);

      if (response.data || response.status === 200) {
        showSuccessToast('Successfully switched to cash payment!');
        fetchRentalsWithCleanup(user.userId);
        handleCloseSwitchModal();
      } else {
        console.error('No response data received');
        showErrorToast('Unable to change payment method.');
      }
    } catch (error) {
      console.error('Error switching to cash:', error);
      console.error('Error details:', error.response?.data);
      showErrorToast(`An error occurred: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCloseSwitchModal = () => {
    setIsSwitchModalVisible(false);
    setRentalToSwitch(null);
  };

  const handleCancelBooking = (rental) => {
    setRentalToCancel(rental);
    setIsCancelModalVisible(true);
  };

  const handleConfirmCancelBooking = async () => {
    if (!rentalToCancel || !rentalToCancel.bookingId) {
      showErrorToast('Could not find booking to cancel.');
      return;
    }

    try {
      let refundCreated = false;
      // 1. Logic xử lý hoàn tiền (nếu có)
      if (rentalToCancel.paymentMethod?.toLowerCase() === "bank" && rentalToCancel.status?.toUpperCase() === "PAID") {
        if (!refundBankAccount || !refundBankName) {
          showErrorToast("Please enter full bank account number and bank name for refund.");
          return;
        }
        let refundAmount = rentalToCancel.amount;
        if (["ongoing"].includes(rentalToCancel.bookingStatus?.toLowerCase())) {
          refundAmount = Math.round(refundAmount * 0.95);
        }
        await axios.post(`${API_URL}/owner-withdraw`, {
          ownerId: rentalToCancel.userId,
          amount: refundAmount,
          status: "pending",
          note: `STK: ${refundBankAccount}, Ngân hàng: ${refundBankName}`,
        });
        refundCreated = true;
      }

      // 2. Gửi yêu cầu hủy đặt xe đến API (Yêu cầu này vẫn được gửi đi bình thường)
      const response = await axios.post(`${API_URL}/bookings/${rentalToCancel.bookingId}/request-cancel?renterId=${user.userId}`);

      // 3. Cập nhật giao diện ngay lập tức và giữ nguyên trạng thái này
      if (response.data && response.data.status && response.data.status.toLowerCase() === 'cancelled') {
        // Hủy ngay lập tức (pending)
        setRentals(prevRentals =>
          prevRentals.map(r =>
            r.bookingId === rentalToCancel.bookingId
              ? { ...r, bookingStatus: "cancelled", status: "cancelled" }
              : r
          )
        );
        // Fetch lại rentals từ backend để đồng bộ UI
        fetchRentalsWithCleanup(user.userId);
      } else {
        // Có CancelRequest (ongoing)
        setRentals(prevRentals =>
          prevRentals.map(r =>
            r.bookingId === rentalToCancel.bookingId
              ? { ...r, bookingStatus: "CANCEL_REQUESTED" }
              : r
          )
        );
      }
      // Hiển thị thông báo thành công
      if (refundCreated) {
        showSuccessToast('Refund request and cancellation request sent successfully!');
      } else {
        showSuccessToast('Cancellation request sent successfully!');
      }
      // Đóng modal
      handleCloseCancelModal();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      showErrorToast("Unable to cancel booking.");
    }
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalVisible(false);
    setRentalToCancel(null);
    setRefundBankAccount("");
    setRefundBankName("");
  };

  const renderRentalCard = (rental) => {
    // A user can rate a car if the booking is completed and chưa đánh giá
    const bookingStatus = rental.bookingStatus || rental.booking_status || rental.booking_status_text;
    const canRate = bookingStatus?.toLowerCase() === "completed" && !reviewedRentals.includes(rental.bookingId);
    const isPending = rental.status?.toUpperCase() === "PENDING";
    const isCash = rental.paymentMethod?.toLowerCase() === "cash";
    const isBank = rental.paymentMethod?.toLowerCase() === "bank";
    const car = carsInfo[rental.carId];
    const isCancelled = bookingStatus?.toLowerCase() === "cancelled";
    const carImage =
      car?.image ||
      car?.imageUrl ||
      (Array.isArray(car?.images) ? car.images[0] : null);

    return (
      <article className="mr-card" key={rental.paymentId}>
        <div className="mr-card-media">
          {carImage ? (
            <img className="mr-card-img" src={carImage} alt={rental.carId} />
          ) : (
            <div className="mr-card-media-fallback">
              <FiMapPin />
            </div>
          )}
          <span className="mr-card-plate">{rental.carId}</span>
          <div className="mr-card-badges">
            <span className={`mr-badge mr-badge--${getStatusTone(rental.status)}`}>
              {`Thanh toán: ${rental.status || "N/A"}`}
            </span>
            {bookingStatus && (
              <span className={`mr-badge mr-badge--${getBookingStatusTone(bookingStatus)}`}>
                {`Đặt xe: ${bookingStatus}`}
              </span>
            )}
          </div>
        </div>

        <div className="mr-card-body">
          <div>
            <h3 className="mr-card-name">
              {car ? `${car.brand} ${car.model} ${car.year || ""}`.trim() : "Xe đã thuê"}
            </h3>
            <p className="mr-card-order">Mã đơn: #{rental.orderCode}</p>
          </div>

          <div className="mr-meta">
            <div className="mr-meta-row">
              <FiCalendar />
              <div>
                <span className="mr-meta-label">Thời gian thuê</span>
                <div className="mr-time-range">
                  <span className="mr-meta-value">
                    {formatDate(rental.rentalStartDate).replace('at ', '')}
                  </span>
                  <span className="mr-time-arrow">→</span>
                  <span className="mr-meta-value">
                    {formatDate(rental.rentalEndDate).replace('at ', '')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mr-meta-row">
              <FiCreditCard />
              <div>
                <span className="mr-meta-label">Phương thức thanh toán</span>
                <span className="mr-meta-value">{rental.paymentMethod || "N/A"}</span>
              </div>
            </div>

            <div className="mr-meta-row">
              <FiMapPin />
              <div>
                <span className="mr-meta-label">Yêu cầu đặc biệt</span>
                <span className="mr-meta-value--muted">
                  {rental.additionalRequirements || "Không có"}
                </span>
                <span className="mr-meta-value--muted">
                  {` · Voucher ${rental.discountPercent || "0"}%`}
                </span>
              </div>
            </div>
          </div>

          {bookingStatus?.toLowerCase() === 'cancel_requested' && (
            <div className="mr-note">
              <FiAlertCircle />
              <span>
                Yêu cầu huỷ đã được gửi và đang chờ chủ xe phê duyệt.
              </span>
            </div>
          )}

          <div className="mr-card-foot">
            <div>
              <span className="mr-total-label">Tổng tiền</span>
              <div className="mr-total-value">{formatMoney(rental.amount)}</div>
            </div>

            <div className="mr-actions">
              <button
                type="button"
                className="mr-btn mr-btn--primary"
                onClick={() => handleViewDetails(rental)}
              >
                <FiInfo />
                Xem chi tiết
              </button>

              <button
                type="button"
                className="mr-btn mr-btn--ghost"
                onClick={() => navigate("/contracts")}
                title="Hợp đồng thuê xe"
              >
                <FiFileText />
                Hợp đồng
              </button>

              {!isCancelled && isPending && (
                <>
                  <button
                    type="button"
                    className="mr-btn mr-btn--icon mr-btn--success"
                    title="Thanh toán"
                    onClick={() => handlePayment(rental)}
                  >
                    <FiCreditCard />
                  </button>
                  {isBank && (
                    <button
                      type="button"
                      className="mr-btn mr-btn--icon mr-btn--warn"
                      title="Chuyển sang thanh toán tiền mặt"
                      onClick={() => handleSwitchToCash(rental)}
                    >
                      <FiRepeat />
                    </button>
                  )}
                </>
              )}

              {!isCancelled && isCash && bookingStatus?.toLowerCase() === "pending" && (
                <button
                  type="button"
                  className="mr-btn mr-btn--icon mr-btn--warn"
                  title="Chuyển sang chuyển khoản"
                  onClick={() => handleSwitchToBank(rental)}
                >
                  <FiRepeat />
                </button>
              )}

              {!isCancelled && bookingStatus?.toLowerCase() === 'pending' && (
                <button
                  type="button"
                  className="mr-btn mr-btn--icon mr-btn--danger"
                  title="Huỷ đặt xe"
                  onClick={() => handleCancelBooking(rental)}
                >
                  <FiXOctagon />
                </button>
              )}

              {!isCancelled && canRate && (
                <button
                  type="button"
                  className="mr-btn mr-btn--icon mr-btn--ghost"
                  title="Đánh giá xe"
                  onClick={() => handleRateCar(rental)}
                >
                  <FiStar />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderRentalDetails = () => {
    if (!selectedRental) return null;
    const bookingStatus = selectedRental.bookingStatus || selectedRental.booking_status || selectedRental.booking_status_text;
    return (
      <Descriptions bordered column={1} className="rental-details">
        <Descriptions.Item label="Mã đơn">
          <span className="mr-strong">{selectedRental.orderCode}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <span className={`mr-badge mr-badge--${getStatusTone(selectedRental.status)}`}>
            {selectedRental.status}
          </span>
          {bookingStatus && (
            <span
              className={`mr-badge mr-badge--${getBookingStatusTone(bookingStatus)}`}
              style={{ marginLeft: 6 }}
            >
              {bookingStatus}
            </span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Biển số">
          {selectedRental.carId}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian thuê">
          {formatDate(selectedRental.rentalStartDate)} -{" "}
          {formatDate(selectedRental.rentalEndDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {selectedRental.paymentMethod}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">
          {formatMoney(selectedRental.amount)}
        </Descriptions.Item>
        <Descriptions.Item label="Yêu cầu đặc biệt">
          {selectedRental.additionalRequirements || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {formatDate(selectedRental.paymentDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật gần nhất">
          {formatDate(selectedRental.updatedAt)}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="mr-page">
      <div className="mr-head">
        <div>
          <h1 className="mr-title">Chuyến xe của tôi</h1>
          <p className="mr-sub">
            Theo dõi toàn bộ lịch sử thuê xe, trạng thái thanh toán và hợp đồng của bạn.
          </p>
        </div>
      </div>

      <div className="mr-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`mr-tab ${activeTab === tab.key ? "mr-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="mr-tab-count">{tabCounts[tab.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mr-loading">
          <span className="mr-loader" />
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="mr-empty">
          <FiInbox />
          <p className="mr-empty-title">Chưa có chuyến xe nào</p>
          <p className="mr-empty-text">
            {activeTab === "all"
              ? "Bạn chưa có lịch sử thuê xe. Hãy khám phá các mẫu xe đang có trên Drivon."
              : "Không có chuyến xe nào ở trạng thái này."}
          </p>
        </div>
      ) : (
        <>
          <div className="mr-grid">{paginatedRentals.map(renderRentalCard)}</div>

          {totalPages > 1 && (
            <div className="mr-pagination">
              <button
                type="button"
                className="mr-page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Trang trước"
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  type="button"
                  key={i + 1}
                  className={`mr-page-btn ${currentPage === i + 1 ? "mr-page-btn--active" : ""}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="mr-page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Trang sau"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        title="Chi tiết đơn thuê"
        open={isModalVisible}
        onCancel={handleCloseModal}
        wrapClassName="mr-modal"
        footer={[
          <button key="close" type="button" className="mr-btn mr-btn--ghost" onClick={handleCloseModal}>
            Đóng
          </button>,
        ]}
        width={800}
      >
        {renderRentalDetails()}
      </Modal>

      <Modal
        title={
          isReviewSubmitted
            ? "Đánh giá đã được gửi"
            : `Đánh giá xe ${ratingRental?.carId || ""}`
        }
        open={isRatingModalVisible}
        onCancel={handleRatingModalClose}
        wrapClassName="mr-modal rating-modal"
        footer={
          isReviewSubmitted
            ? null
            : [
                <button key="back" type="button" className="mr-btn mr-btn--ghost" onClick={handleRatingModalClose}>
                  Huỷ
                </button>,
                <button
                  key="submit"
                  type="button"
                  className="mr-btn mr-btn--primary"
                  onClick={handleRatingSubmit}
                  disabled={rating === 0}
                >
                  Gửi đánh giá
                </button>,
              ]
        }
      >
        {isReviewSubmitted ? (
          <Result status="success" title="Cảm ơn bạn đã đánh giá!" />
        ) : (
          <>
            <div className="mr-modal-center">
              <p className="mr-modal-text">Bạn chấm mấy sao cho chiếc xe này?</p>
              <Rate
                tooltips={tooltips}
                onChange={setRating}
                onHoverChange={setHoverValue}
                value={rating}
                character={customIcons[hoverValue || rating]}
                style={{ fontSize: 36 }}
              />
            </div>
            <Input.TextArea
              rows={4}
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              placeholder="Chia sẻ trải nghiệm của bạn về chiếc xe này (không bắt buộc)..."
              style={{ marginTop: "24px" }}
            />
          </>
        )}
      </Modal>

      <Modal
        title="Xác nhận xoá đơn"
        open={isDeleteModalVisible}
        onCancel={handleCloseDeleteModal}
        wrapClassName="mr-modal"
        footer={[
          <button key="cancel" type="button" className="mr-btn mr-btn--ghost" onClick={handleCloseDeleteModal}>
            Huỷ
          </button>,
          <button key="delete" type="button" className="mr-btn mr-btn--danger" onClick={handleConfirmDelete}>
            Xoá
          </button>,
        ]}
        width={500}
      >
        <div className="mr-modal-center">
          <p className="mr-modal-text">Bạn có chắc muốn xoá đơn thuê này không?</p>
          {rentalToDelete && (
            <div className="mr-modal-summary">
              <span className="mr-strong">Mã đơn: #{rentalToDelete.orderCode}</span>
              <br />
              <span>Biển số: {rentalToDelete.carId}</span>
              <br />
              <span>Tổng tiền: {formatMoney(rentalToDelete.amount)}</span>
            </div>
          )}
          <p className="mr-modal-hint mr-modal-hint--danger">
            Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>

      <Modal
        title="Chuyển sang thanh toán tiền mặt"
        open={isSwitchModalVisible}
        onCancel={handleCloseSwitchModal}
        wrapClassName="mr-modal"
        footer={[
          <button key="cancel" type="button" className="mr-btn mr-btn--ghost" onClick={handleCloseSwitchModal}>
            Huỷ
          </button>,
          <button key="switch" type="button" className="mr-btn mr-btn--warn" onClick={handleConfirmSwitch}>
            Chuyển
          </button>,
        ]}
        width={500}
      >
        <div className="mr-modal-center">
          <p className="mr-modal-text">
            Bạn muốn chuyển sang thanh toán tiền mặt khi nhận xe?
          </p>
          {rentalToSwitch && (
            <div className="mr-modal-summary">
              <span className="mr-strong">Mã đơn: #{rentalToSwitch.orderCode}</span>
              <br />
              <span>Biển số: {rentalToSwitch.carId}</span>
              <br />
              <span>Tổng tiền: {formatMoney(rentalToSwitch.amount)}</span>
              <br />
              <span>
                Từ: <strong>Chuyển khoản</strong> → <strong>Tiền mặt</strong>
              </span>
            </div>
          )}
          <p className="mr-modal-hint mr-modal-hint--warn">
            Bạn sẽ thanh toán tiền mặt khi nhận xe.
          </p>
        </div>
      </Modal>

      <Modal
        title="Chuyển sang chuyển khoản"
        open={isSwitchToBankModalVisible}
        onCancel={handleCloseSwitchToBankModal}
        wrapClassName="mr-modal"
        footer={[
          <button key="cancel" type="button" className="mr-btn mr-btn--ghost" onClick={handleCloseSwitchToBankModal}>
            Huỷ
          </button>,
          <button key="switch" type="button" className="mr-btn mr-btn--primary" onClick={handleConfirmSwitchToBank}>
            Chuyển
          </button>,
        ]}
        width={500}
      >
        <div className="mr-modal-center">
          <p className="mr-modal-text">
            Bạn muốn chuyển sang thanh toán bằng chuyển khoản?
          </p>
          {rentalToSwitchToBank && (
            <div className="mr-modal-summary">
              <span className="mr-strong">Mã đơn: #{rentalToSwitchToBank.orderCode}</span>
              <br />
              <span>Biển số: {rentalToSwitchToBank.carId}</span>
              <br />
              <span>Tổng tiền: {formatMoney(rentalToSwitchToBank.amount)}</span>
              <br />
              <span>
                Từ: <strong>Tiền mặt</strong> → <strong>Chuyển khoản</strong>
              </span>
            </div>
          )}
          <p className="mr-modal-hint mr-modal-hint--info">
            Bạn cần thanh toán sớm để giữ chỗ cho đơn thuê này.
          </p>
        </div>
      </Modal>

      <Modal
        title="Xác nhận huỷ đặt xe"
        open={isCancelModalVisible}
        onCancel={handleCloseCancelModal}
        wrapClassName="mr-modal"
        footer={[
          <button key="cancel" type="button" className="mr-btn mr-btn--ghost" onClick={handleCloseCancelModal}>
            Huỷ
          </button>,
          <button
            key="confirm"
            type="button"
            className="mr-btn mr-btn--danger"
            onClick={handleConfirmCancelBooking}
            disabled={
              rentalToCancel &&
              rentalToCancel.paymentMethod?.toLowerCase() === "bank" &&
              rentalToCancel.status?.toUpperCase() === "PAID" &&
              (!refundBankAccount.trim() || !refundBankName.trim())
            }
          >
            Xác nhận huỷ
          </button>,
        ]}
        width={500}
      >
        <div className="mr-modal-center">
          {/* Display refund percentage if bank payment */}
          {rentalToCancel && rentalToCancel.paymentMethod?.toLowerCase() === "bank" && (
            <>
              <p className="mr-modal-hint mr-modal-hint--info">
                {rentalToCancel.status?.toUpperCase() === "PAID" ? (
                  rentalToCancel.bookingStatus?.toLowerCase() === "pending"
                    ? "Bạn sẽ được hoàn 100% số tiền đã thanh toán."
                    : rentalToCancel.bookingStatus?.toLowerCase() === "ongoing"
                      ? "Bạn sẽ được hoàn 95% số tiền đã thanh toán."
                      : null
                ) : (
                  "Bạn chưa thanh toán nên sẽ không có khoản hoàn tiền nào."
                )}
              </p>
              {/* Input for bank account and bank name if bank + PAID */}
              {rentalToCancel.status?.toUpperCase() === "PAID" && (
                <div style={{ marginBottom: 12 }}>
                  <Input
                    placeholder="Số tài khoản nhận hoàn tiền"
                    value={refundBankAccount}
                    onChange={e => setRefundBankAccount(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="Tên ngân hàng nhận hoàn tiền"
                    value={refundBankName}
                    onChange={e => setRefundBankName(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
          <p className="mr-modal-text">
            Bạn có chắc muốn huỷ đơn thuê này không? Hành động này không thể hoàn tác.
          </p>
          {rentalToCancel && (
            <div className="mr-modal-summary">
              <span className="mr-strong">Mã đơn: #{rentalToCancel.orderCode}</span>
              <br />
              <span>Biển số: {rentalToCancel.carId}</span>
              <br />
              <span>Tổng tiền: {formatMoney(rentalToCancel.amount)}</span>
            </div>
          )}
          <p className="mr-modal-hint mr-modal-hint--danger">
            Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default MyRentals;