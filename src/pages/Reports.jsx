import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReportData({
        salesPerformance: {
          totalLeads: 1250,
          convertedLeads: 312,
          conversionRate: 25.0,
          totalRevenue: 25000000,
          monthlyTrend: [
            { month: 'Jan', leads: 120, sales: 15, revenue: 2000000 },
            { month: 'Feb', leads: 140, sales: 18, revenue: 2400000 },
            { month: 'Mar', leads: 160, sales: 22, revenue: 2800000 },
            { month: 'Apr', leads: 180, sales: 25, revenue: 3200000 },
            { month: 'May', leads: 200, sales: 28, revenue: 3600000 },
            { month: 'Jun', leads: 220, sales: 32, revenue: 4000000 }
          ]
        },
        sourceSummary: [
          { name: 'Website', leads: 450, conversions: 135, revenue: 10800000 },
          { name: 'Referral', leads: 250, conversions: 75, revenue: 6000000 },
          { name: 'Social Media', leads: 200, conversions: 50, revenue: 4000000 },
          { name: 'Cold Call', leads: 100, conversions: 25, revenue: 2000000 },
          { name: 'Walk In', leads: 150, conversions: 27, revenue: 2200000 }
        ],
        userPerformance: [
          { name: 'John Smith', leads: 150, conversions: 45, revenue: 3600000 },
          { name: 'Mike Johnson', leads: 120, conversions: 36, revenue: 2880000 },
          { name: 'Sarah Wilson', leads: 100, conversions: 30, revenue: 2400000 },
          { name: 'David Brown', leads: 80, conversions: 24, revenue: 1920000 }
        ],
        propertyTypeAnalysis: [
          { name: 'Apartment', count: 45, revenue: 9000000 },
          { name: 'House', count: 25, revenue: 5000000 },
          { name: 'Villa', count: 15, revenue: 6000000 },
          { name: 'Commercial', count: 10, revenue: 3000000 },
          { name: 'Land', count: 5, revenue: 2000000 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, subtitle, color }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom variant="h6">
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ color: color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leads"
            value={reportData.salesPerformance.totalLeads}
            subtitle="Total leads generated"
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversions"
            value={reportData.salesPerformance.convertedLeads}
            subtitle={`${reportData.salesPerformance.conversionRate}% conversion rate`}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${(reportData.salesPerformance.totalRevenue / 1000000).toFixed(1)}M`}
            subtitle="Total revenue generated"
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Deal Size"
            value={`₹${(reportData.salesPerformance.totalRevenue / reportData.salesPerformance.convertedLeads / 100000).toFixed(1)}L`}
            subtitle="Average deal value"
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Monthly Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.salesPerformance.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Source Summary */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Leads by Source
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.sourceSummary}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="leads"
                >
                  {reportData.sourceSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Performance */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Team Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.userPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversions" fill="#8884d8" name="Conversions" />
                <Bar dataKey="leads" fill="#82ca9d" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Property Type Analysis */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Type Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.propertyTypeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue by Source */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Lead Source
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.sourceSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Conversion Rate Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversion Rate Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.salesPerformance.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Sales"
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Leads"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports; 