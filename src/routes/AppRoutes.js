import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import LazyWrapper from '../components/LazyWrapper';
import Login from '../pages/Login';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Projects = lazy(() => import('../pages/CompanyProjects'));
const Ledger = lazy(() => import('../pages/Ledger'));
const Reports = lazy(() => import('../pages/Reports'));
const Salespersons = lazy(() => import('../pages/Salespersons'));
const SalespersonDetails = lazy(() => import('../pages/SalespersonDetails'));
const Company = lazy(() => import('../pages/Company'));
const CompanyProjectsPage = lazy(() => import('../pages/CompanyProjects'));
const PropertyPage = lazy(() => import('../pages/Property'));
const DetailedLedger = lazy(() => import('../pages/DetailedLedger'));
const AddLedger = lazy(() => import('../pages/AddLedger'));
const Subadmin = lazy(() => import('../pages/Subadmin'));
const SiteManagement = lazy(() => import('../pages/SiteManagement'));
const Item = lazy(() => import('../pages/Item'));
const Stock = lazy(() => import('../pages/Stock'));
const Setting = lazy(() => import('../pages/Setting'));
const Transactions = lazy(() => import('../pages/Transactions'));
const AddTransaction = lazy(() => import('../pages/AddTransactions'));
const Contact = lazy(() => import('../pages/Contact'));
const SiteVisit = lazy(() => import('../pages/SiteVisit'));
const Punch = lazy(() => import('../pages/Punch'));

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children, requiredPermissions = [], requireAll = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Navbar>
      <ProtectedRoute 
        requiredPermissions={requiredPermissions} 
        requireAll={requireAll}
      >
        <LazyWrapper fallbackMessage="Loading page...">
          {children}
        </LazyWrapper>
      </ProtectedRoute>
    </Navbar>
  );
};

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute requiredPermissions={['dashboard.view']}><Dashboard /></PrivateRoute>} />
      <Route path="/leads" element={<PrivateRoute requiredPermissions={['leads.view']}><Leads /></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute requiredPermissions={['projects.view']}><Projects /></PrivateRoute>} />
      <Route path="/ledger" element={<PrivateRoute requiredPermissions={['payments.view']}><Ledger /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute requiredPermissions={['reports.view']}><Reports /></PrivateRoute>} />
      <Route path="/salespersons" element={<PrivateRoute requiredPermissions={['users.view']}><Salespersons /></PrivateRoute>} />
      <Route path="/salespersonDetails/:id" element={<PrivateRoute requiredPermissions={['users.view']}><SalespersonDetails /></PrivateRoute>} />
      <Route path="/company" element={<PrivateRoute requiredPermissions={['companies.view', 'projects.view']}><Company /></PrivateRoute>} />
      <Route path="/companies/:id/projects" element={<PrivateRoute requiredPermissions={['projects.view']}><CompanyProjectsPage /></PrivateRoute>} />
      <Route path="/companies/:id/projects/:projectId/properties" element={<PrivateRoute requiredPermissions={['properties.view']}><PropertyPage /></PrivateRoute>} />
      <Route path="/detailedledger" element={<PrivateRoute requiredPermissions={['payments.view']}><DetailedLedger /></PrivateRoute>} />
      <Route path="/addledger" element={<PrivateRoute requiredPermissions={['payments.manage']}><AddLedger /></PrivateRoute>} />
      <Route path="/subadmin" element={<PrivateRoute><Subadmin /></PrivateRoute>} />
      <Route path="/siteManagement" element={<PrivateRoute requiredPermissions={['sites.view']}><SiteManagement /></PrivateRoute>} />
      <Route path="/item/:id" element={<PrivateRoute requiredPermissions={['inventory.view']}><Item /></PrivateRoute>} />
      <Route path="/stock/:id" element={<PrivateRoute requiredPermissions={['inventory.view']}><Stock /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute requiredPermissions={['users.view']}><Setting /></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute requiredPermissions={['payments.view']}><Transactions /></PrivateRoute>} />
      <Route path="/addtransaction" element={<PrivateRoute requiredPermissions={['payments.manage']}><AddTransaction /></PrivateRoute>} />
      <Route path="/contact" element={<PrivateRoute requiredPermissions={['contact.view']}><Contact /></PrivateRoute>} />
      <Route path="/siteVisit" element={<PrivateRoute requiredPermissions={['sites.view']}><SiteVisit /></PrivateRoute>} />
      <Route path="/punch/:leadId" element={<PrivateRoute requiredPermissions={['sites.view']}><Punch /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
