import { useState, useEffect } from 'react';
import './SuperAdminDashboard.css';
import apiService from './services/api';
import { BarChart, PieChart } from './components/Charts';

function SuperAdminDashboard() {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [students, setStudents] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // College management states
    const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
    const [showEditCollegeModal, setShowEditCollegeModal] = useState(false);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [collegeAnalytics, setCollegeAnalytics] = useState(null);
    const [collegeForm, setCollegeForm] = useState({
        name: '',
        domain: '',
        logo: '',
        shortName: ''
    });

    useEffect(() => {
        // Load current user
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(user);

        if (user.role === 'superadmin') {
            loadDashboardData();
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await apiService.getSuperAdminDashboard();

            if (response.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            setError('Failed to load dashboard data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        try {
            const response = await apiService.getAllStudents();
            if (response.success) {
                setStudents(response.data.students);
            }
        } catch (error) {
            setError('Failed to load students: ' + error.message);
        }
    };

    const loadLostItems = async () => {
        try {
            const response = await apiService.getAllLostItems();
            if (response.success) {
                setLostItems(response.data.items);
            }
        } catch (error) {
            setError('Failed to load lost items: ' + error.message);
        }
    };

    useEffect(() => {
        if (activeTab === 'students' && students.length === 0) {
            loadStudents();
        }
        if (activeTab === 'items' && lostItems.length === 0) {
            loadLostItems();
        }
    }, [activeTab]);

    const handleLogout = () => {
        apiService.logout();
        window.location.hash = 'superadmin-login';
    };

    // College management functions
    const viewCollegeAnalytics = async (collegeId) => {
        try {
            const response = await apiService.getCollegeAnalytics(collegeId);
            if (response.success) {
                setCollegeAnalytics(response.data);
                setShowAnalyticsModal(true);
            }
        } catch (error) {
            alert('Failed to load college analytics: ' + error.message);
        }
    };

    const editCollege = (college) => {
        setSelectedCollege(college);
        setCollegeForm({
            name: college.name,
            domain: college.domain,
            logo: college.logo,
            shortName: college.shortName
        });
        setShowEditCollegeModal(true);
    };

    const deleteCollege = async (college) => {
        if (window.confirm(`Are you sure you want to delete ${college.name}? This action cannot be undone.`)) {
            try {
                const response = await apiService.deleteCollege(college._id);
                if (response.success) {
                    await loadDashboardData();
                    alert('College deleted successfully!');
                }
            } catch (error) {
                alert('Failed to delete college: ' + error.message);
            }
        }
    };

    const handleAddCollege = async (e) => {
        e.preventDefault();
        try {
            const response = await apiService.addCollege(collegeForm);
            if (response.success) {
                await loadDashboardData();
                setShowAddCollegeModal(false);
                setCollegeForm({ name: '', domain: '', logo: '', shortName: '' });
                alert('College added successfully!');
            }
        } catch (error) {
            alert('Failed to add college: ' + error.message);
        }
    };

    const handleEditCollege = async (e) => {
        e.preventDefault();
        try {
            const response = await apiService.updateCollege(selectedCollege._id, collegeForm);
            if (response.success) {
                await loadDashboardData();
                setShowEditCollegeModal(false);
                setSelectedCollege(null);
                setCollegeForm({ name: '', domain: '', logo: '', shortName: '' });
                alert('College updated successfully!');
            }
        } catch (error) {
            alert('Failed to update college: ' + error.message);
        }
    };

    const getStats = () => {
        if (!dashboardData) return {};
        return dashboardData.stats;
    };

    const stats = getStats();

    const renderOverview = () => {
        if (!dashboardData) return <div className="loading">Loading overview data...</div>;

        const { stats, collegeAnalytics, categoryDistribution } = dashboardData;

        // Add safety checks
        if (!stats) {
            return <div className="error-message">No statistics data available</div>;
        }

        // Prepare data for charts
        const collegeStudentsData = collegeAnalytics?.map(college => ({
            label: college.shortName,
            value: college.studentCount,
            color: `hsl(${collegeAnalytics.indexOf(college) * 60}, 70%, 50%)`
        })) || [];

        const collegeLostItemsData = collegeAnalytics?.map(college => ({
            label: college.shortName,
            value: college.lostItemsCount,
            color: `hsl(${collegeAnalytics.indexOf(college) * 60 + 30}, 70%, 50%)`
        })) || [];

        const recoveryRateData = collegeAnalytics?.map(college => ({
            label: college.shortName,
            value: parseFloat(college.recoveryRate),
            color: parseFloat(college.recoveryRate) > 50 ? '#28a745' : '#ffc107'
        })) || [];

        const categoryData = categoryDistribution?.map((cat, index) => ({
            label: cat._id,
            value: cat.count,
            color: `hsl(${index * 45}, 65%, 55%)`
        })) || [];

        return (
            <div className="overview-section">
                {/* Overall Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.totalColleges}</h3>
                            <p>Total Colleges</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.collegesWithAdmins}</h3>
                            <p>Active Admins</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.totalStudents}</h3>
                            <p>Total Students</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.overallRecoveryRate}%</h3>
                            <p>Recovery Rate</p>
                        </div>
                    </div>
                </div>

                {/* College Analytics Charts */}
                <div className="analytics-grid">
                    <div className="analytics-row">
                        <div className="chart-section">
                            <BarChart
                                data={collegeStudentsData}
                                title="Students per College"
                                height={250}
                            />
                        </div>
                        <div className="chart-section">
                            <BarChart
                                data={collegeLostItemsData}
                                title="Lost Items per College"
                                height={250}
                            />
                        </div>
                    </div>

                    <div className="analytics-row">
                        <div className="chart-section">
                            <BarChart
                                data={recoveryRateData}
                                title="Recovery Rate by College (%)"
                                height={250}
                            />
                        </div>
                        <div className="chart-section">
                            <PieChart
                                data={categoryData}
                                title="Lost Items by Category"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderColleges = () => {
        if (!dashboardData) return <div className="loading">Loading colleges data...</div>;

        if (!dashboardData.colleges) {
            return <div className="error-message">No colleges data available</div>;
        }

        return (
            <div className="colleges-section">
                <div className="colleges-header">
                    <h2>College Management</h2>
                    <button
                        className="add-college-btn"
                        onClick={() => setShowAddCollegeModal(true)}
                    >
                        + Add New College
                    </button>
                </div>

                <div className="colleges-grid">
                    {dashboardData.colleges?.map((college) => {
                        const hasAdmin = college.adminId;
                        return (
                            <div key={college._id} className={`college-card ${hasAdmin ? 'has-admin' : 'no-admin'}`}>
                                <div className="college-header">
                                    <span className="college-logo">{college.logo}</span>
                                    <div className="college-info">
                                        <h3>{college.name}</h3>
                                        <p>@{college.domain}</p>
                                    </div>
                                    <div className="college-actions">
                                        <button
                                            className="action-btn view-btn"
                                            onClick={() => viewCollegeAnalytics(college._id)}
                                            title="View Analytics"
                                        >
                                            View
                                        </button>
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => editCollege(college)}
                                            title="Edit College"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => deleteCollege(college)}
                                            title="Delete College"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="admin-status">
                                    {hasAdmin ? (
                                        <div className="admin-details">
                                            <div className="status-badge active">Admin Active</div>
                                            <p><strong>Admin:</strong> {hasAdmin.name}</p>
                                        </div>
                                    ) : (
                                        <div className="no-admin-details">
                                            <div className="status-badge inactive">No Admin</div>
                                            <p>Needs administrator assignment</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
                            <th>College</th>
                            <th>Email</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student._id}>
                                <td>{student.name}</td>
                                <td>{student.college}</td>
                                <td>{student.email}</td>
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
                            <th>College</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lostItems.map(item => (
                            <tr key={item._id}>
                                <td>{item.itemName}</td>
                                <td>{item.college}</td>
                                <td>
                                    <span className={`status-badge ${item.status === 'Found' ? 'active' : 'inactive'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>{new Date(item.dateReported).toLocaleDateString()}</td>
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
                    <h1>Super Admin Dashboard</h1>
                    <p>Welcome back, {currentUser?.name || 'Super Administrator'}</p>
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
                    className={`nav-tab ${activeTab === 'colleges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('colleges')}
                >
                    Colleges
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
                {activeTab === 'colleges' && renderColleges()}
                {activeTab === 'students' && renderStudents()}
                {activeTab === 'items' && renderLostItems()}
            </div>

            {/* Add College Modal */}
            {showAddCollegeModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add New College</h3>
                            <button className="close-btn" onClick={() => setShowAddCollegeModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddCollege} className="modal-form">
                            <div className="form-group">
                                <label>College Name</label>
                                <input
                                    type="text"
                                    value={collegeForm.name}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                                    placeholder="Enter college name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Domain</label>
                                <input
                                    type="text"
                                    value={collegeForm.domain}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, domain: e.target.value })}
                                    placeholder="college.edu.np"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Short Name</label>
                                <input
                                    type="text"
                                    value={collegeForm.shortName}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, shortName: e.target.value })}
                                    placeholder="Short name or abbreviation"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Logo</label>
                                <input
                                    type="text"
                                    value={collegeForm.logo}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, logo: e.target.value })}
                                    placeholder="Logo"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddCollegeModal(false)}>Cancel</button>
                                <button type="submit">Add College</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit College Modal */}
            {showEditCollegeModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit College</h3>
                            <button className="close-btn" onClick={() => setShowEditCollegeModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleEditCollege} className="modal-form">
                            <div className="form-group">
                                <label>College Name</label>
                                <input
                                    type="text"
                                    value={collegeForm.name}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Domain</label>
                                <input
                                    type="text"
                                    value={collegeForm.domain}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, domain: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Short Name</label>
                                <input
                                    type="text"
                                    value={collegeForm.shortName}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, shortName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Logo</label>
                                <input
                                    type="text"
                                    value={collegeForm.logo}
                                    onChange={(e) => setCollegeForm({ ...collegeForm, logo: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditCollegeModal(false)}>Cancel</button>
                                <button type="submit">Update College</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* College Analytics Modal */}
            {showAnalyticsModal && collegeAnalytics && (
                <div className="modal-overlay">
                    <div className="modal analytics-modal">
                        <div className="modal-header">
                            <h3>College Analytics - {collegeAnalytics.college.name}</h3>
                            <button className="close-btn" onClick={() => setShowAnalyticsModal(false)}>×</button>
                        </div>
                        <div className="analytics-content">
                            <div className="analytics-stats">
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>{collegeAnalytics.stats.totalStudents}</h3>
                                        <p>Total Students</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>{collegeAnalytics.stats.totalLostItems}</h3>
                                        <p>Lost Items</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>{collegeAnalytics.stats.foundItems}</h3>
                                        <p>Found Items</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-info">
                                        <h3>{collegeAnalytics.stats.recoveryRate}%</h3>
                                        <p>Recovery Rate</p>
                                    </div>
                                </div>
                            </div>

                            <div className="recent-activity">
                                <h4>Recent Lost Items</h4>
                                <div className="activity-list">
                                    {collegeAnalytics.recentItems.map(item => (
                                        <div key={item._id} className="activity-item">
                                            <div className="activity-info">
                                                <p><strong>{item.itemName}</strong> - {item.status}</p>
                                                <span className="activity-time">
                                                    Reported by {item.reportedBy?.name} on {new Date(item.dateReported).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SuperAdminDashboard;