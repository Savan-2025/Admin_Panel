import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack, Visibility, Edit } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../config/apiConfig";

const DetailedLedger = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ledger } = location.state || {};
  const [ledgerData, setLedgerData] = useState([]);
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalDue: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchLedgerDetails = async () => {
    if (!ledger?.leadId) {
      setError("No lead ID provided");
      setLoading(false);
      return;
    }

    try {
      // Fetch both ledger data and analytics in parallel
      const [ledgerResponse, analyticsResponse] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.PAYMENTS + `?leadId=${ledger.leadId}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(API_ENDPOINTS.LEDGER_ANALYTICS_LEAD(ledger.leadId), {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      // Process ledger data
      if (ledgerResponse.status === 'fulfilled') {
        const data = ledgerResponse.value.data.data;
        setLedgerData(data);
      }

      // Process analytics data
      if (analyticsResponse.status === 'fulfilled') {
        const analyticsData = analyticsResponse.value.data.data;
        setStats({
          totalCollected: analyticsData.totalCollected,
          totalDue: analyticsData.totalDue,
          overdue: analyticsData.overdueCount,
        });
      } else {
        // Fallback calculation if analytics API fails
        const data = ledgerResponse.status === 'fulfilled' ? ledgerResponse.value.data.data : [];
        const totalCollected = data.reduce((sum, entry) => sum + entry.amount, 0);
        const totalDue = data.reduce((sum, entry) => sum + entry.outstandingBalance, 0);
        const overdueCount = data.filter(entry => entry.outstandingBalance > 0).length;

        setStats({
          totalCollected: totalCollected,
          totalDue: totalDue,
          overdue: overdueCount,
        });
      }

    } catch (err) {
      console.error("Error fetching ledger details:", err);
      setError(err.response?.data?.message || "Failed to fetch ledger details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerDetails();
  }, [ledger?.leadId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <Box p={4}>
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/ledger")}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Detailed Ledger (Per Buyer View)
          </Typography>
          <Typography color="text.secondary">
            Monitor installments, token amounts, and dues — all in one place.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate("/addledger", {
            state: {
              leadId: ledger?.leadId,
              projectId: ledger?.projectId,
              propertyId: ledger?.propertyId
            }
          })}
        >
          Add Payment
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Collected</Typography>
              <Typography variant="h6">
                {formatCurrency(stats.totalCollected)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Due</Typography>
              <Typography variant="h6">
                {formatCurrency(stats.totalDue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Overdue Payment</Typography>
              <Typography variant="h6">{stats.overdue}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Installment Stage</TableCell>
                <TableCell>Reference ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Paid On</TableCell>
                <TableCell>Payment Mode</TableCell>
                <TableCell>Status</TableCell>
               {/* <TableCell>Action</TableCell> */} 
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerData.length > 0 ? (
                ledgerData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {row?.paymentType === "token" ? "Token Amount" :
                       row?.paymentType === "emi" ? `EMI ${idx + 1}` :
                       "Full Payment"}
                    </TableCell>
                    <TableCell>
                      {row?.transactionId || "N/A"}
                    </TableCell>
                    <TableCell>
                      {row?.paymentType === "token" ?
                        formatCurrency(row?.tokenAmount) :
                        formatCurrency(row?.amount)}
                    </TableCell>
                    <TableCell>
                      {row?.dueDate ? formatDate(row?.dueDate) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {row?.paymentDate ? formatDate(row?.paymentDate) : "N/A"}
                    </TableCell>
                    <TableCell>{row?.paymentMode || "N/A"}</TableCell>
                    <TableCell>
                      <Typography color={row?.outstandingBalance > 0 ? "warning.main" : "success.main"}>
                        {row?.outstandingBalance > 0 ? "Part Paid" : "Fully Paid"}
                      </Typography>
                    </TableCell>
                   {/* <TableCell>
                      <IconButton color="primary">
                        <Visibility />
                      </IconButton>
                      <IconButton color="success">
                        <Edit />
                      </IconButton>
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No ledger entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DetailedLedger;
