import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./components/pages/loginPage";
import CollegesPage from "./components/pages/college/collegesPage";
import AdminsPage from "./components/pages/adminsPage";
import StudentsPage from "./components/pages/studentsPage";
import PostsPage from "./components/pages/postsPage";
import DashboardLayout from "./components/layouts/dashboardLayout";
import AddCollegePage from "./components/pages/college/addCollegePage";
import EditCollegePage from "./components/pages/college/editCollegePage";
import CollegeDetailsPage from "./components/pages/college/collegeDetsilsPage";
import ZonesPage from "./components/pages/zonesPage";
import ZoneDetails from "./components/pages/zoneDetailsPage";
import { Spinner } from "./components/ui/spinner";
import { useAuth } from "./contexts/AuthContext";
import DisputesPage from "./components/pages/DisputesPage";
import DisputeDetailsPage from "./components/pages/DisputeDetails";
import StatsDashboard from "./components/pages/dashboardPage";
import { PostDetailsPage } from "./components/pages/postDetailsPage";
import CouponsPage from "./components/pages/couponsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirects if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <StatsDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/colleges">
          <Route
            index
            element={
              <ProtectedRoute>
                <CollegesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="add"
            element={
              <ProtectedRoute>
                <AddCollegePage />
              </ProtectedRoute>
            }
          />

          <Route
            path=":id/edit"
            element={
              <ProtectedRoute>
                <EditCollegePage />
              </ProtectedRoute>
            }
          />

          <Route
            path=":id"
            element={
              <ProtectedRoute>
                <CollegeDetailsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/zones"
          element={
            <ProtectedRoute>
              <ZonesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/zones/:id"
          element={
            <ProtectedRoute>
              <ZoneDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admins"
          element={
            <ProtectedRoute>
              <AdminsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id"
          element={
            <ProtectedRoute>
              <PostDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/disputes"
          element={
            <ProtectedRoute>
              <DisputesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/disputes/:id"
          element={
            <ProtectedRoute>
              <DisputeDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <CouponsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
    </Routes>
  );
};

export default App;
