import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomeownerDashboard.css';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [homeownerHistory, setHomeownerHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Format property type for display
  const formatPropertyType = (type) => {
    if (!type) return 'Not specified';
    const typeMap = {
      'apartment': 'Apartment',
      'independent-house': 'Independent House',
      'villa': 'Villa',
      'plot': 'Plot'
    };
    return typeMap[type] || type;
  };

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'homeowner') {
      navigate('/login?type=homeowner');
      return;
    }

    // Load user data
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Load property data (per user email)
    const userEmail = localStorage.getItem('userEmail');
    const userPropertyData = localStorage.getItem(`propertyData_${userEmail}`);
    if (userPropertyData) {
      setPropertyData(JSON.parse(userPropertyData));
    } else {
      // Fallback to generic propertyData
      const data = localStorage.getItem('propertyData');
      if (data) {
        setPropertyData(JSON.parse(data));
      }
    }

    // Load history
    if (userEmail) {
      const history = JSON.parse(localStorage.getItem(`homeownerHistory_${userEmail}`) || '[]');
      setHomeownerHistory(history);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const getStatusMessage = () => {
    if (propertyData?.adminEstimate) {
      return { text: 'Estimate Received', class: 'status-estimated' };
    } else if (propertyData?.status === 'Approved') {
      return { text: 'Approved - Awaiting Estimate', class: 'status-approved' };
    } else if (propertyData?.status === 'Rejected') {
      return { text: 'Rejected', class: 'status-rejected' };
    } else {
      return { text: 'Pending Review', class: 'status-pending' };
    }
  };

  return (
    <div className="dashboard-page">
      <nav>
        <Link to="/" className="logo">PropElevate</Link>
        <div className="user-info">
          <span>Welcome, {userData?.fullName || localStorage.getItem('userName') || 'Homeowner'}</span>
          <button className="history-nav-btn" onClick={() => setActiveTab('history')}>📜 History</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <h1>My Dashboard</h1>
        <p className="subtitle">Track your property improvement journey</p>

        {propertyData && (
          <div className={`submission-status ${getStatusMessage().class}`}>
            <span className="status-label">Submission Status:</span>
            <span className="status-value">{getStatusMessage().text}</span>
          </div>
        )}

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <h3>Property Type</h3>
                <p>{formatPropertyType(propertyData?.propertyType)}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <h3>Property Value</h3>
                <p>{propertyData?.propertyValue ? `₹${Number(propertyData.propertyValue).toLocaleString('en-IN')}` : 'Not specified'}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📐</div>
                <h3>Built-up Area</h3>
                <p>{propertyData?.builtUpArea ? `${Number(propertyData.builtUpArea).toLocaleString('en-IN')} sq ft` : 'Not specified'}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <h3>Property Age</h3>
                <p>{propertyData?.propertyAge ? `${propertyData.propertyAge} years` : 'Not specified'}</p>
              </div>
            </div>

            {propertyData?.city && (
              <div className="property-location">
                <div className="location-icon">📍</div>
                <span>{propertyData.street && `${propertyData.street}, `}{propertyData.city}{propertyData.state && `, ${propertyData.state}`}{propertyData.pinCode && ` - ${propertyData.pinCode}`}</span>
              </div>
            )}

            <div className="stats-grid secondary-stats">
              <div className="stat-card small">
                <div className="stat-icon">🎯</div>
                <h3>Selected Improvements</h3>
                <p>{propertyData?.improvements?.length || 0}</p>
              </div>
            </div>

            {propertyData?.improvements && propertyData.improvements.length > 0 && (
              <div className="section">
                <h2>Your Selected Improvements</h2>
                <div className="improvements-list">
                  {propertyData.improvements.map((improvement, index) => (
                    <div key={index} className="improvement-item">
                      <span className="checkmark">✓</span>
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="section">
            <h2>Your Activity History</h2>
            {homeownerHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No History Yet</h3>
                <p>Your activity and updates will appear here</p>
              </div>
            ) : (
              <div className="history-list">
                {homeownerHistory.map(entry => (
                  <div key={entry.id} className={`history-item ${entry.action === 'Estimate Received' ? 'history-item-expanded' : ''}`}>
                    <div className="history-icon">
                      {entry.action === 'Estimate Received' ? '💰' : entry.action === 'Submission' ? '📋' : '📌'}
                    </div>
                    <div className="history-content">
                      <div className="history-action">{entry.action}</div>
                      <div className="history-details">{entry.details}</div>
                      
                      {entry.propertyDetails && (
                        <div className="history-property-details">
                          <div className="history-property-header">Property Details:</div>
                          <div className="history-property-grid">
                            <span><strong>Type:</strong> {formatPropertyType(entry.propertyDetails.propertyType)}</span>
                            <span><strong>Location:</strong> {entry.propertyDetails.city}{entry.propertyDetails.state && `, ${entry.propertyDetails.state}`}</span>
                            {entry.propertyDetails.propertyValue && (
                              <span><strong>Value:</strong> ₹{parseInt(entry.propertyDetails.propertyValue).toLocaleString('en-IN')}</span>
                            )}
                            {entry.propertyDetails.builtUpArea && (
                              <span><strong>Area:</strong> {entry.propertyDetails.builtUpArea} sq ft</span>
                            )}
                          </div>
                          {entry.propertyDetails.improvements && entry.propertyDetails.improvements.length > 0 && (
                            <div className="history-improvements">
                              <strong>Improvements:</strong> {entry.propertyDetails.improvements.join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {entry.estimateData && (
                        <div className="history-estimate-summary">
                          <div className="estimate-mini-card">
                            <span className="label">Total Cost</span>
                            <span className="value">₹{parseInt(entry.estimateData.totalCost).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="estimate-mini-card">
                            <span className="label">Value Increase</span>
                            <span className="value">{entry.estimateData.valueIncreasePercent}%</span>
                          </div>
                          <div className="estimate-mini-card">
                            <span className="label">New Value</span>
                            <span className="value">₹{parseInt(entry.estimateData.estimatedNewValue).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}

                      <div className="history-time">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="action-section">
          <Link to="/" className="btn btn-primary">Explore Platform</Link>
          {propertyData ? (
            <Link to="/homeowner-form" className="btn btn-secondary">➕ Add Another Property</Link>
          ) : (
            <Link to="/homeowner-form" className="btn btn-secondary">Add Property Details</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeownerDashboard;
