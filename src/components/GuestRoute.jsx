import React from 'react';
import { Navigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('apiToken');
  const userRole = localStorage.getItem('userRole');

  if (token) {
    if (userRole === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (userRole === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default GuestRoute;