import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Remove BrowserRouter from here
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Statements from './pages/Statements';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import CustomerDetails from './pages/CustomerDetails';
import './App.css';

function App() {
  return (
    // ❌ REMOVE <BrowserRouter> from here
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/statements" element={<Statements />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/customer/:id" element={<CustomerDetails />} />
    </Routes>
    // ❌ REMOVE </BrowserRouter> from here
  );
}

export default App;