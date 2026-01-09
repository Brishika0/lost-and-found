import { useState } from 'react';
import './Login.css';
import apiService from './services/api';

function SuperAdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiService.login({
                email,
                password,
                role: 'superadmin'
            });

            if (response.success) {
                // Store user data
                localStorage.setItem('currentUser', JSON.stringify({
                    ...response.user,
                    loginTime: new Date().toISOString()
                }));

                alert(`Welcome ${response.user.name}! Redirecting to super admin dashboard...`);
                window.location.hash = 'superadmin';
            }
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">

                {/* Left Side - Image */}
                <div className="login-image-section">
                    <div className="image-content">
                        <h1>Super Admin Portal</h1>
                        <p>Manage all ING colleges</p>
                        <div className="ing-badge">ING Colleges Network</div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-section">
                    <div className="login-header">
                        <h2>Super Admin Login</h2>
                        <p>Sign in to manage the entire network.</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Super Admin Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="superadmin@ing.edu.np"
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
                            {loading ? 'Signing In...' : 'Sign In as Super Admin'}
                        </button>
                    </form>



                    <p className="login-footer">
                    </p>
                </div>

            </div>
        </div>
    );
}

export default SuperAdminLogin;