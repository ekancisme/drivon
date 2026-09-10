import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./RentCar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCog,
  FaGasPump,
  FaRoad,
  FaWrench,
  FaMapMarkerAlt,
  FaChair,
  FaStar,
  FaCarSide,
  FaSearch,
  FaSlidersH,
  FaTh,
  FaList,
  FaTimes,
  FaSortAmountDown,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
  FaCheckCircle,
} from "react-icons/fa";
import NotFoundCar from "../others/notFoundCar";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useCarData } from "../../contexts/CarDataContext";
import { API_URL } from "../../api/configApi";

const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
  { value: "year-desc", label: "Năm sản xuất mới nhất" },
  { value: "rating-desc", label: "Đánh giá cao nhất" },
];

const CarCardSkeleton = () => (
  <div className="car-card skeleton" aria-hidden="true">
    <div className="sk-image" />
    <div className="car-info">
      <div className="sk-line sk-title" />
      <div className="sk-specs">
        <div className="sk-line" />
        <div className="sk-line" />
        <div className="sk-line" />
        <div className="sk-line" />
      </div>
      <div className="sk-line sk-price" />
      <div className="sk-actions">
        <div className="sk-line" />
        <div className="sk-line" />
      </div>
    </div>
  </div>
);

const RentCar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { carsData, loading, error, fetchCarsData } = useCarData();

  const [filters, setFilters] = useState({
    location: "",
    brand: "",
    type: "",
    seat: "",
    fuel: "",
    transmission: "",
    minPrice: "",
    maxPrice: "",
  });

  // Add state for price range slider
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 12;
  const [bookingStatuses, setBookingStatuses] = useState({}); // Lưu trạng thái booking cho từng xe

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const locationParam = params.get("location");
    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");

    if (locationParam || minPriceParam || maxPriceParam) {
      const newMinPrice = minPriceParam ? parseInt(minPriceParam) : 0;
      const newMaxPrice = maxPriceParam ? parseInt(maxPriceParam) : 5000000;

      setFilters((prevFilters) => ({
        ...prevFilters,
        location: locationParam || "",
        minPrice: newMinPrice.toString(),
        maxPrice: newMaxPrice.toString(),
      }));

      // Update price range slider
      setPriceRange([newMinPrice, newMaxPrice]);

      if (locationParam) setSearch(locationParam);
    }

    // Fetch cars data using context
    fetchCarsData();
    fetchBookingStatuses();
  }, [location.search, fetchCarsData]);

  // Fetch booking statuses for all cars
  const fetchBookingStatuses = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings`);
      const bookings = response.data || [];

      // Tạo map để lưu trạng thái booking cho từng xe
      const statusMap = {};
      bookings.forEach((booking) => {
        if (booking.car?.licensePlate) {
          // Nếu xe đã có booking, kiểm tra xem có booking ongoing không
          if (
            !statusMap[booking.car.licensePlate] ||
            booking.status?.toLowerCase() === "ongoing"
          ) {
            statusMap[booking.car.licensePlate] = booking.status?.toLowerCase();
          }
        }
      });

      setBookingStatuses(statusMap);
    } catch (error) {
      console.error("Error fetching booking statuses:", error);
    }
  };

  // Function to check if car has ongoing booking
  const hasOngoingBooking = (car) => {
    const bookingStatus = bookingStatuses[car.licensePlate];
    return bookingStatus === "ongoing";
  };

  // Add function to handle price range slider change
  const handleSliderChange = (value) => {
    setPriceRange(value);
    setFilters({
      ...filters,
      minPrice: value[0].toString(),
      maxPrice: value[1].toString(),
    });
    setCurrentPage(1);
  };

  const setFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      brand: "",
      type: "",
      seat: "",
      fuel: "",
      transmission: "",
      minPrice: "",
      maxPrice: "",
    });
    setPriceRange([0, 5000000]);
    setSearch("");
    setSortBy("default");
    setCurrentPage(1);
  };

  // Add function to convert fuelType to Vietnamese
  function getFuelTypeVi(fuelType) {
    switch (fuelType) {
      case "gasoline":
        return "xăng";
      case "diesel":
        return "dầu";
      case "electric":
        return "điện";
      case "hybrid":
        return "hybrid";
      default:
        return fuelType;
    }
  }

  const getFuelLabel = (fuelType) => {
    switch (fuelType) {
      case "gasoline":
        return "Xăng";
      case "diesel":
        return "Dầu";
      case "electric":
        return "Điện";
      case "hybrid":
        return "Hybrid";
      default:
        return fuelType;
    }
  };

  const getTransmissionLabel = (transmission) =>
    transmission === "manual" ? "Số sàn" : "Số tự động";

  // Danh sách hãng / số chỗ suy ra từ dữ liệu thật
  const brandOptions = useMemo(() => {
    const set = new Set(
      (carsData || []).map((c) => c.brand).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [carsData]);

  const seatOptions = useMemo(() => {
    const set = new Set(
      (carsData || []).map((c) => c.seats).filter((s) => s !== undefined && s !== null)
    );
    return Array.from(set).sort((a, b) => a - b);
  }, [carsData]);

  // Lọc xe chỉ còn hợp đồng hiệu lực và không có booking ongoing
  const filteredCars = carsData.filter((car) => {
    if (!car.contract || car.contract.status !== "ACTIVE_LEASE") return false;
    if (car.status !== "available") return false;
    // Kiểm tra xem xe có đang được thuê không
    if (hasOngoingBooking(car)) return false;

    const matchesSearch =
      car.brand.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      car.location.toLowerCase().includes(search.toLowerCase()) ||
      getFuelTypeVi(car.fuelType).includes(search.toLowerCase()) ||
      car.fuelType.toLowerCase().includes(search.toLowerCase()) ||
      car.transmission.toLowerCase().includes(search.toLowerCase()) ||
      car.seats.toString().includes(search.toLowerCase()) ||
      car.year.toString().includes(search.toLowerCase());
    const matchesBrand = !filters.brand || car.brand === filters.brand;
    const matchesSeat = !filters.seat || car.seats.toString() === filters.seat;
    const matchesFuel = !filters.fuel || car.fuelType === filters.fuel;
    const matchesTransmission =
      !filters.transmission || car.transmission === filters.transmission;
    const matchesType =
      !filters.type ||
      (car.type && car.type.toLowerCase() === filters.type.toLowerCase());
    const price = car.contract?.pricePerDay;
    const matchesPrice =
      price && price >= priceRange[0] && price <= priceRange[1];
    return (
      matchesSearch &&
      matchesBrand &&
      matchesSeat &&
      matchesFuel &&
      matchesTransmission &&
      matchesType &&
      matchesPrice
    );
  });

  // Sắp xếp
  const sortedCars = useMemo(() => {
    const list = [...filteredCars];
    switch (sortBy) {
      case "price-asc":
        return list.sort(
          (a, b) => (a.contract?.pricePerDay || 0) - (b.contract?.pricePerDay || 0)
        );
      case "price-desc":
        return list.sort(
          (a, b) => (b.contract?.pricePerDay || 0) - (a.contract?.pricePerDay || 0)
        );
      case "year-desc":
        return list.sort((a, b) => (b.year || 0) - (a.year || 0));
      case "rating-desc":
        return list.sort(
          (a, b) =>
            (b.reviewStats?.averageRating || 0) -
            (a.reviewStats?.averageRating || 0)
        );
      default:
        return list;
    }
  }, [filteredCars, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedCars.length / carsPerPage);
  const paginatedCars = sortedCars.slice(
    (currentPage - 1) * carsPerPage,
    currentPage * carsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBookNow = (e, car) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/cars/${car.licensePlate}`);
  };

  const activeFilterCount =
    (filters.brand ? 1 : 0) +
    (filters.seat ? 1 : 0) +
    (filters.fuel ? 1 : 0) +
    (filters.transmission ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 5000000 ? 1 : 0);

  const sidebar = (
    <aside className={`rc-sidebar ${showMobileFilters ? "open" : ""}`}>
      <div className="rc-sidebar-head">
        <h3>
          <FaSlidersH /> Bộ lọc
        </h3>
        <div className="rc-sidebar-head-actions">
          <button type="button" className="rc-reset" onClick={resetFilters}>
            Xoá lọc
          </button>
          <button
            type="button"
            className="rc-sidebar-close"
            onClick={() => setShowMobileFilters(false)}
            aria-label="Đóng bộ lọc"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="rc-filter-group">
        <span className="rc-filter-title">Hãng xe</span>
        <div className="rc-chip-list">
          <button
            type="button"
            className={`rc-chip ${!filters.brand ? "active" : ""}`}
            onClick={() => setFilter("brand", "")}
          >
            Tất cả
          </button>
          {brandOptions.map((brand) => (
            <button
              type="button"
              key={brand}
              className={`rc-chip ${filters.brand === brand ? "active" : ""}`}
              onClick={() => setFilter("brand", brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <div className="rc-filter-group">
        <span className="rc-filter-title">Giá thuê / ngày</span>
        <div className="rc-price-display">
          <span>{priceRange[0].toLocaleString("en-US")}</span>
          <span className="rc-price-sep">—</span>
          <span>{priceRange[1].toLocaleString("en-US")} VND</span>
        </div>
        <div className="rc-price-slider">
          <Slider
            range
            min={0}
            max={5000000}
            step={100000}
            value={priceRange}
            onChange={handleSliderChange}
            handleStyle={[
              { borderColor: "#7C3AED", backgroundColor: "#7C3AED" },
              { borderColor: "#22D3EE", backgroundColor: "#22D3EE" },
            ]}
            trackStyle={[{ backgroundColor: "#7C3AED" }]}
            className="price-range-slider"
          />
        </div>
      </div>

      <div className="rc-filter-group">
        <span className="rc-filter-title">Số chỗ</span>
        <div className="rc-chip-list">
          <button
            type="button"
            className={`rc-chip ${!filters.seat ? "active" : ""}`}
            onClick={() => setFilter("seat", "")}
          >
            Tất cả
          </button>
          {(seatOptions.length ? seatOptions : [2, 4, 5, 7]).map((seat) => (
            <button
              type="button"
              key={seat}
              className={`rc-chip ${filters.seat === String(seat) ? "active" : ""}`}
              onClick={() => setFilter("seat", String(seat))}
            >
              {seat} chỗ
            </button>
          ))}
        </div>
      </div>

      <div className="rc-filter-group">
        <span className="rc-filter-title">Hộp số</span>
        <div className="rc-chip-list">
          <button
            type="button"
            className={`rc-chip ${!filters.transmission ? "active" : ""}`}
            onClick={() => setFilter("transmission", "")}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`rc-chip ${filters.transmission === "automatic" ? "active" : ""}`}
            onClick={() => setFilter("transmission", "automatic")}
          >
            Số tự động
          </button>
          <button
            type="button"
            className={`rc-chip ${filters.transmission === "manual" ? "active" : ""}`}
            onClick={() => setFilter("transmission", "manual")}
          >
            Số sàn
          </button>
        </div>
      </div>

      <div className="rc-filter-group">
        <span className="rc-filter-title">Nhiên liệu</span>
        <div className="rc-chip-list">
          <button
            type="button"
            className={`rc-chip ${!filters.fuel ? "active" : ""}`}
            onClick={() => setFilter("fuel", "")}
          >
            Tất cả
          </button>
          {["gasoline", "diesel", "electric", "hybrid"].map((fuel) => (
            <button
              type="button"
              key={fuel}
              className={`rc-chip ${filters.fuel === fuel ? "active" : ""}`}
              onClick={() => setFilter("fuel", fuel)}
            >
              {getFuelLabel(fuel)}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="rent-car-page">
      {/* ===== HERO / SEARCH ===== */}
      <section className="rc-hero">
        <div className="rc-hero-glow" aria-hidden="true" />
        <div className="rc-hero-inner">
          <span className="rc-hero-badge">
            <FaBolt /> Hơn {carsData?.length || 0} xe sẵn sàng
          </span>
          <h1 className="rc-hero-title">
            Thuê xe <span className="dv-gradient-text">nhanh &amp; minh bạch</span>
          </h1>
          <p className="rc-hero-sub">
            Lọc theo hãng, ngân sách, số chỗ và nhiên liệu. Đặt xe chỉ trong vài cú click.
          </p>

          <div className="rc-searchbar">
            <FaSearch className="rc-searchbar-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên xe, hãng, địa điểm, nhiên liệu..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
            {search && (
              <button
                type="button"
                className="rc-search-clear"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                aria-label="Xoá tìm kiếm"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="quick-filters">
            {[
              { key: "", label: "Tất cả" },
              { key: "suv", label: "SUV" },
              { key: "sedan", label: "Sedan" },
              { key: "hatchback", label: "Hatchback" },
              { key: "mpv", label: "MPV" },
              { key: "pickup", label: "Pickup" },
            ].map((t) => (
              <button
                type="button"
                key={t.key || "all"}
                className={`btn-fast-search ${filters.type === t.key ? "active" : ""}`}
                onClick={() => setFilter("type", t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BODY ===== */}
      <div className="rc-body">
        <div className="rc-layout">
          {sidebar}

          {showMobileFilters && (
            <div
              className="rc-drawer-overlay"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          <main className="rc-main">
            <div className="rc-toolbar">
              <button
                type="button"
                className="rc-btn-filter-mobile"
                onClick={() => setShowMobileFilters(true)}
              >
                <FaSlidersH /> Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="rc-filter-badge">{activeFilterCount}</span>
                )}
              </button>

              <span className="rc-result-count">
                <FaCheckCircle /> {sortedCars.length} xe phù hợp
              </span>

              <div className="rc-toolbar-right">
                <div className="rc-sort">
                  <FaSortAmountDown className="rc-sort-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Sắp xếp"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rc-view-toggle" role="group" aria-label="Chế độ xem">
                  <button
                    type="button"
                    className={viewMode === "grid" ? "active" : ""}
                    onClick={() => setViewMode("grid")}
                    aria-label="Xem dạng lưới"
                  >
                    <FaTh />
                  </button>
                  <button
                    type="button"
                    className={viewMode === "list" ? "active" : ""}
                    onClick={() => setViewMode("list")}
                    aria-label="Xem dạng danh sách"
                  >
                    <FaList />
                  </button>
                </div>
              </div>
            </div>

            <div className="car-list">
              {loading ? (
                <div className={`car-grid ${viewMode === "list" ? "list-view" : ""}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CarCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="rc-empty">
                  <h3>Không tải được dữ liệu</h3>
                  <p>{String(error)}</p>
                  <button
                    type="button"
                    className="rc-btn-primary"
                    onClick={() => fetchCarsData()}
                  >
                    Thử lại
                  </button>
                </div>
              ) : sortedCars.length === 0 ? (
                <div className="rc-empty">
                  <NotFoundCar />
                  <div className="rc-empty-body">
                    <h3>Không tìm thấy xe phù hợp</h3>
                    <p>Hãy thử nới rộng khoảng giá hoặc bỏ vài bộ lọc.</p>
                    <button
                      type="button"
                      className="rc-btn-primary"
                      onClick={resetFilters}
                    >
                      Xoá tất cả bộ lọc
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`car-grid ${viewMode === "list" ? "list-view" : ""}`}>
                    {paginatedCars.map((car) => (
                      <Link
                        to={`/cars/${car.licensePlate}`}
                        key={car.licensePlate}
                        className="car-card"
                      >
                        <div className="car-image-container">
                          {car.mainImage ? (
                            <img
                              src={car.mainImage}
                              alt={`${car.brand} ${car.model}`}
                              className="car-image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="no-image">Không có ảnh</div>
                          )}

                          <div className="car-badges">
                            <span className="badge badge-type">
                              {car.type ? car.type.toUpperCase() : "XE"}
                            </span>
                            {car.year >= new Date().getFullYear() - 2 && (
                              <span className="badge badge-new">MỚI</span>
                            )}
                          </div>

                          <span className="badge badge-available">
                            <span className="dot" /> Sẵn sàng
                          </span>
                        </div>

                        <div className="car-info">
                          <h3 className="car-name">
                            {car.brand} {car.model}
                            <span className="car-year">{car.year}</span>
                          </h3>

                          <div className="car-specs-grid">
                            <p className="spec-item">
                              <FaChair /> {car.seats} chỗ
                            </p>
                            <p className="spec-item">
                              <FaCog /> {getTransmissionLabel(car.transmission)}
                            </p>
                            <p className="spec-item">
                              <FaGasPump /> {getFuelLabel(car.fuelType)}
                            </p>
                            <p className="spec-item">
                              <FaRoad /> {car.fuelConsumption}
                              {car.fuelType === "electric" ? "kWh" : "L"}/100km
                            </p>
                            <p className="spec-item">
                              <FaWrench /> Đời {car.year}
                            </p>
                            <p className="spec-item">
                              <FaMapMarkerAlt /> {car.location}
                            </p>
                          </div>

                          <div className="rating-trips">
                            <span className="rating-stars">
                              <FaStar />{" "}
                              {car.reviewStats?.averageRating?.toFixed(1) || "Mới"}
                            </span>
                            <span className="total-trips">
                              <FaCarSide /> {car.reviewStats?.totalReviews || 0} chuyến
                            </span>
                          </div>

                          <div className="car-price">
                            {car.contract?.pricePerDay ? (
                              <>
                                <span className="current-price">
                                  {car.contract.pricePerDay.toLocaleString("en-US")}
                                </span>
                                <span className="price-unit">VND / ngày</span>
                              </>
                            ) : (
                              <span className="current-price">Liên hệ</span>
                            )}
                          </div>

                          <div className="car-card-actions">
                            <span className="btn-detail">Chi tiết</span>
                            <button
                              type="button"
                              className="btn-book-now"
                              onClick={(e) => handleBookNow(e, car)}
                            >
                              <FaBolt /> Đặt ngay
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Trang trước"
                      >
                        <FaChevronLeft />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          type="button"
                          key={i + 1}
                          className={currentPage === i + 1 ? "active" : ""}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Trang sau"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RentCar;