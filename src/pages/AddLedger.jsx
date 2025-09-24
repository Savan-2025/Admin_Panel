import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  InputAdornment
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import apiConfig from "../config/apiConfig";
import axios from "axios";
import API_ENDPOINTS from "../config/apiConfig";

// const AddLedger = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { ledger } = location.state || {};



const AddLedger = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Destructure leadId, projectId, propertyId directly from location.state
  const { leadId, projectId, propertyId } = location.state || {};
  const [propertyBudget, setPropertyBudget] = useState(0);
  const token = localStorage.getItem("token");

  // Fetch property budget and payment history when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;
      
      try {
        // First try to get the property details
        let propertyBudget = 0;
        try {
          const propertyRes = await axios.get(API_ENDPOINTS.PROPERTY(propertyId), {
            headers: { 'Authorization': `Bearer ${token}` },
            validateStatus: (status) => status < 500 // Don't reject on 404
          });
          
          if (propertyRes.status === 200) {
            propertyBudget = propertyRes.data.budget || 0;
            setPropertyBudget(propertyBudget);
          } else {
            console.warn('Property not found, using default budget of 0');
          }
        } catch (propertyError) {
          console.error('Error fetching property:', propertyError);
        }
        
        // Then fetch payment history for this lead
        let totalPaid = 0;
        try {
          const paymentsRes = await axios.get(API_ENDPOINTS.PAYMENTS, {
            params: { leadId },
            headers: { 'Authorization': `Bearer ${token}` },
            validateStatus: (status) => status < 500 // Don't reject on 404
          });
          
          if (paymentsRes.status === 200 && paymentsRes.data.success) {
            totalPaid = paymentsRes.data.data?.reduce((sum, payment) => {
              return sum + (parseFloat(payment.amount) || 0) + (parseFloat(payment.tokenAmount) || 0);
            }, 0) || 0;
          }
        } catch (paymentError) {
          console.error('Error fetching payment history:', paymentError);
        }
        
        // Update form data with the values
        setFormData(prev => ({
          ...prev,
          outstandingBalance: propertyBudget > 0 ? propertyBudget.toString() : '0.00'
        }));
        
      } catch (error) {
        console.error('Error in fetchData:', error);
        setFormData(prev => ({
          ...prev,
          outstandingBalance: '0.00'
        }));
      }
    };

    fetchData();
  }, [propertyId, token]);





  const [formData, setFormData] = useState({
    paymentType: "emi",
    tokenAmount: 0,
    amount: "",
    installmentPlan: "Yes",
    paymentMode: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
    outstandingBalance: "",
    transactionId: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        leadId: leadId,
        projectId: projectId,
        propertyId: propertyId,
        paymentType: formData.paymentType,
        tokenAmount: formData.paymentType === "token" ? parseFloat(formData.tokenAmount) : 0,
        amount: parseFloat(formData.amount) || 0,
        installmentPlan: formData.installmentPlan,
        paymentMode: formData.paymentMode,
        paymentDate: formData.paymentDate,
        outstandingBalance: parseFloat(formData.outstandingBalance) || 0,
        transactionId: formData.transactionId || undefined
      };

      console.log('Sending request to:', API_ENDPOINTS.PAYMENTS);
      console.log('Request data:', requestData);

      const response = await axios.post(
        API_ENDPOINTS.PAYMENTS,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          },
          validateStatus: (status) => status < 500
        }
      );

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.status === 404) {
        throw new Error('Payment endpoint not found. Please check the API URL.');
      }

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/detailedledger", {
          state: {
            ledger: {
              leadId: leadId,
              projectId: projectId,
              propertyId: propertyId
            }
          }
        });
      }, 2000);
    } catch (err) {
      console.error("Error adding ledger:", err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to record payment. Please check your connection and try again.';
      setError(errorMessage);
      
      // Log detailed error information for debugging
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box p={4}>
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/detailedledger", {
          state: {
            ledger: {
              leadId: leadId,
              projectId: projectId,
              propertyId: propertyId
            }
          }
        })}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {/* Header */}
      <Typography variant="h4" fontWeight="bold" mb={3} color="primary">
        Record New Payment
      </Typography>

      {/* Form Card */}
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Payment Type */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Payment Type"
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  <MenuItem value="token">Token Amount</MenuItem>
                  <MenuItem value="emi">EMI</MenuItem>
                  <MenuItem value="full_payment">Full Payment</MenuItem>
                </TextField>
              </Grid>

              {/* Token Amount (only show if paymentType is token) */}
              {formData.paymentType === "token" && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Token Amount"
                    name="tokenAmount"
                    type="number"
                    value={formData.tokenAmount}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    required
                    variant="outlined"
                  />
                </Grid>
              )}

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Installment Plan */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Installment Plan"
                  name="installmentPlan"
                  value={formData.installmentPlan}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>

              {/* Payment Mode */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Payment Mode"
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </TextField>
              </Grid>

              {/* Payment Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Date"
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Outstanding Balance */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Outstanding Balance"
                  name="outstandingBalance"
                  type="number"
                  value={formData.outstandingBalance}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                  variant="outlined"
                  helperText="Enter the remaining balance after this payment"
                />
              </Grid>

              {/* Transaction ID */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Transaction ID"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Divider */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ px: 4, py: 1.5 }}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? "Recording..." : "Record Payment"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Payment recorded successfully!
        </Alert>
      </Snackbar>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AddLedger;
