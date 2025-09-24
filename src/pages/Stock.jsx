// src/pages/InventoryDetailPage.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import apiConfig from "../config/apiConfig";

// Create axios instance with auth token
const api = axios.create();

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const units = ["Ton", "quintal", "Pieces"];

const InventoryDetailPage = () => {
  const [item, setItem] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [formData, setFormData] = useState({
    itemId: window.location.pathname.split('/').pop(), // Changed from 'item' to 'itemId' to match backend
    type: "in", // 'in' for adding stock, 'out' for using stock
    usedIn: "", // Added required field
    location: "", // Required field
    quantity: "",
    unit: "Ton",
    date: new Date().toISOString().split('T')[0], // Today's date as default
    notes: ""
  });
  const [editId, setEditId] = useState(null);

  // Fetch Item & Stocks
  const fetchData = async () => {
    try {
      // Get item ID from URL
      const itemId = window.location.pathname.split('/').pop();
      
      if (!itemId) {
        console.error('No item ID found in URL');
        return;
      }
      
      // First fetch item details
      const itemRes = await api.get(`${apiConfig.ITEMS}/${itemId}`);
      setItem(itemRes.data);

      try {
        // Then fetch stock data with proper error handling
        const stockRes = await api.get(apiConfig.STOCKS, {
          params: { itemId: itemId }
        });
        
        // Process stock data - handle both array and object responses
        const stocksData = Array.isArray(stockRes.data) ? stockRes.data : 
                         stockRes.data?.data || [];
        setStocks(stocksData);
      } catch (stockError) {
        console.warn('Error fetching stock data:', stockError.message);
        setStocks([]); // Set empty array if stock fetch fails
      }
    } catch (error) {
      console.error("Error fetching data", error);
      // Show error message to user
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Failed to fetch data. Please try again.";
      alert(errorMessage);
      
      // If it's a 404, it might mean the item doesn't exist
      if (error.response?.status === 404) {
        // Optionally navigate back or show a not found message
        console.log('Item not found, navigating back...');
        // navigate(-1); // Uncomment this if you want to navigate back on 404
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Form Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Stock Usage
  const handleAddStock = async () => {
    try {
      // Get item ID from URL
      const itemId = window.location.pathname.split('/').pop();
      
      // Validate required fields
      const requiredFields = ['usedIn', 'location', 'quantity', 'unit'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Validate quantity is a positive number
      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity (must be greater than 0)');
        return;
      }

      // Get token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Prepare the stock data according to server requirements
      const stockData = {
        itemId: itemId,
        usedIn: formData.usedIn.trim(),
        location: formData.location.trim(),
        quantity: quantity,
        unit: formData.unit,
        date: formData.date,
        ...(formData.notes?.trim() && { notes: formData.notes.trim() })
      };
      
      console.log('Sending stock data:', JSON.stringify(stockData, null, 2));
      
      // Make the API call with proper headers
      const response = await fetch(apiConfig.STOCKS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stockData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add stock');
      }
      
      console.log('Stock added successfully:', responseData);
      
      // Refresh the data and reset form
      await fetchData();
      setOpenModal(false);
      setFormData({
        ...formData,
        usedIn: "",
        location: "",
        quantity: "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
      });
      
      alert('Stock added successfully!');
    } catch (error) {
      console.error("Error adding stock", error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         "Failed to add stock. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (stock) => {
    setEditId(stock._id);
    setFormData({
      itemId: stock.itemId || stock.item?._id || '',
      type: stock.type || 'in',
      usedIn: stock.usedIn || '',
      location: stock.location || '',
      quantity: stock.quantity || '',
      unit: stock.unit || 'Ton',
      date: stock.date ? stock.date.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: stock.notes || ''
    });
    setEditModal(true);
  };

  // Edit Stock Usage
  const handleEditStock = async () => {
    if (!editId) {
      alert('No stock item selected for editing');
      return;
    }

    try {
      // Get the current item ID from the URL
      const itemId = window.location.pathname.split('/').pop();
      
      if (!itemId) {
        alert('Could not determine the item. Please refresh the page and try again.');
        return;
      }

      // Validate required fields
      const requiredFields = ['usedIn', 'location', 'quantity', 'unit'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Validate quantity is a positive number
      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity (must be greater than 0)');
        return;
      }

      // Prepare the updated stock data
      const updatedStockData = {
        itemId: itemId,
        type: formData.type || 'in',
        usedIn: formData.usedIn.trim(),
        location: formData.location.trim(),
        quantity: quantity,
        unit: formData.unit || 'Ton',
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes?.trim() || ''
      };
      
      console.log('Updating stock with data:', { id: editId, data: updatedStockData });
      
      // Make API call
      const response = await api.put(`${apiConfig.STOCKS}/${editId}`, updatedStockData);
      
      if (response.data && response.data.success) {
        // Refresh data and reset form
        await fetchData();
        setEditModal(false);
        setEditId(null);
        
        // Reset form data
        setFormData({
          itemId: itemId,
          type: 'in',
          usedIn: '',
          location: '',
          quantity: '',
          unit: 'Ton',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        
        alert('Stock updated successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error("Error editing stock", error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         "Failed to update stock. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  // Delete Stock Usage
  const handleDeleteStock = async (id) => {
    if (!id) {
      console.error("No stock ID provided for deletion");
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this stock record?')) {
      return;
    }
    
    try {
      await api.delete(`${apiConfig.STOCKS}/${id}`);
      fetchData();
      alert('Stock record deleted successfully!');
    } catch (error) {
      console.error("Error deleting stock", error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Failed to delete stock record. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Inventory Details
      </Typography>

      {/* Item Information Card */}
      {item && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Basic Item Information</Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <Typography>Material Name: {item.itemName}</Typography>
                <Typography>Quantity: {item.quantity} {item.unit}</Typography>
                <Typography>Storage Location: {item.location}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Date Last Updated: {new Date(item.updatedAt).toLocaleDateString()}</Typography>
                <Typography>Status: Available</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Stock Usage Log */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Stock Usage Log</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Add Item Usage
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Used In</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => {
              const stockId = stock._id || stock.id; // Handle both _id and id
              return (
                <TableRow key={stockId}>
                  <TableCell>{stock.usedIn}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>{stock.unit}</TableCell>
                  <TableCell>{stock.date ? new Date(stock.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{stock.location || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setEditId(stockId);
                        setFormData({
                          ...stock,
                          itemId: stock.itemId || stock.item?._id || window.location.pathname.split('/').pop()
                        });
                        setEditModal(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteStock(stockId)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Add Stock Usage</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Used In" name="usedIn" fullWidth value={formData.usedIn} onChange={handleChange} />
          <TextField margin="dense" label="Location" name="location" fullWidth value={formData.location} onChange={handleChange} />
          <TextField margin="dense" label="Quantity" name="quantity" fullWidth type="number" value={formData.quantity} onChange={handleChange} />
          <TextField margin="dense" select label="Unit" name="unit" fullWidth value={formData.unit} onChange={handleChange}>
            {units.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>
          <TextField margin="dense" label="Date" name="date" fullWidth type="date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddStock} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModal} onClose={() => setEditModal(false)}>
        <DialogTitle>Edit Stock Usage</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Used In" name="usedIn" fullWidth value={formData.usedIn} onChange={handleChange} />
          <TextField margin="dense" label="Location" name="location" fullWidth value={formData.location} onChange={handleChange} />
          <TextField margin="dense" label="Quantity" name="quantity" fullWidth type="number" value={formData.quantity} onChange={handleChange} />
          <TextField margin="dense" select label="Unit" name="unit" fullWidth value={formData.unit} onChange={handleChange}>
            {units.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>
          <TextField margin="dense" label="Date" name="date" fullWidth type="date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModal(false)}>Cancel</Button>
          <Button onClick={handleEditStock} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDetailPage;
