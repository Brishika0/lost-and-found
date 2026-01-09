import './Navigation.css';

function Navigation() {
    return (
        <div className="navigation-bar">
            <div className="nav-container">
                <div className="nav-brand">
                    <h2>🎓 ING Lost & Found</h2>
                </div>
                <div className="nav-links">
                    <a href="#student-login" className="nav-link">
                        👨‍🎓 Student Login
                    </a>
                    <a href="#admin-login" className="nav-link">
                        👤 Admin Login
                    </a>
                    <a href="#superadmin-login" className="nav-link">
                        🔑 Super Admin Login
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Navigation;