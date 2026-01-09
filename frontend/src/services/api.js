const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Set authorization header
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Update token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        console.log('🔗 API Request:', {
            method: config.method || 'GET',
            url,
            headers: config.headers
        });

        try {
            const response = await fetch(url, config);

            console.log('📡 API Response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ API Error:', data);
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('✅ API Success:', data);
            return data;
        } catch (error) {
            console.error('🚨 Network Error:', {
                message: error.message,
                url,
                config
            });

            // Provide more specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please check if the backend is running on http://localhost:5000');
            }

            throw error;
        }
    }

    // Auth methods
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (response.success && response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('currentUser');
    }

    // Admin methods
    async getAdminDashboard() {
        return this.request('/admin/dashboard');
    }

    async getAdminStudents() {
        return this.request('/admin/students');
    }

    async getAdminLostItems(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/lost-items${queryString ? `?${queryString}` : ''}`);
    }

    async updateItemStatus(itemId, statusData) {
        return this.request(`/admin/lost-items/${itemId}/status`, {
            method: 'PUT',
            body: JSON.stringify(statusData),
        });
    }

    // Super Admin methods
    async getSuperAdminDashboard() {
        return this.request('/superadmin/dashboard');
    }

    async getColleges() {
        return this.request('/superadmin/colleges');
    }

    async addCollege(collegeData) {
        return this.request('/superadmin/colleges', {
            method: 'POST',
            body: JSON.stringify(collegeData),
        });
    }

    async updateCollege(collegeId, collegeData) {
        return this.request(`/superadmin/colleges/${collegeId}`, {
            method: 'PUT',
            body: JSON.stringify(collegeData),
        });
    }

    async deleteCollege(collegeId) {
        return this.request(`/superadmin/colleges/${collegeId}`, {
            method: 'DELETE',
        });
    }

    async getCollegeAnalytics(collegeId) {
        return this.request(`/superadmin/colleges/${collegeId}/analytics`);
    }

    async addAdmin(adminData) {
        return this.request('/superadmin/admins', {
            method: 'POST',
            body: JSON.stringify(adminData),
        });
    }

    async removeAdmin(adminId) {
        return this.request(`/superadmin/admins/${adminId}`, {
            method: 'DELETE',
        });
    }

    async getAllStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/superadmin/students${queryString ? `?${queryString}` : ''}`);
    }

    async getAllLostItems(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/superadmin/lost-items${queryString ? `?${queryString}` : ''}`);
    }
}

export default new ApiService();