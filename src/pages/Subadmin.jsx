import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SecurityIcon from "@mui/icons-material/Security";
import API_ENDPOINTS from "../config/apiConfig";

const SubAdminPage = () => {
  const [subadmins, setSubadmins] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [permissions, setPermissions] = useState({
    leads: { view: false, manage: false },
    projects: { view: false, manage: false },
    payments: { view: false, manage: false },
    reports: { view: false, manage: false },
    users: { view: false, manage: false },
    companies: { view: false, manage: false },
    properties: { view: false, manage: false },
    sites: { view: false, manage: false },
    inventory: { view: false, manage: false },
    dashboard: { view: false }
  });
  const token = localStorage.getItem("token");

  const roleOptions = [
    { value: "subadmin", label: "Sub Admin" },
    { value: "lead_manager", label: "Lead Manager" },
    { value: "project_manager", label: "Project Manager" },
    { value: "site_manager", label: "Site Manager" },
    { value: "account_manager", label: "Account Manager" },
    { value: "sales_manager", label: "Sales Manager" },
  ];

  const permissionLabels = {
    leads: "Leads Management",
    projects: "Projects Management", 
    payments: "Payments & Ledger",
    reports: "Reports & Analytics",
    users: "Users Management",
    companies: "Companies Management",
    properties: "Properties Management",
    sites: "Site Management",
    inventory: "Inventory Management",
    dashboard: "Dashboard Access"
  };

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SUBADMINS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubadmins(data.data || []);
    } catch (error) {
      console.error("Error fetching sub admins:", error);
      // Fallback to demo data if API fails
      setSubadmins([
        {
          _id: 'demo1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 9876543210',
          role: 'lead_manager',
          isActive: true,
          permissions: {
            leads: { view: true, manage: true },
            reports: { view: true, manage: false },
            dashboard: { view: true }
          }
        },
        {
          _id: 'demo2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 9876543211',
          role: 'project_manager',
          isActive: true,
          permissions: {
            projects: { view: true, manage: true },
            properties: { view: true, manage: true },
            reports: { view: true, manage: false },
            dashboard: { view: true }
          }
        }
      ]);
      setSnackbar({
        open: true,
        message: "Using demo data - Backend connection issue detected",
        severity: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.role) errors.role = "Role is required";
    if (openCreate && !formData.password) {
      errors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      phone: admin.phone || "",
      email: admin.email,
      role: admin.role,
      password: "",
      confirmPassword: "",
    });
    setOpenEdit(true);
  };

  const handlePermissionsClick = (admin) => {
    setSelectedAdmin(admin);
    setPermissions(admin.permissions || {
      leads: { view: false, manage: false },
      projects: { view: false, manage: false },
      payments: { view: false, manage: false },
      reports: { view: false, manage: false },
      users: { view: false, manage: false },
      companies: { view: false, manage: false },
      properties: { view: false, manage: false },
      sites: { view: false, manage: false },
      inventory: { view: false, manage: false },
      dashboard: { view: false }
    });
    setOpenPermissions(true);
  };

  const handlePermissionChange = (resource, action, value) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: value
      }
    }));
  };

  const handleDialogClose = () => {
    setOpenCreate(false);
    setOpenEdit(false);
    setOpenPermissions(false);
    resetForm();
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setActionLoading(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
      };

      const response = await fetch(API_ENDPOINTS.SUBADMINS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create subadmin");
      }

      await fetchSubAdmins();
      setSnackbar({
        open: true,
        message: `Successfully created ${formData.role.replace('_', ' ')}`,
        severity: "success",
      });
      setOpenCreate(false);
      resetForm();
    } catch (error) {
      console.error("Error creating subadmin:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to create subadmin",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm() || !selectedAdmin) return;
    setActionLoading(true);
    
    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: true
      };
      
      // Only include password if it's being updated
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(API_ENDPOINTS.SUBADMINS + `/${selectedAdmin._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update subadmin");
      }

      // Refresh the subadmins list and show success message
      await fetchSubAdmins();
      setSnackbar({
        open: true,
        message: `Successfully updated ${formData.role.replace('_', ' ')}`,
        severity: "success",
      });
      setOpenEdit(false);
      resetForm();
    } catch (error) {
      console.error("Error updating subadmin:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update subadmin",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subadmin?")) return;
    setActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SUBADMINS + `/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete subadmin");
      }
      setSnackbar({
        open: true,
        message: "Subadmin deleted successfully",
        severity: "success",
      });
      fetchSubAdmins();
    } catch (error) {
      console.error("Error deleting subadmin:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete subadmin",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedAdmin) return;
    setActionLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.SUBADMINS + `/${selectedAdmin._id}/permissions`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update permissions");
      }

      await fetchSubAdmins();
      setSnackbar({
        open: true,
        message: "Permissions updated successfully",
        severity: "success",
      });
      setOpenPermissions(false);
    } catch (error) {
      console.error("Error updating permissions:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update permissions",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sub Admins Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
          disabled={loading || actionLoading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Add New Sub Admin
        </Button>
      </Box>

      {loading && subadmins.length === 0 ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subadmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No subadmins found
                  </TableCell>
                </TableRow>
              ) : (
                subadmins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.phone || "N/A"}</TableCell>
                    <TableCell>
                      {roleOptions.find((r) => r.value === admin.role)?.label || admin.role}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          p: "4px 8px",
                          borderRadius: 1,
                          bgcolor: admin.isActive ? "success.light" : "error.light",
                          color: "white",
                          fontSize: "0.75rem",
                          fontWeight: "medium",
                        }}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SecurityIcon />}
                        onClick={() => handlePermissionsClick(admin)}
                        disabled={loading || actionLoading}
                      >
                        Manage
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(admin)}
                        disabled={loading || actionLoading}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(admin._id)}
                        disabled={loading || actionLoading}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Sub Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={loading || actionLoading}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading || actionLoading}
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone Number"
              type="tel"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              disabled={loading || actionLoading}
            />
            <FormControl fullWidth margin="dense" error={!!formErrors.role}>
              <InputLabel>Role *</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role *"
                disabled={loading || actionLoading}
              >
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.role && (
                <Typography variant="caption" color="error">
                  {formErrors.role}
                </Typography>
              )}
            </FormControl>
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password || "Minimum 6 characters"}
              disabled={loading || actionLoading}
            />
            <TextField
              margin="dense"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={loading || actionLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            color="primary"
            variant="contained"
            disabled={loading || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            Create Sub Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Sub Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={loading || actionLoading}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading || actionLoading}
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone Number"
              type="tel"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              disabled={loading || actionLoading}
            />
            <FormControl fullWidth margin="dense" error={!!formErrors.role}>
              <InputLabel>Role *</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role *"
                disabled={loading || actionLoading}
              >
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.role && (
                <Typography variant="caption" color="error">
                  {formErrors.role}
                </Typography>
              )}
            </FormControl>
            <TextField
              margin="dense"
              name="password"
              label="Password (Leave blank to keep current)"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password || "Minimum 6 characters"}
              disabled={loading || actionLoading}
            />
            <TextField
              margin="dense"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={loading || actionLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            color="primary"
            variant="contained"
            disabled={loading || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            Update Sub Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={openPermissions} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SecurityIcon />
            Manage Permissions - {selectedAdmin?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {Object.entries(permissionLabels).map(([resource, label]) => (
              <Accordion key={resource} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {label}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                    {permissions[resource]?.view && (
                      <Chip label="View" size="small" color="primary" />
                    )}
                    {permissions[resource]?.manage && (
                      <Chip label="Manage" size="small" color="secondary" />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={permissions[resource]?.view || false}
                            onChange={(e) => handlePermissionChange(resource, 'view', e.target.checked)}
                            disabled={loading || actionLoading}
                          />
                        }
                        label="View Access"
                      />
                    </Grid>
                    {resource !== 'dashboard' && (
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={permissions[resource]?.manage || false}
                              onChange={(e) => handlePermissionChange(resource, 'manage', e.target.checked)}
                              disabled={loading || actionLoading}
                            />
                          }
                          label="Manage Access (Create, Edit, Delete)"
                        />
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePermissions}
            color="primary"
            variant="contained"
            disabled={loading || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <SecurityIcon />}
          >
            Update Permissions
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubAdminPage;
