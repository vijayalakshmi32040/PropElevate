import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomeownerDashboard.css';
import api from '../services/api';

const HomeownerDashboard = () => {
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [homeownerHistory, setHomeownerHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const normalizeImprovements = (improvements, improvementList) => {
    if (Array.isArray(improvements)) {
      return improvements;
    }
    if (Array.isArray(improvementList) && improvementList.length > 0) {
      return improvementList.map(item => item.trim()).filter(Boolean);
    }
    if (typeof improvements === 'string' && improvements.trim().length > 0) {
      return improvements.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

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

    // Load property data and estimates from backend
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          // Fetch user's properties from backend
          const userProperties = await api.getUserProperties(userId);
          
          if (userProperties && userProperties.length > 0) {
            // Get the most recent property
            const latestProperty = userProperties[userProperties.length - 1];
            latestProperty.improvements = normalizeImprovements(latestProperty.improvements, latestProperty.improvementList);
            
            // Try to fetch estimate for this property
            try {
              const estimate = await api.getEstimate(latestProperty.id);
              if (estimate) {
                let parsedCosts = null;
                try {
                  if (estimate.improvementCosts) {
                    parsedCosts = JSON.parse(estimate.improvementCosts);
                  }
                } catch(e) {
                  console.error("Error parsing improvement costs", e);
                }
                latestProperty.adminEstimate = {
                  totalCost: estimate.totalCost,
                  valueIncreasePercent: estimate.valueIncreasePercent,
                  estimatedNewValue: estimate.estimatedNewValue,
                  adminNotes: estimate.adminNotes,
                  improvementCosts: parsedCosts,
                  estimatedDate: new Date().toISOString() // Could be enhanced to store actual date
                };
                latestProperty.status = 'Estimated';
              }
            } catch (estimateError) {
              console.log('No estimate found for property:', latestProperty.id);
            }
            
            setPropertyData(latestProperty);
          }
        }
      } catch (error) {
        console.error('Error loading user properties:', error);
        // Fallback to localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userPropertyData = localStorage.getItem(`propertyData_${userEmail}`);
        if (userPropertyData) {
          const parsed = JSON.parse(userPropertyData);
          parsed.improvements = normalizeImprovements(parsed.improvements, parsed.improvementList);
          setPropertyData(parsed);
        } else {
          const data = localStorage.getItem('propertyData');
          if (data) {
            const parsed = JSON.parse(data);
            parsed.improvements = normalizeImprovements(parsed.improvements, parsed.improvementList);
            setPropertyData(parsed);
          }
        }
      }
    };

    loadUserData();

    // Load history
    const userEmail = localStorage.getItem('userEmail');
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
                <p>{Array.isArray(propertyData?.improvements)
                  ? propertyData.improvements.length
                  : (propertyData?.improvements ? propertyData.improvements.split(',').map(i => i.trim()).filter(Boolean).length : 0)
                }</p>
              </div>
            </div>

            {propertyData?.improvements && (
              <div className="section">
                <h2>Your Selected Improvements</h2>
                <div className="improvements-list">
                  {Array.isArray(propertyData.improvements) 
                    ? propertyData.improvements.map((improvement, index) => (
                        <div key={index} className="improvement-item">
                          <span className="checkmark">✓</span>
                          <span>{improvement}</span>
                        </div>
                      ))
                    : propertyData.improvements.split(', ').map((improvement, index) => (
                        <div key={index} className="improvement-item">
                          <span className="checkmark">✓</span>
                          <span>{improvement.trim()}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            )}

            {propertyData?.adminEstimate && (
              <div className="section estimate-details-section">
                <h2>Design Advisor Estimate Details</h2>
                
                {propertyData.adminEstimate.improvementCosts ? (
                  <div className="improvements-list estimate-breakdown">
                    {Object.entries(propertyData.adminEstimate.improvementCosts).map(([improvement, cost], index) => (
                      <div key={index} className="improvement-item breakdown-item" style={{display: 'flex', justifyContent: 'space-between', paddingRight: '20px'}}>
                        <div>
                           <span className="checkmark">💰</span>
                           <span>{improvement}</span>
                        </div>
                        <span className="cost-value font-weight-bold">₹{parseInt(cost || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="improvement-item breakdown-item total-row" style={{display: 'flex', justifyContent: 'space-between', paddingRight: '20px', borderTop: '2px solid #eee', marginTop: '10px', paddingTop: '10px'}}>
                      <div>
                         <span className="checkmark" style={{opacity: 0}}>💰</span>
                         <strong>Total Estimated Cost</strong>
                      </div>
                      <span className="cost-value" style={{fontWeight: 'bold', color: '#e67e22', fontSize: '1.1rem'}}>₹{parseInt(propertyData.adminEstimate.totalCost).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="admin-notes">
                    <p>Total Estimated Cost: <strong>₹{parseInt(propertyData.adminEstimate.totalCost).toLocaleString('en-IN')}</strong></p>
                  </div>
                )}
                
                <div className="stats-grid secondary-stats" style={{marginTop: '20px'}}>
                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <h3>Value Increase</h3>
                    <p>{propertyData.adminEstimate.valueIncreasePercent}%</p>
                  </div>
                  <div className="stat-card" style={{background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'}}>
                    <div className="stat-icon">💎</div>
                    <h3>Estimated New Value</h3>
                    <p>₹{parseInt(propertyData.adminEstimate.estimatedNewValue).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                {propertyData.adminEstimate.adminNotes && (
                   <div className="admin-notes" style={{marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #e67e22'}}>
                     <h4 style={{margin: '0 0 10px 0', color: '#333'}}>Advisor Notes:</h4>
                     <p style={{margin: 0}}>{propertyData.adminEstimate.adminNotes}</p>
                   </div>
                )}
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
                          {entry.propertyDetails.improvements && (
                            <div className="history-improvements">
                              <strong>Improvements:</strong> {Array.isArray(entry.propertyDetails.improvements) 
                                ? entry.propertyDetails.improvements.join(', ')
                                : entry.propertyDetails.improvements
                              }
                            </div>
                          )}
                        </div>
                      )}

                      {entry.estimateData && (
                        <div className="history-estimate-summary">
                          {entry.estimateData.improvementCosts && Object.keys(entry.estimateData.improvementCosts).length > 0 && (
                            <div className="history-items-breakdown" style={{width: '100%', marginBottom: '15px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '8px'}}>
                              <h4 style={{margin: '0 0 10px 0', fontSize: '0.9rem', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '5px'}}>Cost Breakdown:</h4>
                              <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                {Object.entries(entry.estimateData.improvementCosts).map(([imp, cost], i) => (
                                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem'}}>
                                    <span>{imp}</span>
                                    <span style={{fontWeight: '500'}}>₹{parseInt(cost || 0).toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div style={{display: 'flex', gap: '15px', width: '100%'}}>
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
