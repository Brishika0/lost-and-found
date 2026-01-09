import { useState } from 'react';
import './Login.css';

function StudentLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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

    // Predefined student accounts
    const studentAccounts = [
        { email: 'student@heraldcollege.edu.np', password: 'student123', name: 'John Doe', college: 'Herald College Kathmandu' },
        { email: 'student@islington.edu.np', password: 'student123', name: 'Jane Smith', college: 'Islington College' },
        { email: 'student@iic.edu.np', password: 'student123', name: 'Mike Johnson', college: 'Itahari International College' },
        { email: 'student@apex.edu.np', password: 'student123', name: 'Sarah Wilson', college: 'Apex College' },
        { email: 'student@kavya.edu.np', password: 'student123', name: 'David Brown', college: 'Kavya School' },
        { email: 'student@bic.edu.np', password: 'student123', name: 'Lisa Davis', college: 'Biratnagar International College' }
    ];

    const handleCollegeSelect = (college) => {
        setSelectedCollege(college.name);
        setShowCollegeDropdown(false);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCollege) {
            setError('Please select your college first');
            return;
        }

        const student = studentAccounts.find(acc => acc.email === email && acc.password === password && acc.college === selectedCollege);

        if (student) {
            // Store student data
            localStorage.setItem('currentUser', JSON.stringify({
                ...student,
                role: 'student',
                loginTime: new Date().toISOString()
            }));

            alert(`Welcome ${student.name}! Redirecting to student dashboard...`);
            window.location.hash = 'student-dashboard';
        } else {
            setError('Invalid email, password, or college selection');
        }
    };

    const selectedCollegeData = colleges.find(c => c.name === selectedCollege);

    return (
        <div className="login-container">
            <div className="login-wrapper">

                {/* Left Side - Image */}
                <div className="login-image-section">
                    <div className="image-content">
                        <h1>Student Portal</h1>
                        <p>Report and find your lost items</p>
                        <div className="ing-badge">ING Colleges Network</div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-section">
                    <div className="login-header">
                        <h2>Student Login</h2>
                        <p>Sign in to access your student account.</p>
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
                            <label htmlFor="email">Student Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="student@college.edu.np"
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

                        <button type="submit" className="submit-btn">
                            Sign In as Student
                        </button>
                    </form>

                    <p className="login-footer">
                        <a href="#admin-login">Admin Login</a> | <a href="#superadmin-login">Super Admin Login</a>
                    </p>

                    <div className="login-footer">
                        <p>&copy; 2024 ING Colleges Network. All rights reserved.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default StudentLogin;