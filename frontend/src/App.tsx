import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import {
  AuthProvider,
  getRoleDashboardPath,
  useAuth,
  useIsAdmin,
  useIsLeader,
  useIsVendor,
} from "./hooks/useAuth.tsx";
import Layout from "./layouts/Layout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import CreatePostPage from "./pages/CreatePostPage";
import PostDetailsPage from "./pages/PostDetailsPage";
import AICopilotPage from "./pages/AICopilotPage";
import SavedPostsPage from "./pages/SavedPostsPage";
import MyPostsPage from "./pages/MyPostsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ContactPage from "./pages/ContactPage";
import LeadersPage from "./pages/LeadersPage";
import SermonsPage from "./pages/SermonsPage";
import SermonDetailPage from "./pages/SermonDetailPage";
import MarketplacePage from "./pages/MarketplacePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDonationRecipientsPage from "./pages/AdminDonationRecipientsPage";
import LeaderDashboardPage from "./pages/LeaderDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import ContentPage from "./pages/ContentPage";
import TrackerPage from "./pages/TrackerPage";
import EventsPage from "./pages/EventsPage";
import DonatePage from "./pages/DonatePage";
import MyTeachingsPage from "./pages/MyTeachingsPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import VendorProductsPage from "./pages/VendorProductsPage";
import VendorOrdersPage from "./pages/VendorOrdersPage";
import VendorMessagesPage from "./pages/VendorMessagesPage";
import CustomerOrdersPage from "./pages/CustomerOrdersPage";
import CustomerMessagesPage from "./pages/CustomerMessagesPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/welcome" />;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to={getRoleDashboardPath(user?.role)} replace />;
};

const RoleRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to={getRoleDashboardPath(user?.role)} replace /> : <Navigate to="/welcome" replace />;
};

const MemberRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated && user?.role === 'user' ? <>{children}</> : <Navigate to={getRoleDashboardPath(user?.role)} replace />;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/" />;
};

// Leader Route Component
const LeaderRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isLeader = useIsLeader();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated && isLeader ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
};

// Vendor Route Component
const VendorRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isVendor = useIsVendor();
  const isAdmin = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated && (isVendor || isAdmin) ? (
    <>{children}</>
  ) : (
    <Navigate to="/" />
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/welcome" element={<LandingPage />} />

      {/* Auth Routes */}
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
        path="/verify-email"
        element={
          <EmailVerificationPage />
        }
      />

      {/* Protected Routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<RoleRedirect />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard/member"
          element={
            <MemberRoute>
              <DashboardPage />
            </MemberRoute>
          }
        />
        <Route path="/dashboard" element={<RoleRedirect />} />

        <Route path="/content" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/donate" element={<ProtectedRoute><DonatePage /></ProtectedRoute>} />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/copilot"
          element={
            <ProtectedRoute>
              <AICopilotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sermons"
          element={
            <ProtectedRoute>
              <SermonsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sermons/:id"
          element={
            <ProtectedRoute>
              <SermonDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <MarketplacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <CustomerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-messages"
          element={
            <ProtectedRoute>
              <CustomerMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Authenticated only */}
        <Route
          path="/my-posts"
          element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostDetailsPage />
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
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaders"
          element={
            <ProtectedRoute>
              <LeadersPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect old home to dashboard */}
        <Route path="/home" element={<RoleRedirect />} />

        {/* Admin only */}
        <Route
          path="/dashboard/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard/admin/:section"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <AdminRoute>
              <AdminDonationRecipientsPage />
            </AdminRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />

        {/* Leader only */}
        <Route
          path="/dashboard/leader"
          element={
            <LeaderRoute>
              <LeaderDashboardPage />
            </LeaderRoute>
          }
        />
        <Route
          path="/dashboard/leader/:section"
          element={
            <LeaderRoute>
              <LeaderDashboardPage />
            </LeaderRoute>
          }
        />
        <Route
          path="/leader/my-teachings"
          element={
            <LeaderRoute>
              <MyTeachingsPage />
            </LeaderRoute>
          }
        />
        <Route path="/leader" element={<Navigate to="/dashboard/leader" replace />} />
        
        {/* Vendor only */}
        <Route
          path="/dashboard/vendor"
          element={
            <VendorRoute>
              <VendorDashboardPage />
            </VendorRoute>
          }
        />
        <Route
          path="/vendor/products"
          element={
            <VendorRoute>
              <VendorProductsPage />
            </VendorRoute>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <VendorRoute>
              <VendorOrdersPage />
            </VendorRoute>
          }
        />
        <Route
          path="/vendor/messages"
          element={
            <VendorRoute>
              <VendorMessagesPage />
            </VendorRoute>
          }
        />
        <Route path="/vendor" element={<Navigate to="/dashboard/vendor" replace />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/welcome" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
