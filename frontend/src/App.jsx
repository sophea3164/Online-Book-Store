import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBooks from './pages/admin/AdminBooks';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const CustomerLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
      <Route path="/books" element={<CustomerLayout><BooksPage /></CustomerLayout>} />
      <Route path="/books/:id" element={<CustomerLayout><BookDetailPage /></CustomerLayout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Customer */}
      <Route path="/cart" element={<ProtectedRoute><CustomerLayout><CartPage /></CustomerLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CustomerLayout><CheckoutPage /></CustomerLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><CustomerLayout><OrdersPage /></CustomerLayout></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><CustomerLayout><OrderDetailPage /></CustomerLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><CustomerLayout><ProfilePage /></CustomerLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
