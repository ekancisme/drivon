import React, { useState, useEffect, useMemo } from 'react';
import '../css/HomeContent.css';
import { useNavigate, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCarSide,
  FaSearch,
  FaShieldAlt,
  FaHeadset,
  FaCreditCard,
  FaCheckCircle,
  FaStar,
  FaChair,
  FaGasPump,
  FaCog,
  FaArrowRight,
  FaUserCheck,
  FaFileSignature,
  FaKey,
  FaQuoteLeft,
  FaBolt,
} from 'react-icons/fa';
import { useCarData } from '../../contexts/CarDataContext';
import { showErrorToast } from '../notification/notification';

const FEATURES = [
  {
    icon: <FaCarSide />,
    title: 'Diverse Fleet',
    desc: 'Hundreds of vehicles, from economical city cars to premium SUVs.',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Verified & Insured',
    desc: 'Every partner and vehicle is vetted. Full insurance on each trip.',
  },
  {
    icon: <FaCreditCard />,
    title: 'Transparent Pricing',
    desc: 'No hidden fees. See the exact price per day before you book.',
  },
  {
    icon: <FaHeadset />,
    title: '24/7 Support',
    desc: 'Our team is one message away, before, during and after your trip.',
  },
];

const STEPS = [
  {
    icon: <FaSearch />,
    title: 'Search',
    desc: 'Pick your location, dates and the type of car you need.',
  },
  {
    icon: <FaFileSignature />,
    title: 'Book',
    desc: 'Choose your car, review the terms and confirm in a few clicks.',
  },
  {
    icon: <FaKey />,
    title: 'Drive',
    desc: 'Meet the owner, pick up the keys and hit the road.',
  },
];

const STATS = [
  { value: '10,000+', label: 'Successful rentals' },
  { value: '98%', label: 'Satisfaction rate' },
  { value: '500+', label: 'Trusted partners' },
  { value: '24/7', label: 'Customer support' },
];

const TESTIMONIALS = [
  {
    name: 'Minh Tran',
    role: 'Business traveller',
    rating: 5,
    text: 'Booking took two minutes and the car was exactly as described. The owner handed over the keys right at the airport.',
  },
  {
    name: 'Lan Pham',
    role: 'Family trip',
    rating: 5,
    text: 'We rented a 7-seater for a weekend in Da Lat. Clear pricing, no surprise fees, and the support team answered instantly.',
  },
  {
    name: 'Quang Nguyen',
    role: 'First-time renter',
    rating: 4,
    text: 'As a first-time renter I was nervous, but the verification flow was smooth and the contract was easy to understand.',
  },
];

const FUEL_LABELS = {
  gasoline: 'Gasoline',
  diesel: 'Diesel',
  electric: 'Electric',
  hybrid: 'Hybrid',
};

const HomeContent = () => {
  const navigate = useNavigate();
  const { carsData, fetchCarsData } = useCarData();

  const [search, setSearch] = useState({
    location: '',
    pickupDate: '',
    type: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCarsData();
      } catch (error) {
        console.error('Error loading cars data:', error);
        showErrorToast('Failed to load cars data');
      }
    };
    loadData();
  }, [fetchCarsData]);

  const locations = useMemo(() => {
    if (!carsData?.length) return [];
    return [...new Set(carsData.map((car) => car.location).filter(Boolean))];
  }, [carsData]);

  const carTypes = useMemo(() => {
    if (!carsData?.length) return [];
    return [
      ...new Set(
        carsData
          .map((car) => car.type)
          .filter(Boolean)
          .map((t) => String(t).toLowerCase())
      ),
    ];
  }, [carsData]);

  const featuredCars = useMemo(() => {
    if (!carsData?.length) return [];
    return carsData
      .filter(
        (car) =>
          car.contract &&
          car.contract.status === 'ACTIVE_LEASE' &&
          car.status === 'available' &&
          car.contract.pricePerDay
      )
      .sort(
        (a, b) =>
          (b.reviewStats?.averageRating || 0) -
          (a.reviewStats?.averageRating || 0)
      )
      .slice(0, 6);
  }, [carsData]);

  const handleSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.location) params.append('location', search.location);
    if (search.type) params.append('type', search.type);
    if (search.pickupDate) params.append('pickupDate', search.pickupDate);
    navigate(`/rent-car?${params.toString()}`);
  };

  return (
    <div className="hc-page">
      {/* ================= HERO ================= */}
      <section className="hc-hero">
        <div className="hc-hero__glow hc-hero__glow--violet" />
        <div className="hc-hero__glow hc-hero__glow--cyan" />
        <div className="hc-hero__grid-overlay" />

        <Container className="hc-hero__inner">
          <span className="hc-badge">
            <FaCheckCircle /> Verified vehicles &amp; trusted owners
          </span>

          <h1 className="hc-hero__title">
            Rent the right car,
            <br />
            <span className="dv-gradient-text">anywhere in Vietnam.</span>
          </h1>

          <p className="hc-hero__subtitle">
            Drivon connects you with verified car owners. Transparent prices,
            flexible dates, and a booking flow that takes minutes, not days.
          </p>

          {/* Search form */}
          <form className="hc-search" onSubmit={handleSearchSubmit}>
            <div className="hc-search__field">
              <label className="hc-search__label" htmlFor="hc-location">
                <FaMapMarkerAlt /> Location
              </label>
              <select
                id="hc-location"
                name="location"
                className="hc-search__control"
                value={search.location}
                onChange={handleSearchChange}
              >
                <option value="">Any location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="hc-search__field">
              <label className="hc-search__label" htmlFor="hc-date">
                <FaCalendarAlt /> Pickup date
              </label>
              <input
                id="hc-date"
                type="date"
                name="pickupDate"
                className="hc-search__control"
                value={search.pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleSearchChange}
              />
            </div>

            <div className="hc-search__field">
              <label className="hc-search__label" htmlFor="hc-type">
                <FaCarSide /> Car type
              </label>
              <select
                id="hc-type"
                name="type"
                className="hc-search__control"
                value={search.type}
                onChange={handleSearchChange}
              >
                <option value="">Any type</option>
                {carTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="hc-search__submit">
              <FaSearch /> Find a car
            </button>
          </form>

          <div className="hc-hero__trust">
            <span>
              <FaShieldAlt /> Insured trips
            </span>
            <span className="hc-hero__trust-dot" />
            <span>
              <FaBolt /> Instant confirmation
            </span>
            <span className="hc-hero__trust-dot" />
            <span>
              <FaUserCheck /> Verified owners
            </span>
          </div>
        </Container>
      </section>

      <Container>
        {/* ================= FEATURED CARS ================= */}
        <section className="hc-section">
          <div className="hc-section__head">
            <div>
              <p className="hc-eyebrow">Featured fleet</p>
              <h2 className="hc-section__title">Popular cars right now</h2>
            </div>
            <Link to="/rent-car" className="hc-section__link">
              View all cars <FaArrowRight />
            </Link>
          </div>

          {featuredCars.length === 0 ? (
            <div className="hc-featured-empty">
              <FaCarSide />
              <p>No cars are available at the moment. Please check back soon.</p>
            </div>
          ) : (
            <div className="hc-car-grid">
              {featuredCars.map((car) => (
                <Link
                  to={`/cars/${car.licensePlate}`}
                  key={car.licensePlate}
                  className="hc-car-card"
                >
                  <div className="hc-car-card__media">
                    {car.mainImage ? (
                      <img
                        src={car.mainImage}
                        alt={`${car.brand} ${car.model}`}
                        className="hc-car-card__img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="hc-car-card__noimg">
                        <FaCarSide />
                      </div>
                    )}
                    <span className="hc-car-card__rating">
                      <FaStar />
                      {car.reviewStats?.averageRating
                        ? car.reviewStats.averageRating.toFixed(1)
                        : 'New'}
                    </span>
                  </div>

                  <div className="hc-car-card__body">
                    <h3 className="hc-car-card__name">
                      {car.brand} {car.model}
                      <span className="hc-car-card__year">{car.year}</span>
                    </h3>

                    <div className="hc-car-card__specs">
                      <span>
                        <FaChair /> {car.seats} seats
                      </span>
                      <span>
                        <FaCog />{' '}
                        {car.transmission === 'automatic' ? 'Automatic' : 'Manual'}
                      </span>
                      <span>
                        <FaGasPump /> {FUEL_LABELS[car.fuelType] || car.fuelType}
                      </span>
                    </div>

                    <div className="hc-car-card__foot">
                      <div className="hc-car-card__price">
                        {car.contract.pricePerDay.toLocaleString('en-US')}
                        <span> VND / day</span>
                      </div>
                      <span className="hc-car-card__cta">
                        Details <FaArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ================= WHY CHOOSE US ================= */}
        <section className="hc-section">
          <div className="hc-section__head hc-section__head--center">
            <div>
              <p className="hc-eyebrow">Why Drivon</p>
              <h2 className="hc-section__title">
                Built for a better rental experience
              </h2>
            </div>
          </div>

          <div className="hc-feature-grid">
            {FEATURES.map((f) => (
              <div className="hc-feature-card" key={f.title}>
                <div className="hc-feature-card__icon">{f.icon}</div>
                <h3 className="hc-feature-card__title">{f.title}</h3>
                <p className="hc-feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="hc-section">
          <div className="hc-section__head hc-section__head--center">
            <div>
              <p className="hc-eyebrow">How it works</p>
              <h2 className="hc-section__title">Three steps to the road</h2>
            </div>
          </div>

          <div className="hc-steps">
            {STEPS.map((step, idx) => (
              <div className="hc-step" key={step.title}>
                <div className="hc-step__marker">
                  <span className="hc-step__num">{idx + 1}</span>
                  <span className="hc-step__icon">{step.icon}</span>
                </div>
                <h3 className="hc-step__title">{step.title}</h3>
                <p className="hc-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="hc-stats">
          {STATS.map((s) => (
            <div className="hc-stat" key={s.label}>
              <div className="hc-stat__value dv-gradient-text">{s.value}</div>
              <div className="hc-stat__label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="hc-section">
          <div className="hc-section__head hc-section__head--center">
            <div>
              <p className="hc-eyebrow">Testimonials</p>
              <h2 className="hc-section__title">Loved by drivers</h2>
            </div>
          </div>

          <div className="hc-testimonial-grid">
            {TESTIMONIALS.map((t) => (
              <figure className="hc-testimonial" key={t.name}>
                <FaQuoteLeft className="hc-testimonial__quote" />
                <div className="hc-testimonial__stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={i < t.rating ? 'is-on' : 'is-off'}
                    />
                  ))}
                </div>
                <blockquote className="hc-testimonial__text">
                  {t.text}
                </blockquote>
                <figcaption className="hc-testimonial__author">
                  <span className="hc-testimonial__avatar">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <strong>{t.name}</strong>
                    <em>{t.role}</em>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="hc-cta">
          <div className="hc-cta__glow" />
          <h2 className="hc-cta__title">Ready to hit the road?</h2>
          <p className="hc-cta__text">
            Browse hundreds of verified vehicles and book in minutes.
          </p>
          <button
            className="dv-btn dv-btn-primary hc-cta__btn"
            onClick={() => navigate('/rent-car')}
          >
            <FaCarSide /> Browse cars
          </button>
        </section>
      </Container>
    </div>
  );
};

export default HomeContent;