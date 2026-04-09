const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || errorData.error || (response.status === 409 ? 'Email already exists' : `HTTP error! status: ${response.status}`);
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      // 204 No Content (e.g. DELETE) — return null, don't parse body
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store auth token and user ID
    if (response && response.id) {
      localStorage.setItem('authToken', response.id.toString());
      localStorage.setItem('userId', response.id.toString());
      localStorage.setItem('userData', JSON.stringify(response));
      localStorage.setItem('isLoggedIn', 'true');
    }

    return response;
  }

  async signup(userData) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response;
  }

  // Property endpoints
  async addProperty(propertyData) {
    return await this.request('/property/add', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async getAllProperties() {
    return await this.request('/property/all');
  }

  async getUserProperties(ownerId) {
    return await this.request(`/property/user/${ownerId}`);
  }

  // Estimate endpoints
  async saveEstimate(estimateData) {
    return await this.request('/estimate/save', {
      method: 'POST',
      body: JSON.stringify(estimateData),
    });
  }

  async getEstimate(propertyId) {
    return await this.request(`/estimate/property/${propertyId}`);
  }

  async deleteProperty(propertyId) {
    return await this.request(`/property/${propertyId}`, {
      method: 'DELETE',
    });
  }

  // Super Admin endpoints
  async getAllUsers() {
    return await this.request('/superadmin/users');
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
  }
}

export default new ApiService();