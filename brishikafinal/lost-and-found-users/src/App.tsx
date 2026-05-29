import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./components/pages/loginPage";
import RegisterPage from "./components/pages/registerPage";
import { VerifyEmailPage } from "./components/pages/verifyEmailPage";
import { useAuth } from "./contexts/AuthContext";
import { Spinner } from "./components/ui/spinner";
import { ProfilePage } from "./components/pages/profilePage";
import { ResetPasswordPage } from "./components/pages/resetPasswordPage";
import Feed from "./components/pages/feedPage";
import ZonesPage from "./components/pages/admin/zonesPage";
import ZoneDetails from "./components/pages/admin/zoneDetailsPage";
import EditLostItemPost from "./components/pages/editLostItemPost";
import CreateLostItemPost from "./components/pages/createLostItemPost";
import LostItemDetails from "./components/pages/lostItemDetailsPage";
import ChatPage from "./components/pages/chatPage";
import DashboardLayout from "./components/layouts/dashboardLayout";
import DashboardPage from "./components/pages/admin/dashboardPage";
import StudentsPage from "./components/pages/admin/studentsPage";
import { AdminLostItemDetail } from "./components/pages/admin/AdminLostItemDetail";
import LostItemsPage from "./components/pages/admin/lostItemsPage";
import DisputesPage from "./components/pages/admin/DisputesPage";
import DisputeDetailsPage from "./components/pages/DisputeDetails";
import MyDisputesPage from "./components/pages/MyDisputesPage";
import UserDisputeDetailsPage from "./components/pages/UserDisputeDetailsPage";
import UserLayout from "./components/layouts/userLayout";
import NotificationsPage from "./components/pages/NotificationsPage";
import MyItemsPage from "./components/pages/MyItemsPage";
import RewardHistory from "./components/pages/rewardHistory";
import CouponsPage from "./components/pages/admin/couponsPage";
import UserCouponsPage from "./components/pages/UserCouponsPage";

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
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/zones"
          element={
            <ProtectedRoute>
              <ZonesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/zones/:id"
          element={
            <ProtectedRoute>
              <ZoneDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/lost-items"
          element={
            <ProtectedRoute>
              <LostItemsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/lost-items/:id" element={<AdminLostItemDetail />} />

        <Route
          path="/admin/disputes"
          element={
            <ProtectedRoute>
              <DisputesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes/:id"
          element={
            <ProtectedRoute>
              <DisputeDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <ProtectedRoute>
              <CouponsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route element={<UserLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreateLostItemPost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-post/:id"
          element={
            <ProtectedRoute>
              <EditLostItemPost />
            </ProtectedRoute>
          }
        />

        <Route path="/post/:id" element={<LostItemDetails />} />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-disputes"
          element={
            <ProtectedRoute>
              <MyDisputesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-disputes/:id"
          element={
            <ProtectedRoute>
              <UserDisputeDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-items"
          element={
            <ProtectedRoute>
              <MyItemsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-rewards"
          element={
            <ProtectedRoute>
              <RewardHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <UserCouponsPage />
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

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/verify-email/:token"
        element={
          <PublicRoute>
            <VerifyEmailPage />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
    </Routes>
  );
};

export default App;
