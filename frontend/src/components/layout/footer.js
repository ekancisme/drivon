import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowUpRight,
} from 'react-icons/fi';

const EXPLORE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/rent-car', label: 'Rent a Car' },
  { to: '/rent-your-car', label: 'Become a Partner' },
  { to: '/contracts', label: 'Partner Applications' },
  { to: '/contact', label: 'Contact' },
];

const RENTER_LINKS = [
  { to: '/my-rentals', label: 'My Rentals' },
  { to: '/profile', label: 'My Profile' },
  { to: '/messages', label: 'Messages' },
  { to: '/rent-car', label: 'Browse Fleet' },
];

const SOCIALS = [
  { href: 'https://facebook.com', label: 'Facebook', Icon: FiFacebook },
  { href: 'https://twitter.com', label: 'Twitter', Icon: FiTwitter },
  { href: 'https://instagram.com', label: 'Instagram', Icon: FiInstagram },
  { href: 'https://linkedin.com', label: 'LinkedIn', Icon: FiLinkedin },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="dv-footer">
      <div className="dv-footer__glow" aria-hidden="true" />

      <div className="dv-footer__inner">
        <div className="dv-footer__grid">
          {/* Column 1 — Brand */}
          <div className="dv-footer__col dv-footer__col--brand">
            <div className="dv-footer__logo">
              DRI<span>VON</span>
            </div>
            <p className="dv-footer__tagline">
              Nền tảng cho thuê xe tự lái minh bạch, an toàn và hiện đại.
              Kết nối chủ xe với hàng nghìn khách hàng đã xác thực.
            </p>

            <div className="dv-footer__socials">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="dv-footer__social"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Explore */}
          <div className="dv-footer__col">
            <h4 className="dv-footer__title">Khám phá</h4>
            <ul className="dv-footer__list">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="dv-footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Renters */}
          <div className="dv-footer__col">
            <h4 className="dv-footer__title">Dành cho khách thuê</h4>
            <ul className="dv-footer__list">
              {RENTER_LINKS.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="dv-footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div className="dv-footer__col">
            <h4 className="dv-footer__title">Liên hệ</h4>
            <ul className="dv-footer__list dv-footer__list--contact">
              <li>
                <FiMail />
                <a href="mailto:info@drivon.com" className="dv-footer__link">info@drivon.com</a>
              </li>
              <li>
                <FiPhone />
                <a href="tel:+84123456789" className="dv-footer__link">+84 123 456 789</a>
              </li>
              <li>
                <FiMapPin />
                <span>FPT University, District 9,<br />Ho Chi Minh City</span>
              </li>
            </ul>

            <Link to="/contact" className="dv-footer__cta">
              Liên hệ ngay
              <FiArrowUpRight />
            </Link>
          </div>
        </div>

        <div className="dv-footer__bottom">
          <p>&copy; {year} Drivon. All rights reserved.</p>
          <div className="dv-footer__bottom-links">
            <Link to="/contact" className="dv-footer__link">Điều khoản</Link>
            <span className="dv-footer__dot" />
            <Link to="/contact" className="dv-footer__link">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;