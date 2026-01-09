import { useState } from 'react';
import './Login.css';
import apiService from './services/api';

function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // List of ING colleges
    const colleges = [
        {
            name: "Herald College Kathmandu",
            domain: "heraldcollege.edu.np",
            logo: "🎓",
            shortName: "Herald",
        },
        {
            name: "Islington College",
            domain: "islington.edu.np",
            logo: "🏛️",
            shortName: "Islington",
        },
        {
            name: "Itahari International College",
            domain: "iic.edu.np",
            logo: "🌐",
            shortName: "IIC",
        },
        {
            name: "Apex College",
            domain: "apex.edu.np",
            logo: "⛰️",
            shortName: "Apex",
        },
        {
            name: "Kavya School",
            domain: "kavya.edu.np",
            logo: "📚",
            shortName: "Kavya",
        },
        {
            name: "Biratnagar International College",
            domain: "bic.edu.np",
            logo: "🎯",
            shortName: "BIC",
        },
    ];

    // Predefined admin accounts
    const adminAccounts = [
        { email: 'admin@heraldcollege.edu.np', password: 'admin123', name: 'Herald Admin', college: 'Herald College Kathmandu', logo: '🎓' },
        { email: 'admin@islington.edu.np', password: 'admin123', name: 'Islington Admin', college: 'Islington College', logo: '🏛️' },
        { email: 'admin@iic.edu.np', password: 'admin123', name: 'IIC Admin', college: 'Itahari International College', logo: '🌐' },
        { email: 'admin@apex.edu.np', password: 'admin123', name: 'Apex Admin', college: 'Apex College', logo: '⛰️' },
        { email: 'admin@kavya.edu.np', password: 'admin123', name: 'Kavya Admin', college: 'Kavya School', logo: '📚' },
        { email: 'admin@bic.edu.np', password: 'admin123', name: 'BIC Admin', college: 'Biratnagar International College', logo: '🎯' }
    ];

    const handleCollegeSelect = (college) => {
        setSelectedCollege(college.name);
        setShowCollegeDropdown(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!selectedCollege) {
            setError('Please select your college first');
            setLoading(false);
            return;
        }

        try {
            const response = await apiService.login({
                email,
                password,
                role: 'admin',
                college: selectedCollege
            });

            if (response.success) {
                // Store user data
                localStorage.setItem('currentUser', JSON.stringify({
                    ...response.user,
                    loginTime: new Date().toISOString()
                }));

                alert(`Welcome ${response.user.name}! Redirecting to admin dashboard...`);
                window.location.hash = 'admin-dashboard';
            }
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedCollegeData = colleges.find(c => c.name === selectedCollege);

    return (
        <div className="login-container">
            <div className="login-wrapper">

                {/* Left Side - Image */}
                <div className="login-image-section">
                    <div className="image-content">
                        <h1>Admin Portal</h1>
                        <p>Manage your college's lost & found</p>
                        <div className="ing-badge">ING Colleges Network</div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-section">
                    <div className="login-header">
                        <h2>Admin Login</h2>
                        <p>Sign in to manage your college's system.</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="college">Select Your College</label>
                            <div className="college-selector">
                                <div
                                    className="college-selected"
                                    onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                                >
                                    {selectedCollegeData ? (
                                        <>
                                            <span className="college-logo">
                                                {selectedCollegeData.logo}
                                            </span>
                                            <span className="college-name">
                                                {selectedCollegeData.name}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="placeholder">Choose your college...</span>
                                    )}
                                    <span className="dropdown-arrow">▼</span>
                                </div>

                                {showCollegeDropdown && (
                                    <div className="college-dropdown">
                                        {colleges.map((college) => (
                                            <div
                                                key={college.name}
                                                className="college-option"
                                                onClick={() => handleCollegeSelect(college)}
                                            >
                                                <span className="college-logo">{college.logo}</span>
                                                <div className="college-info">
                                                    <span className="college-name">{college.name}</span>
                                                    <span className="college-domain">
                                                        @{college.domain}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Admin Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="admin@college.edu.np"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In as Admin'}
                        </button>
                    </form>



                    <p className="login-footer">
                    </p>
                </div>

            </div>
        </div>
    );
}

export default AdminLogin;