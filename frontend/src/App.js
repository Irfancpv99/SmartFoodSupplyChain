import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

// Layout
import Navbar from './components/layout/Navbar';

// Auth Pages
import Login from './pages/Auth/Login';

// Vendor Pages
import VendorDashboard from './pages/Vendor/Dashboard';
import UploadDocument from './pages/Vendor/UploadDocument';

// School Pages
import SchoolDashboard from './pages/School/Dashboard';
import CreateMenu from './pages/School/CreateMenu';
import MenuList from './pages/School/MenuList';

// Consumer Pages
import ConsumerHome from './pages/Consumer/Home';
import VerifyMenu from './pages/Consumer/VerifyMenu';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<ConsumerHome />} />
            <Route path="/verify/menu/:id" element={<VerifyMenu />} />
            
            {/* Vendor Routes */}
            <Route 
              path="/vendor" 
              element={
                <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                  <VendorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendor/upload" 
              element={
                <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                  <UploadDocument />
                </ProtectedRoute>
              } 
            />
            
            {/* School Routes */}
            <Route 
              path="/school" 
              element={
                <ProtectedRoute allowedRoles={['school', 'admin']}>
                  <SchoolDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/school/menus" 
              element={
                <ProtectedRoute allowedRoles={['school', 'admin']}>
                  <MenuList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/school/menus/create" 
              element={
                <ProtectedRoute allowedRoles={['school', 'admin']}>
                  <CreateMenu />
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/verify" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
