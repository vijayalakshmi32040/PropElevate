import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomeownerForm.css';

const HomeownerForm = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    propertyType: '',
    propertyValue: '',
    propertyAge: '',
    builtUpArea: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    locality: '',
    notes: ''
  });
  
  const [selectedImprovements, setSelectedImprovements] = useState([]);

  const availableUpdates = [
    "Kitchen Renovation", "Bathroom Upgrade", "Living Room Makeover",
    "Bedroom Enhancement", "Flooring Replacement", "Wall Painting",
    "Ceiling Work", "Electrical Upgrades", "Plumbing Improvements",
    "Balcony Renovation", "Terrace Waterproofing", "Window Replacement",
    "Door Upgrades", "Lighting Enhancement", "Air Conditioning Installation",
    "Modular Kitchen", "Wardrobes Installation", "False Ceiling",
    "Home Automation", "Security Systems"
  ];

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login?type=homeowner');
      return;
    }

    // Load user data
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (improvement) => {
    if (selectedImprovements.includes(improvement)) {
      setSelectedImprovements(selectedImprovements.filter(i => i !== improvement));
    } else {
      setSelectedImprovements([...selectedImprovements, improvement]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate unique submission ID
    const submissionId = `propertySubmission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare submission data with owner information
    const submissionData = {
      ...formData,
      improvements: selectedImprovements,
      ownerName: userData?.fullName || 'Homeowner',
      ownerEmail: userData?.email || localStorage.getItem('userEmail'),
      submissionDate: new Date().toISOString(),
      status: 'Pending Review'
    };
    
    // Save to localStorage with unique key for admin to access
    localStorage.setItem(submissionId, JSON.stringify(submissionData));
    
    // Also save as current user's property data (per user email)
    const userEmail = userData?.email || localStorage.getItem('userEmail');
    localStorage.setItem(`propertyData_${userEmail}`, JSON.stringify(submissionData));
    localStorage.setItem('propertyData', JSON.stringify(submissionData));

    // Add initial homeowner history entry for this submission
    const homeownerHistory = JSON.parse(localStorage.getItem(`homeownerHistory_${userEmail}`) || '[]');
    homeownerHistory.unshift({
      id: Date.now(),
      action: 'Submission',
      details: 'You submitted your property details for review',
      propertyDetails: {
        propertyType: submissionData.propertyType,
        city: submissionData.city,
        state: submissionData.state,
        propertyValue: submissionData.propertyValue,
        builtUpArea: submissionData.builtUpArea,
        improvements: submissionData.improvements
      },
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`homeownerHistory_${userEmail}`, JSON.stringify(homeownerHistory.slice(0, 50)));
    
    // Redirect to dashboard
    navigate('/homeowner-dashboard');
  };

  return (
    <div className="homeowner-form-page">
      <nav>
        <Link to="/" className="logo">PropElevate</Link>
        <div className="user-info">
          <span>Welcome, {userData?.fullName || localStorage.getItem('userName') || 'Homeowner'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="form-container">
        <h1>Property Details Form</h1>
        <p className="form-subtitle">Help us understand your property better</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Property Type *</label>
                <select 
                  name="propertyType" 
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="independent-house">Independent House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Property Value (₹) *</label>
                <input 
                  type="number" 
                  name="propertyValue"
                  value={formData.propertyValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000000" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Property Age (Years) *</label>
                <input 
                  type="number" 
                  name="propertyAge"
                  value={formData.propertyAge}
                  onChange={handleInputChange}
                  placeholder="e.g., 10" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Built-up Area (sq ft) *</label>
                <input 
                  type="number" 
                  name="builtUpArea"
                  value={formData.builtUpArea}
                  onChange={handleInputChange}
                  placeholder="e.g., 1200" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Property Address */}
          <div className="form-section">
            <h2>Property Address</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address *</label>
                <input 
                  type="text" 
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text" 
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>PIN Code *</label>
                <input 
                  type="text" 
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  placeholder="Enter PIN code" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Locality</label>
                <input 
                  type="text" 
                  name="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                  placeholder="Enter locality" 
                />
              </div>
            </div>
          </div>

          {/* Desired Improvements */}
          <div className="form-section">
            <h2>Desired Improvements</h2>
            <div className="improvements-grid">
              {availableUpdates.map((improvement, index) => (
                <label key={index} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedImprovements.includes(improvement)}
                    onChange={() => handleCheckboxChange(improvement)}
                  />
                  <span>{improvement}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group">
              <label>Any specific requirements or notes?</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="5"
                placeholder="Tell us more about your requirements..."
              ></textarea>
            </div>
          </div>

          <button type="submit" className="submit-btn">Submit & View Dashboard</button>
        </form>
      </div>
    </div>
  );
};

export default HomeownerForm;
