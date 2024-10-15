import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {
  const isAuthenticated = () => {
    return localStorage.getItem('userToken') !== null;
  };

  const getUserType = () => {
    return localStorage.getItem('userRole');
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getUserType() !== userType) {
    return <Navigate to={`/${getUserType()}-dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;