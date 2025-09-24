import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Button, Avatar, Divider, 
  CircularProgress, Chip 
} from '@mui/material';
import API_ENDPOINTS from '../config/apiConfig';
import axios from 'axios';

const SalespersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salesperson, setSalesperson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesperson = async () => {
      try {
        if (!id) {
          throw new Error('No user ID provided');
        }
        
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_ENDPOINTS.USERS}/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        setSalesperson(response.data.user || response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching salesperson:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch salesperson details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSalesperson();
    } else {
      setLoading(false);
      setError('No user ID provided');
    }
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6" gutterBottom>
          Error
        </Typography>
        <Typography paragraph>{error}</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!salesperson) {
    return (
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Salesperson not found
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Handle profile photo URL construction
  const getProfilePhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    if (photoPath.startsWith('/uploads/')) {
      const baseUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api/v1', '') || '';
      return `${baseUrl}${photoPath}`;
    }
    return photoPath;
  };

  const photoUrl = getProfilePhotoUrl(salesperson.profilePhoto);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate(-1)} 
        sx={{ mb: 2 }}
      >
        ← Back to List
      </Button>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar 
            src={photoUrl} 
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {salesperson.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {salesperson.designation || '—'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
          <DetailItem label="Email" value={salesperson.email} />
          <DetailItem label="Phone" value={salesperson.phone} />
          <DetailItem label="Location" value={salesperson.location} />
          <DetailItem label="Employee ID" value={salesperson.EmployeeId} />

          {/* Company */}
          <DetailItem 
            label="Company" 
            value={
              salesperson.company?.name || 
              salesperson.companyId?.name || 
              salesperson.companyId?.companyName || 
              '—'
            } 
          />

          {/* Projects: support multiple or single */}
          <Box sx={{ mb: 2, gridColumn: 'auto' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Projects
            </Typography>
            {salesperson.projects && salesperson.projects.length > 0 ? (
              <Box sx={{ mt: 0.5 }}>
                {salesperson.projects.map((proj) => (
                  <Chip key={proj._id} label={proj.projectName} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            ) : (
              <Typography variant="body1">
                {salesperson.project?.projectName || salesperson.projectId?.projectName || '—'}
              </Typography>
            )}
          </Box>

          <DetailItem label="Status" value={salesperson.isActive ? 'Active' : 'Inactive'} />
          <DetailItem label="Address" value={salesperson.address} fullWidth />
        </Box>
      </Paper>
    </Box>
  );
};

const DetailItem = ({ label, value, fullWidth = false }) => (
  <Box sx={{ mb: 2, gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body1">
      {value || '-'}
    </Typography>
  </Box>
);

export default SalespersonDetail;
