import { useState, useEffect } from 'react';
import './SuperAdmin.css';
import apiService from './services/api';

function SuperAdmin() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminName, setNewAdminName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadColleges();
    }, []);

    const loadColleges = async () => {
        try {
            setLoading(true);
            const response = await apiService.getColleges();
            if (response.success) {
                setColleges(response.data);
            }
        } catch (error) {
            setError('Failed to load colleges: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!selectedCollege || !newAdminEmail || !newAdminName) {
            setError('Please fill all fields');
            setSubmitting(false);
            return;
        }

        // Check if admin already exists for this college
        const college = colleges.find(c => c.name === selectedCollege);
        if (college && college.adminId) {
            setError(`Admin for ${selectedCollege} already exists!`);
            setSubmitting(false);
            return;
        }

        try {
            const response = await apiService.addAdmin({
                name: newAdminName,
                email: newAdminEmail,
                password: 'admin123', // Default password
                college: selectedCollege,
                collegeLogo: college?.logo || '🎓'
            });

            if (response.success) {
                // Reload colleges to get updated data
                await loadColleges();

                // Reset form
                setSelectedCollege('');
                setNewAdminEmail('');
                setNewAdminName('');
                setShowAddAdminModal(false);

                alert('Admin added successfully!');
            }
        } catch (error) {
            setError(error.message || 'Failed to add admin');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveAdmin = async (college) => {
        if (window.confirm(`Are you sure you want to remove the admin for ${college.name}?`)) {
            try {
                const response = await apiService.removeAdmin(college.adminId._id);

                if (response.success) {
                    await loadColleges();
                    alert('Admin removed successfully!');
                }
            } catch (error) {
                alert('Failed to remove admin: ' + error.message);
            }
        }
    };

    const getCollegeStats = () => {
        const totalColleges = colleges.length;
        const collegesWithAdmins = colleges.filter(college => college.adminId).length;
        const collegesWithoutAdmins = totalColleges - collegesWithAdmins;

        return { totalColleges, collegesWithAdmins, collegesWithoutAdmins };
    };

    const stats = getCollegeStats();

    if (loading) {
        return (
            <div className="superadmin-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="superadmin-container">
            <div className="superadmin-header">
                <div className="header-content">
                    <h1>Super Admin Dashboard</h1>
                    <p>Manage ING Colleges Network Administrators</p>
                </div>
                <button
                    className="add-admin-btn"
                    onClick={() => setShowAddAdminModal(true)}
                >
                    + Add Admin
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🏫</div>
                    <div className="stat-info">
                        <h3>{stats.totalColleges}</h3>
                        <p>Total Colleges</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats.collegesWithAdmins}</h3>
                        <p>Colleges with Admins</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                        <h3>{stats.collegesWithoutAdmins}</h3>
                        <p>Colleges without Admins</p>
                    </div>
                </div>
            </div>

            {/* Colleges Grid */}
            <div className="colleges-section">
                <h2>College Administration</h2>
                <div className="colleges-grid">
                    {colleges.map((college) => {
                        const hasAdmin = college.adminId;
                        return (
                            <div key={college._id} className={`college-card ${hasAdmin ? 'has-admin' : 'no-admin'}`}>
                                <div className="college-header">
                                    <span className="college-logo">{college.logo}</span>
                                    <div className="college-info">
                                        <h3>{college.name}</h3>
                                        <p>@{college.domain}</p>
                                    </div>
                                </div>

                                <div className="admin-status">
                                    {hasAdmin ? (
                                        <div className="admin-details">
                                            <div className="status-badge active">Admin Assigned</div>
                                            <div className="admin-info">
                                                <p><strong>Name:</strong> {hasAdmin.name}</p>
                                                <p><strong>Email:</strong> {hasAdmin.email}</p>
                                                <p><strong>Assigned:</strong> {new Date(hasAdmin.assignedDate).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveAdmin(college)}
                                            >
                                                Remove Admin
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="no-admin-details">
                                            <div className="status-badge inactive">No Admin</div>
                                            <p>This college needs an administrator</p>
                                            <button
                                                className="assign-btn"
                                                onClick={() => {
                                                    setSelectedCollege(college.name);
                                                    setShowAddAdminModal(true);
                                                }}
                                            >
                                                Assign Admin
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Admin Modal */}
            {showAddAdminModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add New Admin</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowAddAdminModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleAddAdmin} className="modal-form">
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label>Select College</label>
                                <select
                                    value={selectedCollege}
                                    onChange={(e) => setSelectedCollege(e.target.value)}
                                    required
                                >
                                    <option value="">Choose college...</option>
                                    {colleges
                                        .filter(college => !college.adminId)
                                        .map(college => (
                                            <option key={college._id} value={college.name}>
                                                {college.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Admin Name</label>
                                <input
                                    type="text"
                                    value={newAdminName}
                                    onChange={(e) => setNewAdminName(e.target.value)}
                                    placeholder="Enter admin's full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Admin Email</label>
                                <input
                                    type="email"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    placeholder="admin@college.edu.np"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddAdminModal(false)} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}>
                                    {submitting ? 'Adding...' : 'Add Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SuperAdmin;