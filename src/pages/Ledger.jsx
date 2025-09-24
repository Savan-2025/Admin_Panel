import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config/apiConfig";
import axios from "axios";

const LedgerPage = () => {
  const navigate = useNavigate();
  const [ledgerData, setLedgerData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchLedgerData = async () => {
    try {
      // Fetch both ledger data and analytics in parallel
      const [ledgerResponse, analyticsResponse] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.PAYMENTS, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(API_ENDPOINTS.LEDGER_ANALYTICS, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      // Process ledger data
      if (ledgerResponse.status === 'fulfilled') {
        setLedgerData(ledgerResponse.value.data.data);
      }

      // Process analytics data
      if (analyticsResponse.status === 'fulfilled') {
        setAnalytics(analyticsResponse.value.data.data);
      } else {
        // Fallback to static data if analytics API fails
        setAnalytics({
          totalCollected: '₹ 6.78 cr',
          totalDue: '₹ 89.6 Lakhs',
          overdueCount: 123
        });
      }
    } catch (err) {
      console.error("Error fetching ledger data:", err);
      setError(err.response?.data?.message || "Failed to fetch ledger data");
      // Set fallback analytics
      setAnalytics({
        totalCollected: '₹ 6.78 cr',
        totalDue: '₹ 89.6 Lakhs',
        overdueCount: 123
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const handleView = (ledger) => {
    navigate("/detailedledger", { state: { ledger } });
  };

  return (
    <Box p={3} sx={{ background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Buyer Ledger Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Monitor installments, token amounts, and dues — all in one place.
      </Typography>

      {/* Dynamic Analytics Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: "16px", boxShadow: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Total Collected
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {analytics?.totalCollected || '₹ 6.78 cr'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: "16px", boxShadow: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Total Due
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {analytics?.totalDue || '₹ 89.6 Lakhs'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: "16px", boxShadow: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Overdue Payments
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {analytics?.overdueCount || 123}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ledger Table */}
      <Card sx={{ borderRadius: "16px", boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Buyer Ledger
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
                  <TableRow>
                  <TableCell><b>Project Name</b></TableCell>
                  <TableCell><b>Property Name</b></TableCell>
                  <TableCell><b>Buyer Name</b></TableCell>
                    <TableCell><b>Property Budget (₹)</b></TableCell>
                    <TableCell><b>Token Amount</b></TableCell>
                    <TableCell><b>Paid Amount</b></TableCell>
                    <TableCell><b>Due Amount</b></TableCell>
                    <TableCell><b>Last Payment Date</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Action</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledgerData.map((entry) => (
                    <TableRow key={entry._id} hover>
                      <TableCell>
                      {entry.project?.projectName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {entry.property?.propertyName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {entry.leadId.firstName} {entry.leadId.lastName}
                      </TableCell>
                      <TableCell>
                        {entry.property?.budget ? `₹${entry.property.budget.toLocaleString('en-IN')}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        ₹{entry.tokenAmount?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        ₹{entry.amount?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        ₹{entry.outstandingBalance?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        {entry.paymentDate
                          ? new Date(entry.paymentDate).toLocaleDateString('en-GB')
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Typography color={entry.outstandingBalance > 0 ? "warning.main" : "success.main"}>
                          {entry.outstandingBalance > 0 ? "Part Paid" : "Fully Paid"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleView({
                              leadId: entry.leadId._id,
                              projectId: entry.project?._id,
                              propertyId: entry.property?._id,
                              buyer: `${entry.leadId.firstName} ${entry.leadId.lastName}`,
                              project: entry.project?.projectName || "N/A",
                              token: entry.tokenAmount,
                              paid: entry.amount,
                              due: entry.outstandingBalance,
                              date: entry.paymentDate,
                              paymentType: entry.paymentType,
                              installmentPlan: entry.installmentPlan,
                              paymentMode: entry.paymentMode
                            })
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LedgerPage;
