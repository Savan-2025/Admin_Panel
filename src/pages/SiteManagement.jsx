import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Paper,
  CardActionArea,
} from "@mui/material";
import API_ENDPOINTS from "../config/apiConfig";
import axios from "axios";

const SiteManagement = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    siteName: "",
    location: "",
    startDate: "",
  });

  useEffect(() => {
    fetchSites();
    fetchAnalytics();
  }, []);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_ENDPOINTS.SITES, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setSites(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching sites:", err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_ENDPOINTS.SITES_ANALYTICS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
        setAnalytics(res.data?.data);
    } catch (err) {
      console.error("Error fetching site analytics:", err);
      // Set fallback analytics
      setAnalytics({
        totalSites: sites.length,
        totalItems: sites.totalItems,
        totalStock: sites.totalStock,
        lowStockCount: sites.lowStockCount
      });
    }
  };

  const handleOpen = (site = null) => {
    if (site) {
      setFormData({
        siteName: site.siteName || "",
        location: site.location || "",
        startDate: site.startDate ? new Date(site.startDate).toISOString().split('T')[0] : ""
      });
      setCurrentId(site._id);
      setEditMode(true);
    } else {
      setFormData({ siteName: "", location: "", startDate: "" });
      setCurrentId(null);
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setFormData({ siteName: "", location: "", startDate: "" });
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.siteName || !formData.location || !formData.startDate) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const token = localStorage.getItem("token");
      const payload = {
        siteName: formData.siteName,
        location: formData.location,
        startDate: formData.startDate
      };

      if (editMode) {
        await axios.put(
          `${API_ENDPOINTS.SITES}/${currentId}`, 
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        alert('Site updated successfully!');
      } else {
        await axios.post(
          API_ENDPOINTS.SITES, 
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        alert('Site created successfully!');
      }
      
      fetchSites();
      handleClose();
    } catch (err) {
      console.error("Error saving site:", err);
      const errorMessage = err.response?.data?.message || 'Failed to save site. Please try again.';
      alert(errorMessage);
      
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this site?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_ENDPOINTS.SITES}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSites();
    } catch (err) {
      console.error("Error deleting site:", err);
    }
  };

  return (
    <Box p={3}>
      {/* Title */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Site Details
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>
        Your trusted partner in delivering innovative solutions and unmatched value.
      </Typography>

      {/* Dynamic Analytics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            textAlign: "center",
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" fontWeight="bold">
              {analytics?.totalSites || sites.length}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Total Sites
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            textAlign: "center",
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" fontWeight="bold">
              {analytics?.totalItems || 10}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Total Items
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            textAlign: "center",
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" fontWeight="bold">
              {analytics?.totalStock || 25}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Total Stock
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            textAlign: "center",
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" fontWeight="bold">
              {analytics?.lowStockCount || 3}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Low Stock Items
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Header with Add Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">All Sites</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add New Site
        </Button>
      </Box>

      {/* Sites as Cards */}
      <Grid container spacing={3}>
        {sites.length > 0 ? (
          sites.map((site) => (
            <Grid item xs={12} sm={6} md={4} key={site._id}>
              <Card key={site._id} sx={{ minWidth: 275, m: 2 }}>
                <CardActionArea onClick={() => navigate(`/item/${site._id}`)}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {site.siteName}
                    </Typography>
                    <Typography color="text.secondary">
                      {site.location}
                    </Typography>
                    <Typography variant="body2">
                      Start Date: {new Date(site.startDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Button size="small" color="primary" onClick={() => handleOpen(site)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(site._id)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No sites available.
          </Typography>
        )}
      </Grid>

      {/* Add/Edit Site Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? "Edit Site" : "Add New Site"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Site Name"
            name="siteName"
            fullWidth
            margin="dense"
            value={formData.siteName}
            onChange={handleChange}
          />
          <TextField
            label="Location"
            name="location"
            fullWidth
            margin="dense"
            value={formData.location}
            onChange={handleChange}
          />
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteManagement;
