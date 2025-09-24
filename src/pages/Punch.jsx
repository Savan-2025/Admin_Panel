import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, Button, Modal, Card, CardContent, Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_ENDPOINTS, { API_BASE_URL, API_BASE_URL_Image } from '../config/apiConfig';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflow: 'auto',
};

const PunchListingPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPunch, setSelectedPunch] = useState(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('token');

  const fetchPunches = async () => {
    if (!leadId) {
      setError('No lead ID provided');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.TotalSiteVisits}?page=1&limit=100&leadId=${leadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data && response.data.success) {
        setPunches(response.data.data || []);
      } else {
        setError('Failed to fetch punch data');
        setPunches([]);
      }
    } catch (error) {
      console.error('Error fetching punches:', error);
      setError(error.response?.data?.message || 'Error fetching punch data');
      setPunches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPunches();
  }, [leadId]);

  const handleRowClick = (params) => {
    setSelectedPunch(params.row);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const columns = [
    { field: 'salespersonName', headerName: 'Salesperson Name', width: 180 },
    { field: 'leadName', headerName: 'Lead Name', width: 180 },
    { field: 'projectName', headerName: 'Project Name', width: 180 },
    { field: 'propertyName', headerName: 'Property Name', width: 180 },
    { field: 'punchInTime', headerName: 'Punch In Time', width: 150 },
    { field: 'punchOutTime', headerName: 'Punch Out Time', width: 150 },
  ];

  const rows = punches.map((punch) => ({
    id: punch._id,
    salespersonName: punch.salespersonId?.name || 'N/A',
    leadName: `${punch.leadId?.firstName || ''} ${punch.leadId?.lastName || ''}`.trim() || 'N/A',
    projectName: punch.project?.projectName || 'N/A',
    propertyName: punch.propertyId?.propertyName || 'N/A',
    punchInTime: punch.punchIn || 'N/A',
    punchOutTime: punch.punchOut || 'N/A',
    addressIn: punch.addressIn || 'N/A',
    addressOut: punch.addressOut || 'N/A',
    date: punch.date || 'N/A',
    duration: punch.duration || 'N/A',
    latIn: punch.latIn || 'N/A',
    lngIn: punch.lngIn || 'N/A',
    latOut: punch.latOut || 'N/A',
    lngOut: punch.lngOut || 'N/A',
    imageIn: punch.imageIn || 'N/A',
    imageOut: punch.imageOut || 'N/A',
  }));

  if (!leadId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: No lead ID provided</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '80vh', width: '100%', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Site Visits for Lead
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back to Leads
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      ) : punches.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography>No site visits found for this lead</Typography>
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100% - 100px)', width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            autoHeight
            onRowClick={handleRowClick}
            sx={{
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              },
              cursor: 'pointer',
            }}
          />
        </Box>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Visit Details
              </Typography>
              {selectedPunch && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Salesperson:</strong> {selectedPunch.salespersonName}</Typography>
                    <Typography><strong>Lead:</strong> {selectedPunch.leadName}</Typography>
                    <Typography><strong>Project:</strong> {selectedPunch.projectName}</Typography>
                    <Typography><strong>Property:</strong> {selectedPunch.propertyName}</Typography>
                    <Typography><strong>Punch In:</strong> {selectedPunch.punchInTime}</Typography>
                    <Typography><strong>Punch Out:</strong> {selectedPunch.punchOutTime}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Date:</strong> {selectedPunch.date}</Typography>
                    <Typography><strong>Duration:</strong> {selectedPunch.duration} hours</Typography>
                    <Typography><strong>Address In:</strong> {selectedPunch.addressIn}</Typography>
                    <Typography><strong>Address Out:</strong> {selectedPunch.addressOut}</Typography>
                   {/* <Typography><strong>Lat/Long In:</strong> {selectedPunch.latIn}, {selectedPunch.lngIn}</Typography>
                    <Typography><strong>Lat/Long Out:</strong> {selectedPunch.latOut}, {selectedPunch.lngOut}</Typography> */}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Punch In Image
                    </Typography>
                    {selectedPunch.imageIn !== 'N/A' ? (
                      <img
                        src={`${API_BASE_URL_Image}/${selectedPunch.imageIn}`}
                        alt="Punch In"
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                      />
                    ) : (
                      <Typography>No Punch In Image</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Punch Out Image
                    </Typography>
                    {selectedPunch.imageOut !== 'N/A' ? (
                      <img
                        src={`${API_BASE_URL_Image}/${selectedPunch.imageOut}`}
                        alt="Punch Out"
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                      />
                    ) : (
                      <Typography>No Punch Out Image</Typography>
                    )}
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </Box>
  );
};

export default PunchListingPage;
