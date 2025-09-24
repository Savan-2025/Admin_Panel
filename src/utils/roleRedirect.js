// Role-based redirect utility
export const getDefaultRouteForRole = (role, permissions = {}) => {
  // Admin always goes to dashboard
  if (role === 'admin') {
    return '/';
  }

  // For subadmins, redirect to their primary permission area
  switch (role) {
    case 'lead_manager':
      return permissions.leads?.view ? '/leads' : '/';
    
    case 'project_manager':
      return permissions.projects?.view ? '/projects' : '/';
    
    case 'site_manager':
      return permissions.sites?.view ? '/siteManagement' : '/';
    
    case 'account_manager':
      return permissions.payments?.view ? '/ledger' : '/';
    
    case 'sales_manager':
      return permissions.leads?.view ? '/leads' : '/';
    
    case 'subadmin':
      // For general subadmin, check permissions and redirect to first available
      if (permissions.leads?.view) return '/leads';
      if (permissions.projects?.view) return '/projects';
      if (permissions.payments?.view) return '/ledger';
      if (permissions.sites?.view) return '/siteManagement';
      if (permissions.dashboard?.view) return '/';
      return '/';
    
    default:
      return '/';
  }
};

// Get the best available route for a user based on their permissions
export const getBestAvailableRoute = (permissions = {}) => {
  // Priority order for redirects
  const routePriority = [
    { route: '/leads', permission: 'leads.view' },
    { route: '/projects', permission: 'projects.view' },
    { route: '/ledger', permission: 'payments.view' },
    { route: '/siteManagement', permission: 'sites.view' },
    { route: '/reports', permission: 'reports.view' },
    { route: '/', permission: 'dashboard.view' }
  ];

  for (const { route, permission } of routePriority) {
    const [resource, action] = permission.split('.');
    if (permissions[resource]?.[action]) {
      return route;
    }
  }

  // Fallback to dashboard
  return '/';
};

// Check if user has access to a specific route
export const hasRouteAccess = (route, permissions = {}) => {
  const routePermissions = {
    '/': ['dashboard.view'],
    '/leads': ['leads.view'],
    '/projects': ['projects.view'],
    '/ledger': ['payments.view'],
    '/detailedledger': ['payments.view'],
    '/addledger': ['payments.manage'],
    '/reports': ['reports.view'],
    '/salespersons': ['users.view'],
    '/company': ['companies.view', 'projects.view'],
    '/siteManagement': ['sites.view'],
    '/subadmin': ['users.manage'] // Only admin should access this
  };

  const requiredPermissions = routePermissions[route] || [];
  
  return requiredPermissions.some(permission => {
    const [resource, action] = permission.split('.');
    return permissions[resource]?.[action];
  });
};
