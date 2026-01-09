import { useState, useEffect } from 'react';
import './LandingPage.css';

function LandingPage() {
    const [connectionStatus, setConnectionStatus] = useState({
        backend: 'testing',
        database: 'testing',
        frontend: 'connected'
    });

    useEffect(() => {
        testConnections();
    }, []);

    const testConnections = async () => {
        try {
            // Test backend connection
            const response = await fetch('http://localhost:5000/api/test');
            const data = await response.json();

            if (data.success) {
                setConnectionStatus(prev => ({
                    ...prev,
                    backend: 'connected',
                    database: 'connected'
                }));
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            setConnectionStatus(prev => ({
                ...prev,
                backend: 'failed',
                database: 'failed'
            }));
        }
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'connected': return 'active';
            case 'failed': return 'failed';
            case 'testing': return 'testing';
            default: return 'unknown';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'connected': return 'Connected';
            case 'failed': return 'Failed';
            case 'testing': return 'Testing...';
            default: return 'Unknown';
        }
    };
    return (
        <div className="landing-container">
            <div className="landing-header">
                <h1>🎓 ING Colleges Lost & Found System</h1>
                <p>Connecting students, admins, and institutions to reunite lost items</p>
            </div>

            <div className="login-options">
                <div className="login-card" onClick={() => window.location.hash = 'student-login'}>
                    <div className="card-icon">👨‍🎓</div>
                    <h3>Student Portal</h3>
                    <p>Report lost items, search for found items, and manage your account</p>
                    <button className="login-btn student-btn">Student Login</button>
                </div>

                <div className="login-card" onClick={() => window.location.hash = 'admin-login'}>
                    <div className="card-icon">👤</div>
                    <h3>Admin Portal</h3>
                    <p>Manage your college's lost & found system and help students</p>
                    <button className="login-btn admin-btn">Admin Login</button>
                </div>

                <div className="login-card" onClick={() => window.location.hash = 'superadmin-login'}>
                    <div className="card-icon">🔑</div>
                    <h3>Super Admin Portal</h3>
                    <p>Manage the entire ING network, colleges, and administrators</p>
                    <button className="login-btn superadmin-btn">Super Admin Login</button>
                </div>
            </div>

            <div className="demo-credentials">
                <h3>🔐 Demo Credentials</h3>
                <div className="credentials-grid">
                    <div className="credential-item">
                        <strong>Super Admin:</strong>
                        <br />Email: superadmin@ing.edu.np
                        <br />Password: superadmin123
                    </div>
                    <div className="credential-item">
                        <strong>Admin (Herald):</strong>
                        <br />Email: admin@heraldcollege.edu.np
                        <br />Password: admin123
                    </div>
                    <div className="credential-item">
                        <strong>Student (Herald):</strong>
                        <br />Email: john.doe@heraldcollege.edu.np
                        <br />Password: student123
                    </div>
                </div>
            </div>

            <div className="system-status">
                <div className="status-item">
                    <span className={`status-dot ${getStatusDot(connectionStatus.backend)}`}></span>
                    Backend Server: {getStatusText(connectionStatus.backend)}
                </div>
                <div className="status-item">
                    <span className={`status-dot ${getStatusDot(connectionStatus.database)}`}></span>
                    Database: {getStatusText(connectionStatus.database)}
                </div>
                <div className="status-item">
                    <span className={`status-dot ${getStatusDot(connectionStatus.frontend)}`}></span>
                    Frontend: {getStatusText(connectionStatus.frontend)}
                </div>
                <button
                    onClick={testConnections}
                    style={{
                        marginLeft: '1rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Test Connection
                </button>
            </div>
        </div>
    );
}

export default LandingPage;