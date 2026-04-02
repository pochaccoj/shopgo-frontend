import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <ProductsPage /> },
          { path: '/products/:id', element: <ProductDetailPage /> },
          { path: '/cart', element: <CartPage /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
          {
            element: <ProtectedRoute requiredRole="admin" />,
            children: [{ path: '/admin', element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
]);
