import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import API_ENDPOINTS from "../config/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PropertyPage = () => {
  const { id: companyId, projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("property");
  const [properties, setProperties] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [form, setForm] = useState({
    propertyName: "",
    location: "",
    category: "Residential",
    budget: "",
    propertyArea: "",
    measurementUnit: "sqft",
    image: null,
  });
  const token = localStorage.getItem("token");

  const fetchProperties = async () => {
    try {
      const res = await axios.get(
        projectId
          ? API_ENDPOINTS.PROPERTIES_BY_PROJECT(projectId)
          : API_ENDPOINTS.PROPERTIES_BY_COMPANY(companyId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProperties(res.data.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error.response?.data || error);
    }
  };

  const fetchSalespersons = async () => {
    try {
      if (!companyId) {
        console.log('No companyId provided, skipping salespersons fetch');
        setSalespersons([]);
        return;
      }
      const url = API_ENDPOINTS.SALESPERSONS_BY_COMPANY(companyId);
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalespersons(res.data.salespersons || []);
    } catch (error) {
      console.error("Error fetching salespersons:", error.response?.data || error);
      setSalespersons([]);
    }
  };

  useEffect(() => {
    if (activeTab === "property") {
      fetchProperties();
    } else {
      fetchSalespersons();
    }
  }, [activeTab, projectId, companyId]);

  const handleCreate = () => {
    setForm({
      propertyName: "",
      location: "",
      category: "Residential",
      budget: "",
      propertyArea: "",
      measurementUnit: "sqft",
      image: null,
    });
    setEditProperty(null);
    setOpen(true);
  };

  const handleEdit = (property) => {
    setForm({
      propertyName: property.propertyName,
      location: property.location,
      category: property.category,
      budget: property.budget,
      propertyArea: property.propertyArea,
      measurementUnit: property.measurementUnit,
      image: null,
    });
    setEditProperty(property);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(API_ENDPOINTS.PROPERTY(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(properties.filter((p) => p._id !== id));
      } catch (error) {
        console.error("Error deleting property:", error.response?.data || error);
      }
    }
  };

  const handleView = async (id) => {
    try {
      const res = await axios.get(API_ENDPOINTS.PROPERTY(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error("Error fetching property details:", error.response?.data || error);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("propertyName", form.propertyName);
      formData.append("location", form.location);
      formData.append("category", form.category);
      formData.append("budget", form.budget);
      formData.append("propertyArea", form.propertyArea);
      formData.append("measurementUnit", form.measurementUnit);
      if (form.image) {
        formData.append("image", form.image);
      }

      if (editProperty) {
        const res = await axios.put(
          API_ENDPOINTS.PROPERTY(editProperty._id),
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setProperties(
          properties.map((p) =>
            p._id === editProperty._id ? res.data.property : p
          )
        );
      } else {
        const res = await axios.post(
          API_ENDPOINTS.PROPERTIES_BY_PROJECT(projectId),
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setProperties([res.data.property, ...properties]);
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving property:", error.response?.data || error);
    }
  };

  return (
    <Box p={4}>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => projectId ? navigate(`/companies/${companyId}/projects`) : navigate('/projects')}
          sx={{ mb: 2 }}
        >
          {projectId ? 'Back to Project' : 'Back to Companies'}
        </Button>
        <Typography variant="h4">
          Property Management
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Detailed Overview of the Project / Company
      </Typography>
      <Box display="flex" gap={1} mb={2}>
        <Button
          variant={activeTab === "property" ? "contained" : "outlined"}
          onClick={() => setActiveTab("property")}
        >
          Property
        </Button>
        <Button
          variant={activeTab === "salesperson" ? "contained" : "outlined"}
          onClick={() => setActiveTab("salesperson")}
        >
          Salesperson
        </Button>
        {activeTab === "property" && (
          <Box ml="auto">
            <Button variant="contained" onClick={handleCreate}>
              Add Property
            </Button>
          </Box>
        )}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {activeTab === "property" ? (
                <>
                  <TableCell><b>Property Name</b></TableCell>
                  <TableCell><b>Location</b></TableCell>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Budget</b></TableCell>
                  <TableCell><b>Property Area</b></TableCell>
                  <TableCell><b>Measurement Unit</b></TableCell>
                  <TableCell><b>Action</b></TableCell>
                </>
              ) : (
                <>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Phone</b></TableCell>
                  <TableCell><b>Designation</b></TableCell>
                  <TableCell><b>Company</b></TableCell>
                  <TableCell><b>Project</b></TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {activeTab === "property" ? (
              properties.length ? (
                properties.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>{p.propertyName}</TableCell>
                    <TableCell>{p.location}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>₹ {p.budget}</TableCell>
                    <TableCell>{p.propertyArea}</TableCell>
                    <TableCell>{p.measurementUnit}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEdit(p)}>
                        Edit
                      </Button>
                      <Button size="small" onClick={() => handleView(p._id)}>
                        View
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No properties found.
                  </TableCell>
                </TableRow>
              )
            ) : salespersons.length ? (
              salespersons.map((sp) => (
                <TableRow key={sp._id}>
                  <TableCell>{sp.name}</TableCell>
                  <TableCell>{sp.email}</TableCell>
                  <TableCell>{sp.phone}</TableCell>
                  <TableCell>{sp.designation}</TableCell>
                  <TableCell>
                    {sp.companyId?.name || sp.companyId?.companyName || "—"}
                  </TableCell>
                  <TableCell>{sp.projectId?.projectName || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No salespersons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editProperty ? "Edit Property" : "New Property"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Property Details
          </Typography>
          <TextField
            fullWidth
            label="Property Name"
            value={form.propertyName}
            onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Budget"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Category"
            select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            margin="normal"
          >
            <MenuItem value="Residential">Residential</MenuItem>
            <MenuItem value="Commercial">Commercial</MenuItem>
            <MenuItem value="Industrial">Industrial</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Property Area"
            value={form.propertyArea}
            onChange={(e) => setForm({ ...form, propertyArea: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Measurement Unit"
            select
            value={form.measurementUnit}
            onChange={(e) => setForm({ ...form, measurementUnit: e.target.value })}
            margin="normal"
          >
            <MenuItem value="sqft">sqft</MenuItem>
            <MenuItem value="sqm">sqm</MenuItem>
            <MenuItem value="acre">acre</MenuItem>
            <MenuItem value="hectare">hectare</MenuItem>
          </TextField>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            style={{ marginTop: "16px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editProperty ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyPage;
