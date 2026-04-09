import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import apiService from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [loginType, setLoginType] = useState('homeowner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type') || 'homeowner';
    setLoginType(type);
    
    // Check for saved credentials
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setLoginData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [location]);

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Phone validation (10-digit number)
  const validatePhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone.replace(/\s/g, ''));
  };

  // Password strength validation
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!validateEmail(loginData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!loginData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const userData = await apiService.login({
        email: loginData.email,
        password: loginData.password
      });

      // Store additional user info
      localStorage.setItem('userType', loginType);
      localStorage.setItem('userEmail', loginData.email);
      localStorage.setItem('userName', userData.fullName);

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem('savedEmail', loginData.email);
      } else {
        localStorage.removeItem('savedEmail');
      }

      setSuccess('Login successful! Redirecting...');

      setTimeout(() => {
        if (loginType === 'admin') {
          navigate('/design-advisor-dashboard');
        } else if (loginType === 'super-admin') {
          navigate('/admin-management');
        } else {
          navigate('/homeowner-dashboard');
        }
      }, 1000);
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!signupData.fullName.trim() || signupData.fullName.length < 3) {
      setError('Full name must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (!validateEmail(signupData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validatePhone(signupData.phone)) {
      setError('Please enter a valid Indian phone number');
      setLoading(false);
      return;
    }

    if (!validatePassword(signupData.password)) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData = await apiService.signup({
        fullName: signupData.fullName,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        role: loginType === 'homeowner' ? 'USER' : 
              loginType === 'admin' ? 'DESIGN_ADVISOR' : 'ADMIN'
      });

      // Store additional user info
      localStorage.setItem('userType', loginType);
      localStorage.setItem('userEmail', signupData.email);
      localStorage.setItem('userName', signupData.fullName);

      setSuccess('Account created successfully! Redirecting...');

      setTimeout(() => {
        if (loginType === 'admin') {
          navigate('/design-advisor-dashboard');
        } else if (loginType === 'super-admin') {
          navigate('/admin-management');
        } else {
          navigate('/homeowner-form');
        }
      }, 1000);
    } catch (error) {
      setError(error.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className={`login-header ${loginType === 'admin' ? 'admin-header' : ''}`}>
          <Link to="/" className="back-arrow">←</Link>
          <Link to="/" className="login-logo">PropElevate</Link>
          <div className="login-type">
            {loginType === 'admin' ? 'Design Advisor Portal' : 'Homeowner Portal'}
          </div>
        </div>

        <div className="login-body">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccess('');
              }}
            >
              Login
            </button>
            <button 
              className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setError('');
                setSuccess('');
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              {success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="tab-content active">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder={loginType === 'admin' ? 'yourname@gmail.com' : 'your.email@gmail.com'}
                    required 
                    disabled={loading}
                  />
                  {loginType === 'admin' && (
                    <small className="form-hint">Design Advisor accounts can use any email address (e.g., yourname@gmail.com)</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password" 
                      required 
                      disabled={loading}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className="form-options">
                  <label className="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
              <div className="form-footer">
                <p>Don't have an account? <button onClick={() => setActiveTab('signup')} className="link-btn">Sign up</button></p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <div className="tab-content active">
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    placeholder="Enter your full name" 
                    required 
                    disabled={loading}
                    minLength={3}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder={loginType === 'admin' ? 'yourname@gmail.com' : 'your.email@gmail.com'}
                    required 
                    disabled={loading}
                  />
                  {loginType === 'admin' && (
                    <small className="form-hint">Design Advisor accounts can use any email address (e.g., yourname@gmail.com)</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={signupData.phone}
                    onChange={handleSignupChange}
                    placeholder="9876543210" 
                    required 
                    disabled={loading}
                  />
                  <small className="form-hint">Enter 10-digit phone number</small>
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Create a strong password" 
                      required 
                      disabled={loading}
                      minLength={8}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <small className="form-hint">Must be at least 8 characters long</small>
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Re-enter your password" 
                    required 
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>
              <div className="form-footer">
                <p>Already have an account? <button onClick={() => setActiveTab('login')} className="link-btn">Login</button></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
