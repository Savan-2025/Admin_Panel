// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import axios from 'axios';
import API_ENDPOINTS from '../config/apiConfig';

// CSS animations
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .dashboard-card {
    animation: fadeInUp 0.5s ease-out;
  }
`;
// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    totalProjects: 0,
    totalProperties: 0,
    totalSiteVisits: 0,
    totalAmountCollected: "₹0",
    latestSiteVisits: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsResponse, projectsResponse, propertiesResponse, siteVisitsResponse, ledgerResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.LEADS_ALL_COMPANY, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 20 },
        }),
        axios.get(API_ENDPOINTS.PROJECTS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API_ENDPOINTS.ALL_PROPERTIES, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 10 },
        }),
        axios.get(API_ENDPOINTS.TotalSiteVisits, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 10 },
        }),
        axios.get(API_ENDPOINTS.LEDGER_ANALYTICS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDashboardData({
        totalLeads: leadsResponse.data.total,
        totalProjects: projectsResponse.data.totalProjects,
        totalProperties: propertiesResponse.data.total,
        totalSiteVisits: siteVisitsResponse.data.totalVisits,
        totalAmountCollected: ledgerResponse.data.data.totalCollected,
        latestSiteVisits: siteVisitsResponse.data.data || [],
      });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Using demo values.");
      // Fallback to demo data
      setDashboardData({
        totalLeads: 27,
        totalProjects: 6,
        totalProperties: 6,
        totalSiteVisits: 20,
        totalAmountCollected: "₹2.3 Lakhs",
        latestSiteVisits: Array(10).fill({
          _id: "demo123",
          salespersonId: { name: "Bharati" },
          leadId: { firstName: "John", lastName: "Doe" },
          project: { projectName: "Glass Bridge" },
          propertyId: { propertyName: "New Apartments" },
          punchIn: "10:00 AM",
          punchOut: "11:00 AM",
          addressIn: "New Delhi, India",
          addressOut: "New Delhi, India",
          date: "2025-09-07",
          status: "Completed",
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Card data for rendering
  const statCards = [
    {
      title: "Total Leads",
      value: dashboardData.totalLeads,
      icon: "👥",
      color: "#1976d2",
      subtext: "Active leads",
    },
    {
      title: "Total Projects",
      value: dashboardData.totalProjects,
      icon: "📁",
      color: "#43a047",
      subtext: "Ongoing projects",
    },
    {
      title: "Total Properties",
      value: dashboardData.totalProperties,
      icon: "🏠",
      color: "#8e24aa",
      subtext: "Available properties",
    },
    {
      title: "Total Site Visits",
      value: dashboardData.totalSiteVisits,
      icon: "🚶‍♂️",
      color: "#fbc02d",
      subtext: "This month",
    },
    {
      title: "Total Amount Collected",
      value: dashboardData.totalAmountCollected,
      icon: "💰",
      color: "#e53935",
      subtext: "This quarter",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Dashboard
      </Typography>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
          <Button size="small" onClick={fetchDashboardData} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Paper
              className="dashboard-card"
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderTop: `4px solid ${card.color}`,
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)' },
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${card.color}20`,
                  color: card.color,
                  fontSize: '1.5rem',
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h5" fontWeight="bold" color={card.color}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {card.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {card.subtext}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Latest Site Visits Table */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Latest Site Visits
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Salesperson</b></TableCell>
                <TableCell><b>Lead Name</b></TableCell>
                <TableCell><b>Project</b></TableCell>
                <TableCell><b>Property</b></TableCell>
                <TableCell><b>Punch In</b></TableCell>
                <TableCell><b>Punch Out</b></TableCell>
                <TableCell><b>Address In</b></TableCell>
                <TableCell><b>Address Out</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.latestSiteVisits.length > 0 ? (
                dashboardData.latestSiteVisits.map((visit, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                          {visit.salespersonId?.name?.charAt(0) || 'U'}
                        </Avatar>
                        {visit.salespersonId?.name || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {`${visit.leadId?.firstName || ''} ${visit.leadId?.lastName || ''}`.trim() || 'N/A'}
                    </TableCell>
                    <TableCell>{visit.project?.projectName || 'N/A'}</TableCell>
                    <TableCell>{visit.propertyId?.propertyName || 'N/A'}</TableCell>
                    <TableCell>{visit.punchIn || 'N/A'}</TableCell>
                    <TableCell>{visit.punchOut || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {visit.addressIn || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {visit.addressOut || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">No site visits found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
