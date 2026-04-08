import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [designAdvisors, setDesignAdvisors] = useState([]);
  const [propertySubmissions, setPropertySubmissions] = useState([]);
  const [adminHistory, setAdminHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdvisors: 0,
    totalSubmissions: 0,
    estimatesProvided: 0
  });

  useEffect(() => {
    // Check if user is logged in as super-admin
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'super-admin') {
      navigate('/login?type=super-admin');
      return;
    }

    // Load user data
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Load all data
    loadAllData();
  }, [navigate]);

  const loadAllData = () => {
    // Load all users (homeowners + design advisors from registered users)
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    const users = [];
    const advisors = [];

    Object.entries(registeredUsers).forEach(([key, user]) => {
      const roleType = key.split('_')[0]; // Extract role from key (homeowner_email or admin_email)
      if (roleType === 'admin') {
        advisors.push({
          ...user,
          id: key,
          email: key.split('_')[1]
        });
      } else if (roleType === 'homeowner') {
        users.push({
          ...user,
          id: key,
          email: key.split('_')[1]
        });
      }
    });

    setAllUsers(users);
    setDesignAdvisors(advisors);

    // Load property submissions
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

    setPropertySubmissions(submissions);

    // Calculate stats
    const estimatedCount = submissions.filter(s => s.status === 'Estimated').length;
    setStats({
      totalUsers: users.length,
      totalAdvisors: advisors.length,
      totalSubmissions: submissions.length,
      estimatesProvided: estimatedCount
    });

    // Load admin history
    const history = JSON.parse(localStorage.getItem('adminHistory') || '[]');
    setAdminHistory(history.slice(0, 10));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handleRefresh = () => {
    loadAllData();
    window.scrollTo(0, 0);
  };

  const statsDisplay = [
    { icon: '👥', label: 'Total Homeowners', value: stats.totalUsers },
    { icon: '👨‍💼', label: 'Design Advisors', value: stats.totalAdvisors },
    { icon: '🏠', label: 'Submissions', value: stats.totalSubmissions },
    { icon: '✅', label: 'Estimates Provided', value: stats.estimatesProvided }
  ];

  return (
    <div className="admin-dashboard-page">
      <nav>
        <Link to="/" className="logo">PropElevate</Link>
        <div className="user-info">
          <span>🔐 {userData?.fullName || userData?.email || 'Administrator'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="header-section">
          <h1>Platform Administration Dashboard</h1>
          <p className="subtitle">Complete platform oversight and management</p>
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
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Homeowners
          </button>
          <button 
            className={`tab-btn ${activeTab === 'advisors' ? 'active' : ''}`}
            onClick={() => setActiveTab('advisors')}
          >
            👨‍💼 Design Advisors
          </button>
          <button 
            className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            📋 Submissions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Activity Log
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="section">
            <div className="section-header">
              <h2>System Overview</h2>
              <button className="refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
            </div>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Platform Status</h3>
                <p className="status-good">✓ All Systems Operational</p>
                <small>Last updated: {new Date().toLocaleString()}</small>
              </div>
              <div className="overview-card">
                <h3>Quick Stats</h3>
                <p>Total Users: <strong>{stats.totalUsers + stats.totalAdvisors}</strong></p>
                <p>Active Submissions: <strong>{stats.totalSubmissions}</strong></p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="section">
            <div className="section-header">
              <h2>Homeowners ({allUsers.length})</h2>
              <button className="refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
            </div>
            {allUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Homeowners Yet</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="properties-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.fullName || 'N/A'}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'advisors' && (
          <div className="section">
            <div className="section-header">
              <h2>Design Advisors ({designAdvisors.length})</h2>
              <button className="refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
            </div>
            {designAdvisors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍💼</div>
                <h3>No Design Advisors Yet</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="properties-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designAdvisors.map(advisor => (
                      <tr key={advisor.id}>
                        <td>{advisor.fullName || 'N/A'}</td>
                        <td>{advisor.email || 'N/A'}</td>
                        <td>{advisor.phone || 'N/A'}</td>
                        <td>{advisor.createdAt ? new Date(advisor.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="section">
            <div className="section-header">
              <h2>Property Submissions ({propertySubmissions.length})</h2>
              <button className="refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
            </div>
            {propertySubmissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Submissions Yet</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="properties-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Property</th>
                      <th>Location</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertySubmissions.map(submission => (
                      <tr key={submission.id}>
                        <td>{submission.ownerName || 'N/A'}</td>
                        <td>{submission.propertyType ? submission.propertyType.toUpperCase() : 'N/A'}</td>
                        <td>{submission.city || 'N/A'}</td>
                        <td>₹{submission.propertyValue ? parseInt(submission.propertyValue).toLocaleString('en-IN') : 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${(submission.status || 'pending').toLowerCase().replace(/\s/g, '-')}`}>
                            {submission.status || 'Pending Review'}
                          </span>
                        </td>
                        <td>{submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : 'N/A'}</td>
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
              <h2>Activity Log</h2>
            </div>
            {adminHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📜</div>
                <h3>No Activity Yet</h3>
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
            <button className="action-card" onClick={() => setActiveTab('overview')}>
              <span className="action-icon">📊</span>
              <span>View Overview</span>
            </button>
            <button className="action-card" onClick={() => setActiveTab('submissions')}>
              <span className="action-icon">📋</span>
              <span>View Submissions</span>
            </button>
            <button className="action-card" onClick={handleRefresh}>
              <span className="action-icon">🔄</span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
