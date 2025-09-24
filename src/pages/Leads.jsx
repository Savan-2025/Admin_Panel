// src/pages/LeadFunnel.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import API_ENDPOINTS from "../config/apiConfig";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const STATUSES = ["new", "contacted", "booking_done", "paid", "dropped","document_uploaded"]; 
const STATUS_LABEL = {
  new: "New",
  contacted: "Contacted",
  paid: "Paid",
  document_uploaded: "Document Uploaded",
  booking_done: "Booking Done",
  dropped: "Dropped",
};
const SOURCE_LABEL = {
  meta_ads: "Facebook/Instagram",
  google_ads: "Google Ads",
  walk_in: "Walk-in",
  referral: "Referral",
  csv: "CSV Import",
  manual: "Manual",
};
const INR = (v) =>
  typeof v === "number"
    ? v.toLocaleString("en-IN", { style: "currency", currency: "INR" })
    : v;

const LeadFunnel = () => {
  const token = localStorage.getItem("token");
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    }),
    [token]
  );

  // State
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("new");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({
    meta_ads: 0,
    google_ads: 0,
    walk_in: 0,
    referral: 0,
  });
  const [leads, setLeads] = useState([]);

  // Companies
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompanyForCsv, setSelectedCompanyForCsv] = useState("");

  // Add Lead Modal
  const [openAdd, setOpenAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: "",
    lastName: "",
    source: "manual",
    propertyInterest: "",
    location: "",
    phone: "",
    email: "",
    date: "",
    budgetMin: "",
    budgetMax: "",
    companyId: "",
    campaign: "",
    adset: "",
    adId: "",
    hasBroker: "No",
    brokerName: "",
    brokerCut: "",
    notes: "",
  });

  // View Lead Modal
  const [openView, setOpenView] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  // CSV Upload
  const fileInputRef = useRef(null);

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

  // Fetch Leads
  const fetchLeads = async (selectedStatus = status, keyword = search) => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_ENDPOINTS.LEADS, {
        headers,
        params: {
          status: selectedStatus,
          companyId: "",
          page: 1,
          limit: 20,
          search: keyword,
        },
      });
      setLeads(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("Failed to fetch leads", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Lead Counts
  const fetchCounts = async () => {
    try {
      const { data } = await axios.get(API_ENDPOINTS.LEADS_STATS, { headers });
      setCounts({
        meta_ads: data?.sources?.meta_ads || 0,
        google_ads: data?.sources?.google_ads || 0,
        walk_in: data?.sources?.walk_in || 0,
        referral: data?.sources?.referral || 0,
      });
    } catch (err) {
      console.error("Failed to fetch lead counts", err?.response?.data || err);
    }
  };

  // Fetch leads on status/search change
  useEffect(() => {
    fetchLeads();
  }, [status, search]);

  // Fetch counts on mount
  useEffect(() => {
    fetchCounts();
  }, []);

  // Refresh Meta/Google Leads
  const handleRefreshMeta = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_ENDPOINTS.LEADS}/sync/meta`, {}, { headers });
      await fetchCounts();
      await fetchLeads();
    } catch (err) {
      console.error("Meta sync failed", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to sync Meta leads");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshGoogle = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_ENDPOINTS.LEADS}/sync/google`, {}, { headers });
      await fetchCounts();
      await fetchLeads();
    } catch (err) {
      console.error("Google sync failed", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to sync Google leads");
    } finally {
      setLoading(false);
    }
  };

  // CSV Upload
  const openCsvPicker = () => {
    if (!selectedCompanyForCsv) {
      alert("Please select a company before uploading CSV");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", selectedCompanyForCsv);
    try {
      setLoading(true);
      await axios.post(API_ENDPOINTS.LEADS_BULK_UPLOAD, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      await fetchCounts();
      await fetchLeads();
      alert("CSV uploaded successfully");
    } catch (err) {
      console.error("CSV upload failed", err?.response?.data || err);
      alert(err?.response?.data?.message || "CSV upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // Add Lead Modal
  const openAddModal = () => {
    setAddForm({
      firstName: "",
      lastName: "",
      source: "manual",
      propertyInterest: "",
      location: "",
      phone: "",
      email: "",
      date: "",
      budgetMin: "",
      budgetMax: "",
      companyId: "",
      campaign: "",
      adset: "",
      adId: "",
      hasBroker: "No",
      brokerName: "",
      brokerCut: "",
      notes: "",
    });
    setOpenAdd(true);
  };

  // Submit Add Lead
  const submitAddLead = async () => {
    try {
      const payload = {
        firstName: addForm.firstName?.trim(),
        lastName: addForm.lastName?.trim(),
        phone: addForm.phone?.trim(),
        email: addForm.email?.trim(),
        location: addForm.location?.trim(),
        propertyInterest: addForm.propertyInterest?.trim(),
        budgetMin: Number(addForm.budgetMin),
        budgetMax: Number(addForm.budgetMax),
        companyId: addForm.companyId,
        source: addForm.source,
        campaign: addForm.campaign?.trim(),
        adset: addForm.adset?.trim(),
        adId: addForm.adId?.trim(),
        isBroker: addForm.hasBroker === "Yes",
        brokerName: addForm.brokerName?.trim(),
        brokerCut: addForm.brokerCut?.trim(),
        notes: addForm.notes?.trim(),
      };

      await axios.post(API_ENDPOINTS.LEADS, payload, { headers });
      setOpenAdd(false);
      await fetchCounts();
      await fetchLeads("new", "");
      setStatus("new");
      setSearch("");
      alert("Lead added successfully!");
    } catch (err) {
      console.error("Add lead failed", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to add lead");
    }
  };

  // View Lead Modal
  const viewLead = (lead) => {
    setCurrentLead(lead);
    setOpenView(true);
  };

  // UI Helpers
  const CardBox = ({ title, value, onRefresh }) => (
    <Card elevation={0} variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          {onRefresh && (
            <IconButton onClick={onRefresh} title="Refresh">
              <RefreshIcon />
            </IconButton>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Leads from {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const Detail = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Grid>
  );

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Leads
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Track where your leads are coming from across online and offline channels.
      </Typography>

      {/* Cards */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <CardBox
            title="Meta Ads"
            value={counts.meta_ads}
            onRefresh={handleRefreshMeta}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardBox
            title="Google Ads"
            value={counts.google_ads}
            onRefresh={handleRefreshGoogle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardBox title="Walk-ins" value={counts.walk_in} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardBox title="Referrals" value={counts.referral} />
        </Grid>
      </Grid>

      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Searching for…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 360, maxWidth: "100%" }}
        />

        <Box flexGrow={1} />

        {/* Company dropdown for CSV */}
        <TextField
          select
          size="small"
          label="Select Company"
          value={selectedCompanyForCsv}
          onChange={(e) => setSelectedCompanyForCsv(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Select Company</MenuItem>
          {companies.map((company) => (
            <MenuItem key={company._id} value={company._id}>
              {company.companyName || company.name || `Company ${company._id}`}
            </MenuItem>
          ))}
        </TextField>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          hidden
          onChange={handleCsvUpload}
        />
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={openCsvPicker}
        >
          Upload CSV
        </Button>

        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddModal}>
          Add Leads
        </Button>
      </Stack>

      {/* Status Tabs */}
      <Stack direction="row" spacing={1.5} mb={2}>
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={STATUS_LABEL[s]}
            color={status === s ? "primary" : "default"}
            variant={status === s ? "filled" : "outlined"}
            onClick={() => setStatus(s)}
            sx={{ textTransform: "none" }}
          />
        ))}
      </Stack>

      {/* Leads Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><b>Company</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Phone No</b></TableCell>
              <TableCell><b>Source</b></TableCell>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Property Interest</b></TableCell>
              <TableCell><b>Budget</b></TableCell>
              <TableCell align="center"><b>Action</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading…</TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No leads found.</TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell>{lead.companyName || "—"}</TableCell>
                  <TableCell>{lead.firstName} {lead.lastName}</TableCell>
                  <TableCell>{lead.phone || "—"}</TableCell>
                  <TableCell>{SOURCE_LABEL[lead.source] || lead.source}</TableCell>
                  <TableCell>
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-GB") : "—"}
                  </TableCell>
                  <TableCell>{lead.propertyInterest || "—"}</TableCell>
                  <TableCell>
                    {lead.budgetMin && lead.budgetMax
                      ? `${INR(lead.budgetMin)} - ${INR(lead.budgetMax)}`
                      : lead.budgetMin
                      ? INR(lead.budgetMin)
                      : lead.budgetMax
                      ? INR(lead.budgetMax)
                      : "—"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => viewLead(lead)} title="View">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Lead Modal */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 900,
            maxWidth: "95vw",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Box p={3}>
            <Typography variant="h6" mb={2} fontWeight="bold">
              Add Lead
            </Typography>
            <Grid container spacing={2}>
              {/* Company Dropdown */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Company"
                  value={addForm.companyId}
                  onChange={(e) => setAddForm((p) => ({ ...p, companyId: e.target.value }))}
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
              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </Grid>
              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </Grid>
              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                  required
                />
              </Grid>
              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                />
              </Grid>
              {/* Source */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Source"
                  value={addForm.source}
                  onChange={(e) => setAddForm((p) => ({ ...p, source: e.target.value }))}
                >
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="meta_ads">Facebook/Instagram</MenuItem>
                  <MenuItem value="google_ads">Google Ads</MenuItem>
                  <MenuItem value="walk_in">Walk-in</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                </TextField>
              </Grid>
              {/* Property Interest */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Property Interest"
                  value={addForm.propertyInterest}
                  onChange={(e) => setAddForm((p) => ({ ...p, propertyInterest: e.target.value }))}
                />
              </Grid>
              {/* Location */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={addForm.location}
                  onChange={(e) => setAddForm((p) => ({ ...p, location: e.target.value }))}
                />
              </Grid>
              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={addForm.date}
                  onChange={(e) => setAddForm((p) => ({ ...p, date: e.target.value }))}
                />
              </Grid>
              {/* Budget Min */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget Min (₹)"
                  type="number"
                  value={addForm.budgetMin}
                  onChange={(e) => setAddForm((p) => ({ ...p, budgetMin: e.target.value }))}
                />
              </Grid>
              {/* Budget Max */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget Max (₹)"
                  type="number"
                  value={addForm.budgetMax}
                  onChange={(e) => setAddForm((p) => ({ ...p, budgetMax: e.target.value }))}
                />
              </Grid>
              {/* Campaign */}
              {/*<Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Campaign"
                  value={addForm.campaign}
                  onChange={(e) => setAddForm((p) => ({ ...p, campaign: e.target.value }))}
                />
              </Grid>*/}
              {/* Ad Set */}
              {/*<Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Ad Set"
                  value={addForm.adset}
                  onChange={(e) => setAddForm((p) => ({ ...p, adset: e.target.value }))}
                />
              </Grid>*/}
              {/* Ad ID */}
              {/*<Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Ad ID"
                  value={addForm.adId}
                  onChange={(e) => setAddForm((p) => ({ ...p, adId: e.target.value }))}
                />
              </Grid>*/}
              {/* Broker */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Broker?"
                  value={addForm.hasBroker}
                  onChange={(e) => setAddForm((p) => ({ ...p, hasBroker: e.target.value }))}
                >
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                </TextField>
              </Grid>
              {/* Broker Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Broker Name"
                  value={addForm.brokerName}
                  onChange={(e) => setAddForm((p) => ({ ...p, brokerName: e.target.value }))}
                  disabled={addForm.hasBroker !== "Yes"}
                />
              </Grid>
              {/* Broker Cut */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Broker Cut (%)"
                  type="number"
                  value={addForm.brokerCut}
                  onChange={(e) => setAddForm((p) => ({ ...p, brokerCut: e.target.value }))}
                  disabled={addForm.hasBroker !== "Yes"}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  minRows={3}
                  value={addForm.notes}
                  onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={submitAddLead}
                disabled={!addForm.companyId || !addForm.firstName || !addForm.phone}
              >
                Submit
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>

      {/* View Lead Modal */}
      <Modal open={openView} onClose={() => setOpenView(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            maxWidth: "95vw",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Box p={3}>
            <Typography variant="h6" mb={2} fontWeight="bold">
              Lead Details
            </Typography>
            {currentLead ? (
              <>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Typography variant="h5" fontWeight="bold">
                    {currentLead.firstName} {currentLead.lastName}
                  </Typography>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[currentLead.status] || currentLead.status}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <Grid container spacing={2}>
                  <Detail label="Phone" value={currentLead.phone || "—"} />
                  <Detail
                    label="Source"
                    value={SOURCE_LABEL[currentLead.source] || currentLead.source}
                  />
                  <Detail
                    label="Created"
                    value={
                      currentLead.createdAt
                        ? new Date(currentLead.createdAt).toLocaleString()
                        : "—"
                    }
                  />
                  <Detail
                    label="Property Interest"
                    value={currentLead.propertyInterest || "—"}
                  />
                  <Detail label="Location" value={currentLead.location || "—"} />
                 {/* <Detail
                    label="Budget"
                    value={
                      currentLead.budget ? INR(Number(currentLead.budget)) : "—"
                    }
                  />*/}
                  <Detail
                    label="Broker"
                    value={currentLead.isBroker ? "Yes" : "No"}
                  />
                  {currentLead.isBroker && (
                    <>
                      <Detail
                        label="Broker Name"
                        value={currentLead.brokerName || "—"}
                      />
                      <Detail
                        label="Broker Cut"
                        value={
                          currentLead.brokerCut ? `${currentLead.brokerCut}%` : "—"
                        }
                      />
                    </>
                  )}
                 {/* <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {currentLead.notes || "—"}
                    </Typography>
                  </Grid>*/}
                </Grid>
                <Stack direction="row" justifyContent="flex-end" mt={2}>
                  <Button onClick={() => setOpenView(false)}>Close</Button>
                </Stack>
              </>
            ) : (
              <Typography>Loading…</Typography>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default LeadFunnel;
