import React, { useEffect, useState } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, Typography, MenuItem, Chip
} from '@mui/material';
import axios from 'axios';
import API_ENDPOINTS from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';

const Salespersons = () => {
  const navigate = useNavigate();
  const [salespersons, setSalespersons] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editPerson, setEditPerson] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    address: '', designation: '', location: '',
    profilePhoto: null, EmployeeId: '',
    companyId: '', projects: []
  });

  const token = localStorage.getItem('token');

  // Fetch salespersons
  const fetchSalespersons = async (pageNumber = 1) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.SALESPERSONS_BY_COMPANY('all'),
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pageNumber,
            name: searchTerm || undefined
          }
        }
      );

      const newSalespersons = response.data.salespersons || [];

      if (pageNumber === 1) {
        setSalespersons(newSalespersons);
      } else {
        setSalespersons((prev) => [...prev, ...newSalespersons]);
      }

      setHasMore(newSalespersons.length >= 10);
    } catch (error) {
      console.error('Error fetching salespersons:', error);
    }
  };

  useEffect(() => {
    fetchSalespersons(page);
  }, [page, searchTerm]);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.COMPANIES, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompanies(res.data.companies || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, [token]);

  // Fetch projects when company changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (!form.companyId) return;
      try {
        const res = await axios.get(API_ENDPOINTS.PROJECTS_BY_COMPANY(form.companyId), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [form.companyId, token]);

  // Form change handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePhoto') {
      setForm((prev) => ({ ...prev, profilePhoto: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Multi-select project change
  const handleProjectsChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      projects: typeof value === 'string' ? value.split(',') : value
    }));
  };

  // Open create form
  const handleCreate = () => {
    setForm({
      name: '', email: '', password: '', phone: '',
      address: '', designation: '', location: '',
      profilePhoto: null, EmployeeId: '',
      companyId: '', projects: []
    });
    setEditPerson(null);
    setOpen(true);
  };

  // Open edit form
  const handleEdit = (person) => {
    setForm({
      name: person.name || '',
      email: person.email || '',
      password: '',
      phone: person.phone || '',
      address: person.address || '',
      designation: person.designation || '',
      location: person.location || '',
      profilePhoto: null,
      EmployeeId: person.EmployeeId || '',
      companyId: person.companyId?._id || '',
      projects: person.projects?.map((p) => p._id) || []
    });
    setEditPerson(person);
    setOpen(true);
  };

  const handleView = (person) => {
    navigate(`/SalespersonDetails/${person._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this salesperson?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.ALLUSERS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalespersons((prev) => prev.filter((p) => p._id !== id));
      } catch (error) {
        console.error('Error deleting salesperson:', error);
      }
    }
  };

  // Submit create/update
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "projects" && Array.isArray(value)) {
          value.forEach((id) => formData.append("projects[]", id));
        } else if (value) {
          formData.append(key, value);
        }
      });
      formData.append('role', 'salesperson');

      if (editPerson) {
        const res = await axios.put(`${API_ENDPOINTS.ALLUSERS}/${editPerson._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          }
        });
        setSalespersons((prev) =>
          prev.map((p) => p._id === editPerson._id ? res.data.user : p)
        );
      } else {
        const res = await axios.post(API_ENDPOINTS.REGISTER, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          }
        });
        setSalespersons([res.data.user, ...salespersons]);
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving salesperson:', error);
      alert(error.response?.data?.message || 'Error saving salesperson');
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Salespersons</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Search by Name"
            size="small"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create Salesperson
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Employee Id</strong></TableCell>
              <TableCell><strong>Company</strong></TableCell>
              <TableCell><strong>Projects</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salespersons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">No salespersons found.</TableCell>
              </TableRow>
            ) : (
              salespersons.map((person) => (
                <TableRow key={person._id}>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  <TableCell>{person.phone}</TableCell>
                  <TableCell>{person.location}</TableCell>
                  <TableCell>{person.EmployeeId}</TableCell>
                  <TableCell>{person.companyId?.name || person.companyId?.companyName || '—'}</TableCell>
                  <TableCell>
                    {person.projects?.length > 0 ? (
                      person.projects.map((p) => (
                        <Chip key={p._id} label={p.projectName} size="small" sx={{ mr: 0.5 }} />
                      ))
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleEdit(person)}>Edit</Button>
                    <Button size="small" onClick={() => handleView(person)}>View</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(person._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMore && (
        <Box mt={2} textAlign="center">
          <Button variant="outlined" onClick={() => setPage((prev) => prev + 1)}>
            Next Page
          </Button>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editPerson ? 'Edit Salesperson' : 'Create Salesperson'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" type="password" name="password" value={form.password} onChange={handleChange} required={!editPerson} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Employee Id" name="EmployeeId" value={form.EmployeeId} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Designation" name="designation" value={form.designation} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} />
            </Grid>

            {/* Company dropdown */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Company"
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                required
                variant="outlined"
                SelectProps={{
                  renderValue: (selected) => {
                    if (!selected) return "Select Company";
                    const company = companies.find((c) => c._id === selected);
                    return company ? (company.name || company.companyName) : "Select Company";
                  },
                }}
              >
                {companies.length === 0 ? (
                  <MenuItem disabled>No companies found</MenuItem>
                ) : (
                  companies.map((company) => (
                    <MenuItem key={company._id} value={company._id}>
                      {company.name || company.companyName}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            {/* Projects multi-select */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Projects (optional)"
                name="projects"
                value={form.projects}
                onChange={handleProjectsChange}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    const selectedProjects = projects.filter((p) => selected.includes(p._id));
                    return selectedProjects.map((p) => p.projectName).join(', ');
                  }
                }}
              >
                {!form.companyId ? (
                  <MenuItem disabled>Please select a company first</MenuItem>
                ) : projects.length === 0 ? (
                  <MenuItem disabled>No projects found for this company</MenuItem>
                ) : (
                  projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.projectName}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            {/* Profile photo */}
            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                Upload Profile Photo
                <input type="file" name="profilePhoto" hidden onChange={handleChange} />
              </Button>
              {form.profilePhoto && (
                <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                  {form.profilePhoto.name || form.profilePhoto}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editPerson ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Salespersons;
