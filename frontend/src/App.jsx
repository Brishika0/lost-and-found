import { useState } from 'react';
import StudentLogin from "./StudentLogin.jsx";
import AdminLogin from "./AdminLogin.jsx";
import SuperAdminLogin from "./SuperAdminLogin.jsx";
import SuperAdmin from "./SuperAdmin.jsx";
import SuperAdminDashboard from "./SuperAdminDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import Navigation from "./Navigation.jsx";
import LandingPage from "./LandingPage.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  // Simple routing based on hash
  useState(() => {



    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'landing';
      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Show navigation only on login pages (not landing or dashboards)
  const showNavigation = ['student-login', 'admin-login', 'superadmin-login'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'student-login':
        return <StudentLogin />;
      case 'admin-login':
        return <AdminLogin />;
      case 'superadmin-login':
        return <SuperAdminLogin />;
      case 'superadmin':
        return <SuperAdminDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'student-dashboard':
        return <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Student Dashboard</h1>
          <p>Welcome to the student portal! (Dashboard coming soon)</p>
          <button onClick={() => window.location.hash = 'student-login'}>Back to Student Login</button>
        </div>;
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      {showNavigation && <Navigation />}
      <div style={showNavigation ? { paddingTop: '80px' } : {}}>
        {renderPage()}
      </div>
    </>
  );
}

export default App;