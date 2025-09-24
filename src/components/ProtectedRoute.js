import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';
import { Box, CircularProgress, Alert } from '@mui/material';

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requireAll = false,
  fallbackPath = '/dashboard' 
}) => {
  const { loading, error, hasAnyPermission, hasAllPermissions, isAdmin } = usePermissions();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading permissions: {error}
        </Alert>
      </Box>
    );
  }

  // Admin has access to everything
  if (isAdmin()) {
    return children;
  }

  // If no permissions required, just render the component
  if (requiredPermissions.length === 0) {
    return children;
  }

  // Check permissions
  const hasPermission = requireAll 
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
