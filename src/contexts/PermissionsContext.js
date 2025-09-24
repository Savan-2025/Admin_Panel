import React, { createContext, useContext, useState, useEffect } from 'react';
import API_ENDPOINTS from '../config/apiConfig';

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setPermissions(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      const response = await fetch('https://realestate.volvrit.org/api/v1/permissions/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If permissions endpoint fails, try to get user info from login
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          setUserRole(user.role);
          if (user.role === 'admin') {
            setPermissions({
              leads: { view: true, manage: true },
              projects: { view: true, manage: true },
              payments: { view: true, manage: true },
              reports: { view: true, manage: true },
              users: { view: true, manage: true },
              companies: { view: true, manage: true },
              properties: { view: true, manage: true },
              sites: { view: true, manage: true },
              inventory: { view: true, manage: true },
              dashboard: { view: true }
            });
          } else {
            setPermissions(user.permissions || {});
          }
          setError(null);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch user permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions);
      setUserRole(data.role);
      setError(null);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err.message);
      setPermissions(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  // Helper functions to check permissions
  const canView = (resource) => {
    if (userRole === 'admin') return true;
    return permissions?.[resource]?.view || false;
  };

  const canManage = (resource) => {
    if (userRole === 'admin') return true;
    return permissions?.[resource]?.manage || false;
  };

  const hasAnyPermission = (resourcePermissions) => {
    if (userRole === 'admin') return true;
    
    return resourcePermissions.some(permission => {
      const [resource, action] = permission.split('.');
      return permissions?.[resource]?.[action] || false;
    });
  };

  const hasAllPermissions = (resourcePermissions) => {
    if (userRole === 'admin') return true;
    
    return resourcePermissions.every(permission => {
      const [resource, action] = permission.split('.');
      return permissions?.[resource]?.[action] || false;
    });
  };

  const isAdmin = () => userRole === 'admin';

  const refreshPermissions = () => {
    fetchUserPermissions();
  };

  const value = {
    permissions,
    userRole,
    loading,
    error,
    canView,
    canManage,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    refreshPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export default PermissionsContext;
