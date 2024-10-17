import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';
import UserDashboard from './components/Dashboard/UserDashboard';
import DriverDashboard from './components/Dashboard/DriverDashboard';
import Booking from './components/Map/Booking';
import ProtectedRoute from './components/Authentication/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navigation/Navbar';
import 'react-toastify/dist/ReactToastify.css'; 

const App = () => {
  return (
    <Router>
      <div className=" min-w-full bg-gray-100">
      <ToastContainer
          position="top-right" 
          autoClose={2000} 
          hideProgressBar={false} 
          closeOnClick
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute userType="customer">
                <Navbar />
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute userType="driver">
                <Navbar />
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute userType="customer">
                <Navbar />
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;