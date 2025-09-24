import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config/apiConfig";

const AddTransaction = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: "",
    time: "",
    type: "Incoming",
    amount: "",
    mode: "",
    description: "",
    proof: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        navigate('/login');
        return;
      }

      // Prepare the transaction data
      const transactionData = {
        date: form.date,
        time: form.time,
        type: form.type.toLowerCase(), // Ensure type is lowercase
        amount: Number(form.amount),
        mode: form.mode,
        description: form.description || '',
        // Add any other required fields here
      };

      const response = await axios.post(API_ENDPOINTS.TRANSACTIONS, transactionData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Transaction created:', response.data);
      alert('Transaction added successfully!');
      navigate("/transactions");
    } catch (error) {
      console.error("Error adding transaction:", error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to create transaction');
    }
  };

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Paper sx={{ p: 4, width: "600px" }}>
        <Typography variant="h6" mb={3} fontWeight="bold">
          Add Transaction
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField
              type="date"
              name="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={handleChange}
              required
            />
            <TextField
              type="time"
              name="time"
              label="Time"
              InputLabelProps={{ shrink: true }}
              value={form.time}
              onChange={handleChange}
              required
            />
            <TextField
              select
              name="type"
              label="Type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="Incoming">Incoming</MenuItem>
              <MenuItem value="Outgoing">Outgoing</MenuItem>
            </TextField>
            <TextField
              type="number"
              name="amount"
              label="Amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
            <TextField
              name="mode"
              label="Mode"
              value={form.mode}
              onChange={handleChange}
              required
            />
            <TextField
              name="proof"
              type="file"
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
            />
          </Box>
          <TextField
            fullWidth
            name="description"
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
          <Box mt={3} textAlign="center">
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddTransaction;
