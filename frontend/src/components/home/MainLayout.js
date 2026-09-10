import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import {
  FiUser,
  FiMessageSquare,
  FiTruck,
  FiLogOut,
  FiShield,
  FiSettings,
  FiChevronDown,
  FiMenu,
  FiX,
  FiGrid,
  FiHome,
} from 'react-icons/fi';
import Login from '../auth/Login';
import Signup from '../auth/Signup';
import ForgotPasswordPage from '../auth/ForgotPasswordPage';
import Footer from '../layout/footer';
import Loader from '../others/loader';
import NotificationBell from '../notification/NotificationBell';
import webSocketService from '../../services/WebSocketService';
import './MainLayout.css';
import { API_URL } from '../../api/configApi';
import { showErrorToast } from '../notification/notification';

const NAV_LINKS = [
  { to: '/', label: 'Home', match: (p) => p === '/' },
  { to: '/rent-car', label: 'Rent car', match: (p) => p.startsWith('/rent-car') },
  { to: '/contracts', label: 'Partner Applications', match: (p) => p.startsWith('/contracts') },
  { to: '/rent-your-car', label: 'Become a Partner', match: (p) => p.startsWith('/rent-your-car') },
  { to: '/contact', label: 'Contact', match: (p) => p === '/contact' },
];

