import React, { useState, useEffect, useRef } from 'react';
import '../css/HomeContent.css';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useCarData } from '../../contexts/CarDataContext';
import { API_URL } from '../../api/configApi';
import { showErrorToast } from '../notification/notification';
import gsap from 'gsap';

const HomeContent = () => {
  const [form, setForm] = useState({
    location: '',
    minPrice: 0,
    maxPrice: 5000000,
  });
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();
  const { carsData, fetchCarsData } = useCarData();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.intro-header h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, clearProps: 'all' })
        .fromTo('.intro-header h2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' }, '-=0.4')
        .fromTo('.intro-header .lead', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' }, '-=0.3')
        .fromTo('.feature-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, clearProps: 'all' }, '-=0.2')
        .fromTo('.intro-buttons', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, clearProps: 'all' }, '-=0.2')
        .fromTo('.booking-card', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out', clearProps: 'all' }, '-=0.6');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Fetch cars data using context
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

  useEffect(() => {
    // Extract unique locations from cars data
    if (carsData.length > 0) {
      const uniqueLocations = [...new Set(carsData.map(car => car.location).filter(Boolean))];
      setLocations(uniqueLocations);
    }
  }, [carsData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (value) => {
    setForm({
      ...form,
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build query params
    const params = new URLSearchParams();
    if (form.location) params.append('location', form.location);
    if (form.minPrice != null) params.append('minPrice', form.minPrice);
    if (form.maxPrice != null) params.append('maxPrice', form.maxPrice);
    navigate(`/rent-car?${params.toString()}`);
  };

  return (
    <div className="home-bg-container" ref={containerRef}>
      <div className="home-bg-overlay"></div>
      <Container className="py-5">
        <Row className="justify-content-center">
          {/* Introduction Section */}
          <Col lg={7} className="mb-4 mb-lg-0">
            <div className="intro-section">
              <div className="intro-header">
                <h1 className="display-4 mb-3">Welcome to Drivon</h1>
                <h2 className="h3 mb-4">Vietnam's Leading Car Rental Platform</h2>
                <p className="lead">Drivon brings you a simple, safe, and cost-effective car rental experience</p>
              </div>
              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-car-front-fill"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Diverse Fleet</h3>
                    <p>From economy to luxury</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Comprehensive Insurance</h3>
                    <p>For every journey</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-credit-card"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Flexible Payment</h3>
                    <p>Safe and convenient</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <i className="bi bi-headset"></i>
                  </div>
                  <div className="feature-content">
                    <h3>24/7 Support</h3>
                    <p>Always ready to serve</p>
                  </div>
                </div>
              </div>

              <div className="intro-buttons">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/rent-car')}
                >
                  Rent a Car
                </Button>
              </div>
            </div>
          </Col>

          {/* Booking Form */}
          <Col lg={5}>
            <Card className="booking-card">
              <Card.Body>
                <h2>Want to Rent a Car?</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                    >
                      <option value="">Select location</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Price Range (VND/day)</Form.Label>
                    <Slider
                      range
                      min={0}
                      max={5000000}
                      step={100000}
                      defaultValue={[form.minPrice, form.maxPrice]}
                      onChange={handleSliderChange}
                      handleStyle={[{ borderColor: '#2563eb' }, { borderColor: '#2563eb' }]}
                      trackStyle={[{ backgroundColor: '#2563eb' }]}
                    />
                    <div className="price-display">
                      <span>{form.minPrice.toLocaleString()} đ</span>
                      <span>{form.maxPrice.toLocaleString()} đ</span>
                    </div>
                  </Form.Group>

                  <button type="submit" className="btn-submit-search">
                    Find Best Price
                  </button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomeContent;