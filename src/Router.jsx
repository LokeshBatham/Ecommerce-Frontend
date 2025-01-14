import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Unauthorized from './components/Unauthorized';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/user"
        element={<ProtectedRoute roles={["user"]}><UserDashboard /></ProtectedRoute>}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  </Router>
);

export default AppRouter;