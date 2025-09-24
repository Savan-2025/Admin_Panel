import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, IconButton, CircularProgress, MenuItem, 
  FormControl, InputLabel, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import API_ENDPOINTS from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';

// Table header cells
const StyledTableCell = ({ children }) => (
  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
    {children}
  </TableCell>
);

// Table row component for company
const CompanyRow = ({ company, onEdit, onDelete, onView }) => (
  <TableRow hover>
    <TableCell>{company.companyName}</TableCell>
    <TableCell>{company.companyType}</TableCell>
    <TableCell>{company.city}</TableCell>
    <TableCell>{company.contactNumber}</TableCell>
    <TableCell>{company.emailId}</TableCell>
    <TableCell>{company.ownerDirectorName || '-'}</TableCell>
    <TableCell>
      <Stack direction="row" spacing={1}>
        <IconButton size="small" onClick={() => onEdit(company)} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(company._id)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onView(company._id)} color="info">
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Stack>
    </TableCell>
  </TableRow>
);

const CompaniesPage = () => {
  const navigate = useNavigate(); // ✅ Now inside the component

  const [companies, setCompanies] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    companyName: '',
    companyType: '',
    city: '',
    contactNumber: '',
    pageId: '',
    emailId: '',
    ownerDirectorName: '',
    gstNumber: '',
    panNumber: ''
  });
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token = localStorage.getItem('token');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.COMPANIES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.companies ?? res.data;
      setCompanies(data);
    } catch (err) {
      console.error('Fetch companies error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsCount = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.PROJECTS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 1 }
      });
      const total = res.data.total ?? (Array.isArray(res.data) ? res.data.length : 0);
      setProjectsCount(total);
    } catch (err) {
      console.error('Fetch projects error', err);
      setProjectsCount(0);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchProjectsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      companyName: '',
      companyType: '',
      city: '',
      contactNumber: '',
      pageId: '',
      emailId: '',
      ownerDirectorName: '',
      gstNumber: '',
      panNumber: ''
    });
    setOpenForm(true);
  };

  const openEdit = (company) => {
    setEditing(company);
    setForm({
      companyName: company.companyName || '',
      companyType: company.companyType || '',
      city: company.city || '',
      contactNumber: company.contactNumber || '',
      pageId: company.pageId || '',
      emailId: company.emailId || '',
      ownerDirectorName: company.ownerDirectorName || '',
      gstNumber: company.gstNumber || '',
      panNumber: company.panNumber || ''
    });
    setOpenForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API_ENDPOINTS.COMPANIES}/${editing._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(API_ENDPOINTS.COMPANIES, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setOpenForm(false);
      fetchCompanies();
      setPage(0);
    } catch (err) {
      console.error('Error saving company', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - companies.length) : 0;
  const paginatedCompanies = companies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await axios.delete(`${API_ENDPOINTS.COMPANIES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Delete company error', err);
      alert(err.response?.data?.message || 'Could not delete company');
    }
  };

  const handleView = (companyId) => {
    navigate(`/companies/${companyId}/projects`);
  };

  return (
    <Box p={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Companies</Typography>
        <Button variant="contained" onClick={openCreate}>
          Add Company
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Company Name</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell>City</StyledTableCell>
                  <StyledTableCell>Contact</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Owner/Director</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCompanies.map((company) => (
                  <CompanyRow
                    key={company._id}
                    company={company}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={companies.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Company' : 'Add New Company'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} fullWidth required />
            <FormControl fullWidth required>
              <InputLabel>Company Type</InputLabel>
              <Select
                name="companyType"
                value={form.companyType}
                label="Company Type"
                onChange={handleChange}
              >
                <MenuItem value="Residential">Residential</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
                <MenuItem value="Industrial">Industrial</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth required />
            <TextField label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} fullWidth required />
            <TextField label="Email ID" name="emailId" value={form.emailId} onChange={handleChange} fullWidth required />
            <TextField label="Page ID" name="pageId" value={form.pageId} onChange={handleChange} fullWidth />
            <TextField label="Owner / Director Name" name="ownerDirectorName" value={form.ownerDirectorName} onChange={handleChange} fullWidth required />
            <TextField label="GST Number" name="gstNumber" value={form.gstNumber} onChange={handleChange} fullWidth />
            <TextField label="PAN Number" name="panNumber" value={form.panNumber} onChange={handleChange} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompaniesPage;
