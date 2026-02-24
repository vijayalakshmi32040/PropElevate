import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [propertySubmissions, setPropertySubmissions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [adminHistory, setAdminHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions');
  const [estimateData, setEstimateData] = useState({
    improvementCosts: {},
    totalCost: '',
    valueIncreasePercent: '',
    estimatedNewValue: '',
    adminNotes: ''
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    completed: 0,
    inProgress: 0
  });

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
    
    if (!isLoggedIn || userType !== 'admin') {
      navigate('/login?type=admin');
      return;
    }

    // Load user data
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Load property submissions
    loadPropertySubmissions();
    loadAdminHistory();
  }, [navigate]);

  const loadPropertySubmissions = () => {
    const submissions = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('propertySubmission_')) {
        try {
          const submission = JSON.parse(localStorage.getItem(key));
          submissions.push({
            ...submission,
            id: key,
            submissionDate: submission.submissionDate || new Date().toISOString()
          });
        } catch (e) {
          console.error('Error parsing submission:', e);
        }
      }
    });

    submissions.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    setPropertySubmissions(submissions);

    const totalProperties = submissions.length;
    const uniqueUsers = new Set(submissions.map(s => s.ownerEmail)).size;
    const pendingCount = submissions.filter(s => s.status === 'Pending Review').length;
    const approvedCount = submissions.filter(s => s.status === 'Approved' || s.status === 'Estimated').length;

    setStats({
      totalUsers: uniqueUsers,
      totalProperties: totalProperties,
      completed: approvedCount,
      inProgress: pendingCount
    });
  };

  const loadAdminHistory = () => {
    const history = JSON.parse(localStorage.getItem('adminHistory') || '[]');
    setAdminHistory(history);
  };

  const addToHistory = (action, propertyOwner, details) => {
    const history = JSON.parse(localStorage.getItem('adminHistory') || '[]');
    const newEntry = {
      id: Date.now(),
      action,
      propertyOwner,
      details,
      timestamp: new Date().toISOString(),
      adminEmail: userData?.email || localStorage.getItem('userEmail')
    };
    history.unshift(newEntry);
    localStorage.setItem('adminHistory', JSON.stringify(history.slice(0, 50)));
    setAdminHistory(history.slice(0, 50));
  };

  const handleRefresh = () => {
    loadPropertySubmissions();
    loadAdminHistory();
  };

  const handleApprove = (submissionId) => {
    const submission = propertySubmissions.find(s => s.id === submissionId);
    if (submission) {
      submission.status = 'Approved';
      submission.approvedDate = new Date().toISOString();
      localStorage.setItem(submissionId, JSON.stringify(submission));
      addToHistory('Approved', submission.ownerName, `Approved property submission for ${submission.city}`);
      loadPropertySubmissions();
    }
  };

  const handleReject = (submissionId) => {
    const submission = propertySubmissions.find(s => s.id === submissionId);
    if (submission) {
      submission.status = 'Rejected';
      localStorage.setItem(submissionId, JSON.stringify(submission));
      addToHistory('Rejected', submission.ownerName, `Rejected property submission for ${submission.city}`);
      loadPropertySubmissions();
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
  };

  const handleOpenEstimate = (property) => {
    setSelectedProperty(property);
    const costs = {};
    property.improvements?.forEach(imp => {
      costs[imp] = '';
    });
    setEstimateData({
      improvementCosts: costs,
      totalCost: '',
      valueIncreasePercent: '',
      estimatedNewValue: '',
      adminNotes: ''
    });
    setShowEstimateModal(true);
  };

  const handleEstimateChange = (field, value) => {
    setEstimateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImprovementCostChange = (improvement, value) => {
    setEstimateData(prev => ({
      ...prev,
      improvementCosts: {
        ...prev.improvementCosts,
        [improvement]: value
      }
    }));
  };

  const calculateTotalCost = () => {
    const total = Object.values(estimateData.improvementCosts)
      .reduce((sum, cost) => sum + (parseInt(cost) || 0), 0);
    setEstimateData(prev => ({ ...prev, totalCost: total.toString() }));
  };

  const calculateNewValue = () => {
    if (selectedProperty?.propertyValue && estimateData.valueIncreasePercent) {
      const currentValue = parseInt(selectedProperty.propertyValue);
      const increasePercent = parseFloat(estimateData.valueIncreasePercent);
      const newValue = Math.round(currentValue * (1 + increasePercent / 100));
      setEstimateData(prev => ({ ...prev, estimatedNewValue: newValue.toString() }));
    }
  };

  const handleSaveEstimate = () => {
    if (!selectedProperty) return;

    // Update the submission with estimate data
    const updatedSubmission = {
      ...selectedProperty,
      status: 'Estimated',
      adminEstimate: {
        improvementCosts: estimateData.improvementCosts,
        totalCost: estimateData.totalCost,
        valueIncreasePercent: estimateData.valueIncreasePercent,
        estimatedNewValue: estimateData.estimatedNewValue,
        adminNotes: estimateData.adminNotes,
        estimatedDate: new Date().toISOString(),
        estimatedBy: userData?.email || localStorage.getItem('userEmail')
      }
    };

    localStorage.setItem(selectedProperty.id, JSON.stringify(updatedSubmission));

    // Update homeowner's property data if it's their current submission
    const homeownerEmail = selectedProperty.ownerEmail;
    const homeownerPropertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    if (homeownerPropertyData.ownerEmail === homeownerEmail) {
      homeownerPropertyData.adminEstimate = updatedSubmission.adminEstimate;
      homeownerPropertyData.status = 'Estimated';
      localStorage.setItem('propertyData', JSON.stringify(homeownerPropertyData));
    }

    // Save to homeowner-specific estimates
    const homeownerEstimates = JSON.parse(localStorage.getItem(`estimates_${homeownerEmail}`) || '[]');
    homeownerEstimates.unshift({
      submissionId: selectedProperty.id,
      ...updatedSubmission.adminEstimate,
      propertyType: selectedProperty.propertyType,
      city: selectedProperty.city
    });
    localStorage.setItem(`estimates_${homeownerEmail}`, JSON.stringify(homeownerEstimates));

    // Add homeowner history entry with property details
    const homeownerHistory = JSON.parse(localStorage.getItem(`homeownerHistory_${homeownerEmail}`) || '[]');
    homeownerHistory.unshift({
      id: Date.now(),
      action: 'Estimate Received',
      details: `Admin provided cost estimate: ₹${parseInt(estimateData.totalCost).toLocaleString('en-IN')} with ${estimateData.valueIncreasePercent}% value increase`,
      propertyDetails: {
        propertyType: selectedProperty.propertyType,
        city: selectedProperty.city,
        state: selectedProperty.state,
        propertyValue: selectedProperty.propertyValue,
        builtUpArea: selectedProperty.builtUpArea,
        improvements: selectedProperty.improvements
      },
      estimateData: {
        totalCost: estimateData.totalCost,
        valueIncreasePercent: estimateData.valueIncreasePercent,
        estimatedNewValue: estimateData.estimatedNewValue,
        improvementCosts: estimateData.improvementCosts
      },
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`homeownerHistory_${homeownerEmail}`, JSON.stringify(homeownerHistory.slice(0, 50)));

    addToHistory('Estimate Provided', selectedProperty.ownerName, `Total: ₹${parseInt(estimateData.totalCost).toLocaleString('en-IN')}, Value Increase: ${estimateData.valueIncreasePercent}%`);

    setShowEstimateModal(false);
    loadPropertySubmissions();
    alert('Estimate saved and sent to homeowner successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const statsDisplay = [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers },
    { icon: '🏠', label: 'Properties', value: stats.totalProperties },
    { icon: '✅', label: 'Approved', value: stats.completed },
    { icon: '⏳', label: 'Pending', value: stats.inProgress }
  ];

  return (
    <div className="admin-dashboard-page">
      <nav>
        <Link to="/" className="logo">PropElevate</Link>
        <div className="user-info">
          <span>👤 {userData?.fullName || userData?.email || 'Administrator'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="header-section">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage properties and homeowner requests</p>
        </div>

        <div className="stats-grid">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-details">
                <h3>{stat.label}</h3>
                <p>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            📋 Property Submissions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
        </div>

        {activeTab === 'submissions' && (
          <div className="section">
            <div className="section-header">
              <h2>Property Submissions</h2>
              <button className="refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
            </div>
            
            {propertySubmissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Property Submissions Yet</h3>
                <p>Waiting for homeowners to submit their property details</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="properties-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Property Type</th>
                      <th>Value (₹)</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertySubmissions.map(property => (
                      <tr key={property.id}>
                        <td>
                          <div className="owner-info">
                            <div className="owner-name">{property.ownerName}</div>
                            <div className="owner-email">{property.ownerEmail}</div>
                          </div>
                        </td>
                        <td>{formatPropertyType(property.propertyType)}</td>
                        <td>₹{parseInt(property.propertyValue).toLocaleString('en-IN')}</td>
                        <td>{property.city}, {property.state}</td>
                        <td>
                          <span className={`status-badge ${(property.status || 'Pending Review').toLowerCase().replace(' ', '-')}`}>
                            {property.status || 'Pending Review'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {(property.status === 'Approved' || property.status === 'Estimated') && (
                              <button 
                                className="action-btn details-btn" 
                                onClick={() => handleViewDetails(property)}
                                title="View Details"
                              >
                                VIEW DETAILS
                              </button>
                            )}
                            {property.status === 'Approved' && (
                              <button 
                                className="action-btn estimate-btn" 
                                onClick={() => handleOpenEstimate(property)}
                                title="Provide Estimate"
                              >
                                💰 ESTIMATE
                              </button>
                            )}
                            {property.status !== 'Approved' && property.status !== 'Estimated' && (
                              <>
                                <button 
                                  className="action-btn approve-btn" 
                                  onClick={() => handleApprove(property.id)}
                                  title="Approve"
                                >
                                  ✓
                                </button>
                                <button 
                                  className="action-btn reject-btn" 
                                  onClick={() => handleReject(property.id)}
                                  title="Reject"
                                >
                                  ✗
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="section">
            <div className="section-header">
              <h2>Admin Activity History</h2>
            </div>
            {adminHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No History Yet</h3>
                <p>Your actions will appear here</p>
              </div>
            ) : (
              <div className="history-list">
                {adminHistory.map(entry => (
                  <div key={entry.id} className="history-item">
                    <div className="history-icon">
                      {entry.action === 'Approved' ? '✅' : entry.action === 'Rejected' ? '❌' : '💰'}
                    </div>
                    <div className="history-content">
                      <div className="history-action">{entry.action}</div>
                      <div className="history-owner">{entry.propertyOwner}</div>
                      <div className="history-details">{entry.details}</div>
                      <div className="history-time">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => setActiveTab('submissions')}>
              <span className="action-icon">📋</span>
              <span>View Submissions</span>
            </button>
            <button className="action-card" onClick={() => setActiveTab('history')}>
              <span className="action-icon">📜</span>
              <span>View History</span>
            </button>
            <button className="action-card" onClick={handleRefresh}>
              <span className="action-icon">🔄</span>
              <span>Refresh Data</span>
            </button>
            <button className="action-card">
              <span className="action-icon">📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Property Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Owner Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedProperty.ownerName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedProperty.ownerEmail}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Property Type</label>
                    <span>{formatPropertyType(selectedProperty.propertyType)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Property Value</label>
                    <span>₹{parseInt(selectedProperty.propertyValue).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Property Age</label>
                    <span>{selectedProperty.propertyAge} years</span>
                  </div>
                  <div className="detail-item">
                    <label>Built-up Area</label>
                    <span>{selectedProperty.builtUpArea} sq ft</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Property Address</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <label>Street</label>
                    <span>{selectedProperty.street || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>City</label>
                    <span>{selectedProperty.city}</span>
                  </div>
                  <div className="detail-item">
                    <label>State</label>
                    <span>{selectedProperty.state}</span>
                  </div>
                  <div className="detail-item">
                    <label>PIN Code</label>
                    <span>{selectedProperty.pinCode || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Locality</label>
                    <span>{selectedProperty.locality || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Desired Improvements ({selectedProperty.improvements?.length || 0})</h3>
                <div className="improvements-grid">
                  {selectedProperty.improvements?.map((imp, index) => (
                    <div key={index} className="improvement-tag">{imp}</div>
                  ))}
                </div>
              </div>

              {selectedProperty.notes && (
                <div className="detail-section">
                  <h3>Additional Notes</h3>
                  <p className="notes-text">{selectedProperty.notes}</p>
                </div>
              )}

              {selectedProperty.adminEstimate && (
                <div className="detail-section estimate-section">
                  <h3>Admin Estimate</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Total Cost</label>
                      <span className="highlight">₹{parseInt(selectedProperty.adminEstimate.totalCost).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Value Increase</label>
                      <span className="highlight">{selectedProperty.adminEstimate.valueIncreasePercent}%</span>
                    </div>
                    <div className="detail-item">
                      <label>Estimated New Value</label>
                      <span className="highlight">₹{parseInt(selectedProperty.adminEstimate.estimatedNewValue).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {selectedProperty.adminEstimate.adminNotes && (
                    <div className="detail-item full-width">
                      <label>Admin Notes</label>
                      <span>{selectedProperty.adminEstimate.adminNotes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedProperty.status === 'Approved' && !selectedProperty.adminEstimate && (
                <button className="btn btn-primary" onClick={() => { setShowDetailsModal(false); handleOpenEstimate(selectedProperty); }}>
                  Provide Estimate
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Estimate Modal */}
      {showEstimateModal && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowEstimateModal(false)}>
          <div className="modal-content estimate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Provide Cost Estimate</h2>
              <button className="close-btn" onClick={() => setShowEstimateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="estimate-info">
                <p><strong>Property:</strong> {formatPropertyType(selectedProperty.propertyType)} in {selectedProperty.city}</p>
                <p><strong>Owner:</strong> {selectedProperty.ownerName}</p>
                <p><strong>Current Value:</strong> ₹{parseInt(selectedProperty.propertyValue).toLocaleString('en-IN')}</p>
              </div>

              <div className="estimate-section">
                <h3>Cost for Each Improvement</h3>
                <div className="improvement-costs">
                  {selectedProperty.improvements?.map((improvement, index) => (
                    <div key={index} className="cost-input-group">
                      <label>{improvement}</label>
                      <div className="cost-input">
                        <span>₹</span>
                        <input
                          type="number"
                          placeholder="Enter cost"
                          value={estimateData.improvementCosts[improvement] || ''}
                          onChange={(e) => handleImprovementCostChange(improvement, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary calculate-btn" onClick={calculateTotalCost}>
                  Calculate Total Cost
                </button>
              </div>

              <div className="estimate-section">
                <h3>Value Estimation</h3>
                <div className="estimate-grid">
                  <div className="estimate-input-group">
                    <label>Total Improvement Cost (₹)</label>
                    <input
                      type="number"
                      value={estimateData.totalCost}
                      onChange={(e) => handleEstimateChange('totalCost', e.target.value)}
                      placeholder="Total cost"
                    />
                  </div>
                  <div className="estimate-input-group">
                    <label>Value Increase (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={estimateData.valueIncreasePercent}
                      onChange={(e) => handleEstimateChange('valueIncreasePercent', e.target.value)}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <button className="btn btn-secondary calculate-btn" onClick={calculateNewValue}>
                    Calculate New Value
                  </button>
                  <div className="estimate-input-group">
                    <label>Estimated New Property Value (₹)</label>
                    <input
                      type="number"
                      value={estimateData.estimatedNewValue}
                      onChange={(e) => handleEstimateChange('estimatedNewValue', e.target.value)}
                      placeholder="New value"
                    />
                  </div>
                </div>
              </div>

              <div className="estimate-section">
                <h3>Additional Notes</h3>
                <textarea
                  rows="3"
                  value={estimateData.adminNotes}
                  onChange={(e) => handleEstimateChange('adminNotes', e.target.value)}
                  placeholder="Any additional notes for the homeowner..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSaveEstimate}>
                💾 Save & Update to Homeowner
              </button>
              <button className="btn btn-secondary" onClick={() => setShowEstimateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