const MainLayout = ({ user, handleLogout, children }) => {
  const [authMode, setAuthMode] = useState("login"); // 'login', 'signup', or 'forgot'
  const [userRole, setUserRole] = useState(null);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);
  const [roleCheckLoading, setRoleCheckLoading] = useState(false);
  const [roleCheckError, setRoleCheckError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const avatarUrl =
    user && user.avatarUrl
      ? user.avatarUrl
      : "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(user?.fullName || "User") +
      "&background=FFD700&color=222&size=64";

  const showAuthForm = location.pathname === "/auth";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Connect WebSocket when user is available
  useEffect(() => {
    if (user && user.userId) {
      console.log('Connecting WebSocket for user:', user.userId);
      webSocketService.connect(user.userId, () => {
        console.log('WebSocket connected successfully for user:', user.userId);
      });
    } else {
      console.log('No user available, disconnecting WebSocket');
      webSocketService.disconnect();
    }

    return () => {
      if (user && user.userId) {
        console.log('Cleaning up WebSocket for user:', user.userId);
      }
    };
  }, [user]);

  // Check user role with timeout
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setRoleCheckComplete(true);
        return;
      }

      setRoleCheckLoading(true);
      setRoleCheckError(null);

      // Set timeout for role check (10 seconds)
      const timeoutDuration = 10000;
      let timeoutId;

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Role check timeout'));
        }, timeoutDuration);
      });

      try {
        const roleCheckPromise = axios.get(`${API_URL}/admin/check-role/${user.userId}`);

        // Race between role check and timeout
        const response = await Promise.race([roleCheckPromise, timeoutPromise]);

        // Clear timeout if role check completes successfully
        clearTimeout(timeoutId);

        const { role, status } = response.data;

        if (status?.toLowerCase() === 'active') {
          setUserRole(role?.toLowerCase());
        } else {
          setUserRole(null);
        }

        setRoleCheckComplete(true);
      } catch (error) {
        // Clear timeout if it was set
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        console.error('Error checking user role:', error);
        setUserRole(null);
        setRoleCheckComplete(true);
        showErrorToast('Failed to check user role');
      } finally {
        setRoleCheckLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Header elevation on scroll + close overlays on route change
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Escape closes overlays
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleAuthSuccess = (userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      }
      window.location.href = "/"; // Force reload to update user state
    }
  };

  const handleCloseModal = () => {
    navigate("/"); // Go back to previous page when closing modal
  };

  const isAdmin = userRole === "admin";
  const isOwner = userRole === "owner" || userRole === "verify_owner";
  const roleLabel = isAdmin ? 'Admin' : isOwner ? 'Partner' : null;

  // Show loader while checking role
  if (roleCheckLoading) {
    return <div className="loading"><Loader /></div>;
  }

  return (
    <div className="HomeLayout">
      <header
        className={`dv-header backdrop-blur-xl bg-[#0B0F19]/80 border-b border-white/10${scrolled ? ' dv-header--scrolled' : ''}`}
      >
        <div className="dv-header__inner">
          {/* Mobile Menu Button */}
          <button
            className="dv-burger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu />
          </button>

          {/* Logo */}
          <div className="dv-logo" onClick={() => navigate('/')}>
            DRI<span>VON</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="dv-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`dv-nav-link${link.match(location.pathname) ? ' is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side - User Menu & Notifications */}
          <div className="dv-header__right">
            <div className="dv-umenu" ref={menuRef}>
              {user ? (
                <>
                  <div
                    className={`dv-umenu__trigger${menuOpen ? ' is-open' : ''}`}
                    onClick={() => setMenuOpen((open) => !open)}
                    role="button"
                    tabIndex={0}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setMenuOpen((open) => !open);
                      }
                    }}
                  >
                    <img src={avatarUrl} alt="avatar" className="dv-umenu__avatar" />
                    <span className="dv-umenu__name">
                      {user.fullName || user.email || "User"}
                    </span>
                    <FiChevronDown className="dv-umenu__caret" />
                  </div>

                  {menuOpen && (
                    <div className="dv-dropdown" role="menu">
                      <div className="dv-dropdown__head">
                        <img src={avatarUrl} alt="avatar" />
                        <div className="dv-dropdown__meta">
                          <p className="dv-dropdown__name">
                            {user.fullName || "User"}
                          </p>
                          <p className="dv-dropdown__email">
                            {user.email || ""}
                          </p>
                        </div>
                      </div>

                      <div className="dv-dropdown__label">Account</div>
                      <Link to="/profile" className="dv-dropdown__item">
                        <FiUser />
                        Profile
                      </Link>
                      <Link to="/messages" className="dv-dropdown__item">
                        <FiMessageSquare />
                        Messages
                      </Link>
                      <Link to="/my-rentals" className="dv-dropdown__item">
                        <FiTruck />
                        My Rentals
                      </Link>

                      {(isOwner || isAdmin) && <div className="dv-dropdown__divider" />}

                      {isOwner && (
                        <>
                          <div className="dv-dropdown__label">Workspace</div>
                          <Link to="/owner" className="dv-dropdown__item">
                            <FiSettings />
                            Owner Portal
                            <span className="dv-dropdown__badge">Owner</span>
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          {!isOwner && <div className="dv-dropdown__label">Workspace</div>}
                          <Link to="/adminSecret" className="dv-dropdown__item">
                            <FiShield />
                            Admin Dashboard
                            <span className="dv-dropdown__badge dv-dropdown__badge--admin">Admin</span>
                          </Link>
                        </>
                      )}

                      <div className="dv-dropdown__divider" />

                      <button
                        onClick={handleLogout}
                        className="dv-dropdown__item dv-dropdown__item--logout"
                      >
                        <FiLogOut />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  className="dv-login-btn"
                  onClick={() => navigate('/auth')}
                >
                  Login / Signup
                </button>
              )}
            </div>
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="dv-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="dv-mobile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dv-mobile-head">
              <div className="dv-logo" onClick={() => { setMobileMenuOpen(false); navigate('/'); }}>
                DRI<span>VON</span>
              </div>
              <button
                className="dv-mobile-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <FiX />
              </button>
            </div>

            {user && (
              <div className="dv-mobile-user">
                <img src={avatarUrl} alt="avatar" />
                <div className="dv-dropdown__meta">
                  <p className="dv-mobile-user__name">{user.fullName || "User"}</p>
                  <p className="dv-mobile-user__email">{user.email || ""}</p>
                </div>
              </div>
            )}

            <nav>
              <Link
                to="/"
                className={`dv-mobile-link${location.pathname === "/" ? ' is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiHome />
                Home
              </Link>
              <Link
                to="/rent-car"
                className={`dv-mobile-link${location.pathname.startsWith("/rent-car") ? ' is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiTruck />
                Rent car
              </Link>
              <Link
                to="/contracts"
                className={`dv-mobile-link${location.pathname.startsWith("/contracts") ? ' is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiGrid />
                Partner Applications
              </Link>
              <Link
                to="/rent-your-car"
                className={`dv-mobile-link${location.pathname.startsWith("/rent-your-car") ? ' is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiSettings />
                Become a Partner
              </Link>
              <Link
                to="/contact"
                className={`dv-mobile-link${location.pathname === "/contact" ? ' is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiMessageSquare />
                Contact
              </Link>
            </nav>

            {user && (
              <div className="dv-mobile-section">
                <div className="dv-mobile-section__title">Account</div>
                <Link to="/profile" className="dv-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <FiUser />
                  Profile
                </Link>
                <Link to="/my-rentals" className="dv-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <FiTruck />
                  My Rentals
                </Link>
                <Link to="/messages" className="dv-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <FiMessageSquare />
                  Messages
                </Link>
              </div>
            )}

            {(isOwner || isAdmin) && (
              <div className="dv-mobile-section">
                <div className="dv-mobile-section__title">Workspace</div>
                {isOwner && (
                  <Link to="/owner" className="dv-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    <FiSettings />
                    Owner Portal
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/adminSecret" className="dv-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                    <FiShield />
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}

            <div className="dv-mobile-cta">
              {user ? (
                <button
                  className="dv-dropdown__item dv-dropdown__item--logout"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                >
                  <FiLogOut />
                  Logout
                </button>
              ) : (
                <button
                  className="dv-login-btn"
                  style={{ width: '100%' }}
                  onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                >
                  Login / Signup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAuthForm && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            {authMode !== "forgot" && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
                  onClick={() => setAuthMode("signup")}
                >
                  Signup
                </button>
              </div>
            )}

            {authMode === "login" && (
              <>
                <Login onLoginSuccess={handleAuthSuccess} embedded />
                <div style={{ textAlign: "center", marginTop: "14px" }}>
                  <button
                    onClick={() => setAuthMode("forgot")}
                    className="link-button"
                    style={{ fontSize: "14px" }}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            {authMode === "signup" && (
              <Signup onSignupSuccess={handleAuthSuccess} embedded />
            )}
            {authMode === "forgot" && (
              <>
                <ForgotPasswordPage embedded />
                <div style={{ textAlign: "center", marginTop: "14px" }}>
                  <button
                    onClick={() => setAuthMode("login")}
                    className="link-button"
                  >
                    Back to login
                  </button>
                </div>
              </>
            )}
            <button className="close-modal" onClick={handleCloseModal} aria-label="Close">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="page-content">{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;