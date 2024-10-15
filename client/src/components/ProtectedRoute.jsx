import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {
  const isAuthenticated = () => {
    // Implement your authentication check logic here
    return localStorage.getItem('userToken') !== null;
  };

  const getUserType = () => {
    // Implement your user type check logic here
    return localStorage.getItem('userType');
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