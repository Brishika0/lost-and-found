import { useState, useEffect } from 'react';
import './SuperAdminDashboard.css'; // Reusing the same styles
import apiService from './services/api';

function AdminDashboard() {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [students, setStudents] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load current user
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(user);

        if (user.role === 'admin') {
            loadDashboardData();
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [dashboardResponse, studentsResponse, itemsResponse] = await Promise.all([
                apiService.getAdminDashboard(),
                apiService.getAdminStudents(),
                apiService.getAdminLostItems()
            ]);

            if (dashboardResponse.success) {
                setDashboardData(dashboardResponse.data);
            }

            if (studentsResponse.success) {
                setStudents(studentsResponse.data);
            }

            if (itemsResponse.success) {
                setLostItems(itemsResponse.data.items);
            }
        } catch (error) {
            setError('Failed to load dashboard data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        apiService.logout();
        window.location.hash = 'admin-login';
    };

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            const response = await apiService.updateItemStatus(itemId, { status: newStatus });

            if (response.success) {
                // Reload lost items
                const itemsResponse = await apiService.getAdminLostItems();
                if (itemsResponse.success) {
                    setLostItems(itemsResponse.data.items);
                }
                alert('Item status updated successfully!');
            }
        } catch (error) {
            alert('Failed to update item status: ' + error.message);
        }
    };

    const renderOverview = () => {
        if (!dashboardData) return <div>Loading...</div>;

        const { stats, recentItems, college } = dashboardData;

        return (
            <div className="overview-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.totalStudents}</h3>
                            <p>Total Students</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.totalLostItems}</h3>
                            <p>Total Lost Items</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.foundItems}</h3>
                            <p>Found Items</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.claimedItems}</h3>
                            <p>Claimed Items</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.pendingItems}</h3>
                            <p>Pending Items</p>
                        </div>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Recent Lost Items</h3>
                    <div className="activity-list">
                        {recentItems.map(item => (
                            <div key={item._id} className="activity-item">
                                <div className="activity-info">
                                    <p><strong>{item.itemName}</strong> - {item.status}</p>
                                    <span className="activity-time">
                                        Reported by {item.reportedBy?.name} on {new Date(item.dateReported).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="activity-actions">
                                    {item.status === 'Lost' && (
                                        <button
                                            className="action-btn mark-found"
                                            onClick={() => handleStatusUpdate(item._id, 'Found')}
                                        >
                                            Mark Found
                                        </button>
                                    )}
                                    {item.status === 'Found' && (
                                        <button
                                            className="action-btn mark-claimed"
                                            onClick={() => handleStatusUpdate(item._id, 'Claimed')}
                                        >
                                            Mark Claimed
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderStudents = () => (
        <div className="students-section">
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student._id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                                        {student.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLostItems = () => (
        <div className="lost-items-section">
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Reported By</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lostItems.map(item => (
                            <tr key={item._id}>
                                <td>
                                    <div>
                                        <strong>{item.itemName}</strong>
                                        <br />
                                        <small>{item.description}</small>
                                    </div>
                                </td>
                                <td>{item.category}</td>
                                <td>{item.reportedBy?.name}</td>
                                <td>
                                    <span className={`status-badge ${item.status === 'Found' ? 'active' :
                                        item.status === 'Claimed' ? 'success' : 'inactive'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>{new Date(item.dateReported).toLocaleDateString()}</td>
                                <td>
                                    {item.status === 'Lost' && (
                                        <button
                                            className="action-btn"
                                            onClick={() => handleStatusUpdate(item._id, 'Found')}
                                        >
                                            Mark Found
                                        </button>
                                    )}
                                    {item.status === 'Found' && (
                                        <button
                                            className="action-btn"
                                            onClick={() => handleStatusUpdate(item._id, 'Claimed')}
                                        >
                                            Mark Claimed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="superadmin-dashboard">
                <div className="loading">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="superadmin-dashboard">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="superadmin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {currentUser?.name || 'Administrator'}</p>
                    <p>Managing {currentUser?.college}</p>
                </div>
                <div className="header-right">
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="dashboard-nav">
                <button
                    className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    Students
                </button>
                <button
                    className={`nav-tab ${activeTab === 'items' ? 'active' : ''}`}
                    onClick={() => setActiveTab('items')}
                >
                    Lost Items
                </button>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'students' && renderStudents()}
                {activeTab === 'items' && renderLostItems()}
            </div>
        </div>
    );
}

export default AdminDashboard;