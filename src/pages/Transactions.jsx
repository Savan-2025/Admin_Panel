import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import API_ENDPOINTS from "../config/apiConfig";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(0);
  const navigate = useNavigate();

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        navigate('/login');
        return;
      }

      console.log('Fetching transactions from:', API_ENDPOINTS.TRANSACTIONS);
      console.log('Using token:', token.substring(0, 10) + '...');

      const response = await axios.get(API_ENDPOINTS.TRANSACTIONS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.data) {
        // Update to match the actual response structure
        setTransactions(response.data.data.transactions || []);
        // Get the wallet balance from the first transaction if available
        const latestTxn = response.data.data.transactions[0];
        setWallet(latestTxn ? latestTxn.wallet : 0);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 401) {
        console.log('Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        // Show error to user
        alert('Failed to load transactions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Daily Transaction
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle1">
            Balance: <strong>₹{wallet.toLocaleString()}</strong>
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/addtransaction")}
          >
            Add New Transaction
          </Button>
        </Box>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Proof</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <TableRow key={txn._id}>
                    <TableCell>{new Date(txn.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{txn.time || '00:00'}</TableCell>
                    <TableCell style={{ textTransform: 'capitalize' }}>{txn.type}</TableCell>
                    <TableCell>₹{txn.amount?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{txn.mode || '-'}</TableCell>
                    <TableCell>{txn.description || '-'}</TableCell>
                    <TableCell>₹{txn.wallet?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      {txn.proof && (
                        <a
                          href={txn.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Proof
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No transactions found
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

export default TransactionList;
