// src/components/Navbar.jsx
import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Inventory2 as InventoryIcon,
  AccountBalanceWallet as LedgerIcon,
  SupervisorAccount as SubAdminIcon,
  ManageAccounts as SalesIcon,
  BarChart as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';

const drawerWidth = 240;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/', 
    permission: 'dashboard.view' 
  },
  { 
    text: 'Leads Funnel', 
    icon: <GroupIcon />, 
    path: '/leads', 
    permission: 'leads.view' 
  },
  { 
    text: 'Project', 
    icon: <AssignmentIcon />, 
    path: '/company', 
    permission: 'projects.view' 
  },
  { 
    text: 'Site Inventory', 
    icon: <InventoryIcon />, 
    path: '/siteManagement', 
    permission: 'sites.view' 
  },
  { 
    text: 'Account Ledger', 
    icon: <LedgerIcon />, 
    path: '/ledger', 
    permission: 'payments.view' 
  },
  { 
    text: 'Sub Admin', 
    icon: <SubAdminIcon />, 
    path: '/subadmin', 
    adminOnly: true 
  },
  { 
    text: 'Sales Management', 
    icon: <SalesIcon />, 
    path: '/salespersons', 
    permission: 'users.view' 
  },
  { 
    text: 'Site Visit Management', 
    icon: <SalesIcon />, 
    path: '/siteVisit', 
    permission: 'users.view' 
  },
  /*{ 
    text: 'Report', 
    icon: <ReportIcon />, 
    path: '/report', 
    permission: 'reports.view' 
  },*/
  { 
    text: 'Transactions', 
    icon: <ReportIcon />, 
    path: '/transactions', 
    permission: 'transactions.view' 
  },
  { 
    text: 'Contact', 
    icon: <ReportIcon />, 
    path: '/contact', 
    permission: 'contact.view' 
  },
  
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/settings', 
    adminOnly: true 
  },
];

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, hasAnyPermission, userRole, loading } = usePermissions();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Filter menu items based on permissions
  const getVisibleMenuItems = () => {
    if (loading) return [];
    
    return menuItems.filter(item => {
      // Admin can see everything
      if (isAdmin()) return true;
      
      // Items marked as admin only
      if (item.adminOnly) return false;
      
      // Items with permission requirements
      if (item.permission) {
        return hasAnyPermission([item.permission]);
      }
      
      // Items without permission requirements are visible to all
      return true;
    });
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#fff',
            color: '#222',
            borderRight: '2px solid #e3e8ee',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowX: 'hidden',
          },
        }}
        open
      >
        <Box>
          <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1976d2', fontSize: '1.1rem', letterSpacing: 0.5 }}>
                Admin Panel
              </Typography>
          </Box>
          <List>
            {visibleMenuItems.map((item) => {
              const selected = location.pathname === item.path;
              const hasPermission = isAdmin() || !item.permission || hasAnyPermission([item.permission]);
              const isDisabled = !hasPermission;
              
              const listItem = (
                <ListItem
                  button="true"
                  key={item.text}
                  onClick={() => !isDisabled && navigate(item.path)}
                  selected={selected}
                  sx={{
                    bgcolor: selected ? '#f5faff' : 'transparent',
                    borderLeft: selected ? '4px solid #1976d2' : '4px solid transparent',
                    color: isDisabled ? '#ccc' : (selected ? '#1976d2' : '#555'),
                    fontWeight: selected ? 600 : 400,
                    mx: 0,
                    my: 0.5,
                    pl: 1,
                    '&:hover': { bgcolor: isDisabled ? 'transparent' : '#f0f4fa' },
                    transition: 'all 0.3s ease',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isDisabled ? '#ccc' : (selected ? '#1976d2' : '#888'), 
                    minWidth: '36px' 
                  }}>
                    {isDisabled ? <LockIcon /> : item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ 
                      fontWeight: selected ? 600 : 400, 
                      fontSize: '1rem',
                      color: isDisabled ? '#ccc' : 'inherit'
                    }}
                  />
                </ListItem>
              );

              return isDisabled ? (
                <Tooltip key={item.text} title="Access restricted - insufficient permissions" placement="right">
                  {listItem}
                </Tooltip>
              ) : listItem;
            })}
          </List>
          <Divider sx={{ bgcolor: '#e3e8ee', my: 2 }} />
          <List>
            <ListItem button onClick={handleLogout} sx={{ color: '#555', pl: 1 }}>
              <ListItemIcon sx={{ color: '#888', minWidth: '36px' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            src="https://randomuser.me/api/portraits/men/32.jpg"
            sx={{ width: 56, height: 56, mx: 'auto', mb: 1, border: '2px solid #e3e8ee' }}
          />
          <Typography fontWeight={600} sx={{ color: '#222', fontSize: '1.1rem' }}>
            {isAdmin() ? 'Admin' : 'Sub Admin'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', fontSize: '0.9rem' }}>
            {userRole ? userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Loading...'}
          </Typography>
        </Box>
      </Drawer>
      <Box sx={{ flexGrow: 1, bgcolor: '#f4f6fa', minHeight: '100vh', p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Navbar;