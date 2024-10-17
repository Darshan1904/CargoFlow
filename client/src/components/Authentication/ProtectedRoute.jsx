import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {

  const isAuthenticated = () => {
    return localStorage.getItem('userToken') !== null;
  };

  const getUserType = () => {
    return localStorage.getItem('userRole');
  };

  // Check is User Authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Redirect it to the dashboard based on it's role
  if (getUserType() !== userType) {
    return <Navigate to={`/${getUserType()}-dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;