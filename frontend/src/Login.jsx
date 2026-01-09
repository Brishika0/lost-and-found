import { useState, useEffect } from 'react';
import './Login.css';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [userCollege, setUserCollege] = useState(null);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsedData = JSON.parse(userData);
            setUserCollege(parsedData.collegeData);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const email = e.target.email.value;

        // Check if user is super admin
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        if (admins.superadmin === email) {
            // Redirect to super admin dashboard
            window.location.hash = 'superadmin';
            return;
        }

        console.log("Login submitted!");
        alert('Login successful!');
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">

                {/* Left Side - Image */}
                <div className="login-image-section">
                    <div className="image-content">
                        <h1>Lost & Found System</h1>
                        <p>Welcome back! Sign in to continue</p>
                        <div className="ing-badge">ING Colleges Network</div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-section">
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue.</p>
                    </div>

                    {userCollege && (
                        <div className="college-badge">
                            <span className="college-logo">{userCollege.logo}</span>
                            <span className="college-name">{userCollege.name}</span>
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="your.email@college.edu.np"
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

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>

                        <button type="submit" className="submit-btn">
                            Sign In
                        </button>
                    </form>

                    <p className="login-footer">
                        Don't have an account? <a href="#signup">Sign Up</a>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;
