import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './PropertyPlatform.css';

const PropertyPlatform = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: '🏠', title: 'Personalized Solutions', desc: 'Get customized recommendations based on your property type, budget, and preferences.' },
    { icon: '💡', title: 'Expert Curation', desc: 'Our team curates the best property improvement ideas for middle-class budgets.' },
    { icon: '💰', title: 'Value Enhancement', desc: 'Increase your property\'s market value with strategic improvements.' },
    { icon: '🎨', title: 'Design Inspiration', desc: 'Browse beautiful design ideas tailored for Indian homes.' },
    { icon: '🛠️', title: 'Practical Tools', desc: 'Access calculators and planning tools for informed decisions.' },
    { icon: '📱', title: 'Easy to Use', desc: 'Simple, intuitive platform accessible to everyone.' }
  ];

  const homeownerFeatures = [
    'Submit property details and requirements',
    'Get personalized improvement recommendations',
    'Access curated design inspiration',
    'Track improvement progress',
    'Connect with verified contractors',
    'Calculate project costs'
  ];

  const adminFeatures = [
    'Review homeowner submissions',
    'Curate recommendations',
    'Manage user accounts',
    'Analytics and reporting',
    'Content management',
    'Quality control'
  ];

  const improvementIdeas = [
    { name: 'Kitchen Renovation', icon: '🍳', color: '#8B4513' },
    { name: 'Bathroom Upgrade', icon: '🚿', color: '#4682B4' },
    { name: 'Living Room Makeover', icon: '🛋️', color: '#2E8B57' },
    { name: 'Bedroom Enhancement', icon: '🛏️', color: '#6B5B95' },
    { name: 'Flooring Replacement', icon: '🪵', color: '#8B6914' },
    { name: 'Wall Painting', icon: '🎨', color: '#E74C3C' },
    { name: 'Ceiling Work', icon: '🏠', color: '#3498DB' },
    { name: 'Electrical Upgrades', icon: '⚡', color: '#F39C12' },
    { name: 'Plumbing Improvements', icon: '🔧', color: '#1ABC9C' },
    { name: 'Balcony Renovation', icon: '🌿', color: '#27AE60' },
    { name: 'Terrace Waterproofing', icon: '☔', color: '#5D6D7E' },
    { name: 'Window Replacement', icon: '🪟', color: '#85C1E9' },
    { name: 'Door Upgrades', icon: '🚪', color: '#A0522D' },
    { name: 'Lighting Enhancement', icon: '💡', color: '#FFD700' },
    { name: 'Air Conditioning Installation', icon: '❄️', color: '#00CED1' },
    { name: 'Modular Kitchen', icon: '🍽️', color: '#D35400' },
    { name: 'Wardrobes Installation', icon: '👔', color: '#8E44AD' },
    { name: 'False Ceiling', icon: '✨', color: '#BDC3C7' },
    { name: 'Home Automation', icon: '🤖', color: '#2980B9' },
    { name: 'Security Systems', icon: '🔒', color: '#34495E' }
  ];

  return (
    <div className="property-platform-page">
      <nav className={isScrolled ? 'scrolled' : ''}>
        <Link to="/" className="logo">PropElevate</Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#ideas">Upgrade Ideas</a>
          <a href="#roles">How It Works</a>
          <a href="#cta">Get Started</a>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Transform Your Home<br/>Into Your Dream Space</h1>
          <p className="hero-subtitle">
            Discover personalized property enhancement solutions designed for Indian middle-class homes. 
            Expert-curated platform connecting homeowners with practical ideas to make your home more attractive, 
            valuable, and comfortable.
          </p>
          <div className="hero-buttons">
            <Link to="/login?type=homeowner" className="hero-btn primary">Get Started</Link>
            <Link to="/login?type=admin" className="hero-btn secondary">Design Advisor Login</Link>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose PropElevate?</h2>
          <p className="section-subtitle">Expert guidance and practical solutions to enhance every corner of your home</p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-box">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ideas" className="ideas-section">
        <div className="container">
          <h2 className="section-title">Ideas That Add Real Value</h2>
          <p className="section-subtitle">Proven upgrades tailored for Indian middle-class homes that deliver the best return on investment.</p>
        </div>
        <div className="ideas-scroll-wrapper">
          <div className="ideas-scroll-track">
            {[...improvementIdeas, ...improvementIdeas].map((idea, index) => (
              <div key={index} className="idea-scroll-card" style={{ '--card-color': idea.color }}>
                <div className="idea-scroll-icon">{idea.icon}</div>
                <h3>{idea.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="roles-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-header">
                <div className="role-icon">🏠</div>
                <h3>For Homeowners</h3>
              </div>
              <ul className="role-features">
                {homeownerFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <Link to="/login?type=homeowner" className="role-btn">Get Started</Link>
            </div>

            <div className="role-card admin-card">
              <div className="role-header">
                <div className="role-icon">👤</div>
                <h3>For Design Advisors</h3>
              </div>
              <ul className="role-features">
                {adminFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <Link to="/login?type=admin" className="role-btn admin">Design Advisor Login</Link>
            </div>

            <div className="role-card admin-card">
              <div className="role-header">
                <div className="role-icon">🔐</div>
                <h3>For Administrators</h3>
              </div>
              <ul className="role-features">
                <li>Full platform management</li>
                <li>User and advisor management</li>
                <li>Advanced analytics</li>
                <li>System configuration</li>
                <li>Performance monitoring</li>
                <li>Quality assurance</li>
              </ul>
              <Link to="/login?type=super-admin" className="role-btn admin">Admin Login</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Property?</h2>
          <p>Join thousands of homeowners who have enhanced their properties with HomePlus</p>
          <Link to="/login?type=homeowner" className="cta-btn">Get Started Today</Link>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Link to="/" className="logo">PropElevate</Link>
              <p>Transform your dream home</p>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#roles">How It Works</a>
              <a href="#ideas">Upgrade Ideas</a>
            </div>
          </div>
          <div className="copyright">
            &copy; 2026 HomePlus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PropertyPlatform;
