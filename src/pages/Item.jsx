import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Stack
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import apiConfig from "../config/apiConfig";
import axios from "axios";

const Item = () => {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "",
    minQuantity: "",
    unit: "pieces",
    carNo: "",
    receivingPerson: "",
    siteId: siteId
  });
  const [editingItem, setEditingItem] = useState(null);

  // Fetch Site Details and Items
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // ✅ Fetch site details
      const siteRes = await axios.get(`${apiConfig.SITES}/${siteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSite(siteRes.data?.data || siteRes.data); // backend may return {data: {}} or just {}

      // ✅ Fetch items for this site
      const itemsRes = await axios.get(`${apiConfig.ITEMS}?siteId=${siteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle the response structure from the backend
      setItems(itemsRes.data?.items || itemsRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setSnackbar({
        open: true,
        message: "Failed to fetch data",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchData();
    }
  }, [siteId]);

  // Add or Update Item
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (editingItem) {
        // Update existing item
        await axios.put(
          `${apiConfig.ITEMS}/${editingItem._id}`,
          { ...formData, siteId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({
          open: true,
          message: "Item updated successfully!",
          severity: "success"
        });
      } else {
        // Add new item
        await axios.post(
          apiConfig.ITEMS,
          { ...formData, siteId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({
          open: true,
          message: "Item added successfully!",
          severity: "success"
        });
      }

      setOpen(false);
      setEditingItem(null);
      setFormData({
        itemName: "",
        quantity: "",
        unit: "pieces",
        carNo: "",
        receivingPerson: "",
        siteId: siteId
      });

      fetchData();
    } catch (err) {
      console.error("Error adding item:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to add item",
        severity: "error"
      });
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        itemName: item.itemName,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        unit: item.unit,
        carNo: item.carNo || "",
        receivingPerson: item.receivingPerson || "",
        siteId: siteId
      });
    } else {
      setEditingItem(null);
      setFormData({
        itemName: "",
        quantity: "",
        minQuantity: "",
        unit: "pieces",
        carNo: "",
        receivingPerson: "",
        siteId: siteId
      });
    }
    setOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiConfig.ITEMS}/${itemToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({
        open: true,
        message: "Item deleted successfully!",
        severity: "success"
      });
      
      setDeleteDialogOpen(false);
      fetchData(); // Refresh the items list
    } catch (err) {
      console.error("Error deleting item:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete item",
        severity: "error"
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!site) {
    return (
      <Box p={3}>
        <Typography variant="h6">Site not found</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{site.siteName} - Items</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add New Item
        </Button>
      </Box>

      {/* Site Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Site Information</Typography>
          <Typography>Location: {site.location}</Typography>
          <Typography>
            Start Date: {site.startDate ? new Date(site.startDate).toLocaleDateString() : "-"}
          </Typography>
        </CardContent>
      </Card>

      {/* Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Min Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Car No</TableCell>
              <TableCell>Receiving Person</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.minQuantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.carNo || "-"}</TableCell>
                  <TableCell>{item.receivingPerson || "-"}</TableCell>
                  <TableCell>
                    {item.quantity === 0
                      ? "Out of Stock"
                      : item.quantity < 50
                        ? "Low Stock"
                        : "Available"}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        color="primary" 
                        onClick={() => navigate(`/stock/${item._id}`)}
                        title="View Item"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleOpenDialog(item)}
                        title="Edit Item"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(item)}
                        title="Delete Item"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No items found for this site
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Item Dialog */}
      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingItem(null);
      }} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item to ' + site.siteName}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            fullWidth
            label="Item Name"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            fullWidth
            type="number"
            label="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            fullWidth
            type="number"
            label="Min Quantity"
            value={formData.minQuantity}
            onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            select
            fullWidth
            label="Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          >
            <MenuItem value="ton">Ton</MenuItem>
            <MenuItem value="quintal">Quintal</MenuItem>
            <MenuItem value="pieces">Pieces</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            fullWidth
            label="Car No (Optional)"
            value={formData.carNo}
            onChange={(e) => setFormData({ ...formData, carNo: e.target.value })}
          />
          <TextField
            margin="dense"
            fullWidth
            label="Receiving Person (Optional)"
            value={formData.receivingPerson}
            onChange={(e) => setFormData({ ...formData, receivingPerson: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the item "{itemToDelete?.itemName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Item;
