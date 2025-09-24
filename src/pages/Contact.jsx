// src/pages/Contacts.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import API_ENDPOINTS from "../config/apiConfig";

const STATUS_COLORS = {
  Pending: "warning",
  Converted: "success",
  Rejected: "error",
};

const Contacts = () => {
  const token = localStorage.getItem("token");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Companies
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // For action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  // Lead modal
  const [openLeadModal, setOpenLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({});

  // Fetch Contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_ENDPOINTS.CONTACT, {
        params: { page, limit: 10, status: statusFilter },
      });
      setContacts(data.contacts || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch contacts", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.COMPANIES, { headers });
        setCompanies(response.data.companies || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [headers]);

  useEffect(() => {
    fetchContacts();
  }, [page, statusFilter]);

  // Open Action Menu
  const handleMenuOpen = (event, contact) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open Convert Lead Modal
  const handleConvertLead = () => {
    setLeadForm({
      firstName: selectedContact?.name?.split(" ")[0] || "",
      lastName: selectedContact?.name?.split(" ")[1] || "",
      phone: selectedContact?.phone || "",
      email: selectedContact?.email || "",
      location: selectedContact?.location || "",
      budgetMin: selectedContact?.budget || "",
      source: "Website",
      companyId: "",
    });
    setOpenLeadModal(true);
    handleMenuClose();
  };

  // Submit Lead Conversion
  const submitConvertLead = async () => {
    try {
      await axios.post(API_ENDPOINTS.LEADS, leadForm, { headers });
      await axios.put(
        `${API_ENDPOINTS.CONTACT}/${selectedContact._id}/status`,
        { status: "Converted" },
        { headers }
      );
      setOpenLeadModal(false);
      fetchContacts();
      alert("Contact converted to lead successfully!");
    } catch (err) {
      console.error("Lead conversion failed", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to convert lead");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Contacts
      </Typography>

      {/* Contacts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact._id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.location}</TableCell>
                <TableCell>{contact.budget || "-"}</TableCell>
                <TableCell>
                  <Chip
                    label={contact.status}
                    color={STATUS_COLORS[contact.status] || "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuOpen(e, contact)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleConvertLead}>Convert to Lead</MenuItem>
      </Menu>

      {/* Convert Lead Modal */}
      <Modal open={openLeadModal} onClose={() => setOpenLeadModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Convert Contact to Lead
          </Typography>
          <Grid container spacing={2}>
            {/* Company Dropdown */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Company"
                value={leadForm.companyId}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, companyId: e.target.value }))
                }
                required
              >
                <MenuItem value="">Select Company</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company._id} value={company._id}>
                    {company.companyName || company.name || `Company ${company._id}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={leadForm.firstName}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, firstName: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={leadForm.lastName}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={leadForm.phone}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                value={leadForm.email}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Location"
                value={leadForm.location}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, location: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Budget Min (₹)"
                value={leadForm.budgetMin}
                onChange={(e) =>
                  setLeadForm((p) => ({ ...p, budgetMin: e.target.value }))
                }
              />
            </Grid>
          </Grid>
          <Box mt={3} textAlign="right">
            <Button onClick={() => setOpenLeadModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={submitConvertLead}
              sx={{ ml: 2 }}
              disabled={!leadForm.companyId || !leadForm.firstName || !leadForm.phone}
            >
              Convert
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Contacts;
