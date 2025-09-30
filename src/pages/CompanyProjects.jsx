import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, IconButton,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import API_ENDPOINTS from '../config/apiConfig';

const CompanyProjectsPage = () => {
  const { id } = useParams(); // companyId
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [form, setForm] = useState({
    projectName: '',
    budget: '',
    city: '',
    category: '',
    subType: '',
    startDate: '',
    images: []
  });
  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.PROJECTS_BY_COMPANY(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.projects || [];
      setProjects(data);
      setTotalProjects(data.length);
    } catch (err) {
      console.error('Error fetching projects', err);
      alert('Failed to fetch projects. Please try again.');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    setForm(prev => ({ ...prev, images: files }));
  };

  const logFormData = (formData) => {
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      // Append text fields
      formData.append('projectName', form.projectName);
      formData.append('budget', form.budget);
      formData.append('city', form.city);
      formData.append('category', form.category);
      formData.append('subType', form.subType);
      formData.append('startDate', form.startDate);

      // Append images if they exist
      if (form.images && form.images.length > 0) {
        Array.from(form.images).forEach(image => {
          formData.append('images', image); // Use the same key 'images' for all files
        });
      }

      // Log FormData for debugging
      logFormData(formData);

      let res;
      if (isEditing) {
        res = await axios.put(
          API_ENDPOINTS.PROJECT(editProjectId),
          formData,
          { headers: { Authorization: `Bearer ${token}` } } // Let axios set Content-Type with boundary
        );
        setProjects(prev => prev.map(p => p._id === editProjectId ? res.data.project : p));
      } else {
        res = await axios.post(
          API_ENDPOINTS.PROJECTS_BY_COMPANY(id),
          formData,
          { headers: { Authorization: `Bearer ${token}` } } // Let axios set Content-Type with boundary
        );
        setProjects(prev => [res.data.project, ...prev]);
        setTotalProjects(prev => prev + 1);
      }

      setOpenForm(false);
      setIsEditing(false);
      setEditProjectId(null);
      setForm({
        projectName: '',
        budget: '',
        city: '',
        category: '',
        subType: '',
        startDate: '',
        images: []
      });
    } catch (err) {
      console.error('Error saving project', err);
      alert(err.response?.data?.message || 'Could not save project. Please check your inputs and try again.');
    }
  };

  const handleView = (projectId) => {
    navigate(`/companies/${id}/projects/${projectId}/properties`);
  };

  const handleEdit = (project) => {
    setForm({
      projectName: project.projectName,
      budget: project.budget,
      city: project.city,
      category: project.category,
      subType: project.subType,
      startDate: project.startDate.split('T')[0],
      images: []
    });
    setIsEditing(true);
    setEditProjectId(project._id);
    setOpenForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(API_ENDPOINTS.PROJECT(projectId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(prev => prev.filter(p => p._id !== projectId));
      setTotalProjects(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting project', err);
      alert('Could not delete project. Please try again.');
    }
  };

  return (
    <Box p={4}>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/company')}
          sx={{ mb: 2 }}
        >
          Back to Companies
        </Button>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Project Management</Typography>
          <Button variant="contained" onClick={() => { setOpenForm(true); setIsEditing(false); }}>Add New Project</Button>
        </Box>
      </Box>
      <Paper sx={{ p: 3, mb: 3, width: '250px', textAlign: 'center' }}>
        <Typography variant="h6">{totalProjects} Total Project{totalProjects !== 1 ? 's' : ''}</Typography>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>SubType</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(project => (
              <TableRow key={project._id}>
                <TableCell>{project.projectName}</TableCell>
                <TableCell>{project.city}</TableCell>
                <TableCell>₹ {project.budget}</TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>{project.subType}</TableCell>
                <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(project._id)} color="primary"><VisibilityIcon /></IconButton>
                  <IconButton onClick={() => handleEdit(project)} color="secondary"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(project._id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Project Name" name="projectName" value={form.projectName} onChange={handleChange} fullWidth required />
            <TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth required />
            <TextField label="Budget" name="budget" value={form.budget} onChange={handleChange} fullWidth required />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={form.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="Residential">Residential</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
                <MenuItem value="Industrial">Industrial</MenuItem>
                <MenuItem value="Agricultural">Agricultural</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="SubType" name="subType" value={form.subType} onChange={handleChange} fullWidth required />
            <TextField label="Start Date" name="startDate" type="date" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={handleChange} fullWidth required />
            <input
              type="file"
              name="images"
              multiple
              onChange={handleImageChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyProjectsPage;
