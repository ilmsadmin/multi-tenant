import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  DownloadOutlined as DownloadIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Grid } from '../../../components/shared';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for charts
const salesData = [
  { name: 'Jan', sales: 4000, expenses: 2400, profit: 1600 },
  { name: 'Feb', sales: 3000, expenses: 1398, profit: 1602 },
  { name: 'Mar', sales: 2000, expenses: 9800, profit: -7800 },
  { name: 'Apr', sales: 2780, expenses: 3908, profit: -1128 },
  { name: 'May', sales: 1890, expenses: 4800, profit: -2910 },
  { name: 'Jun', sales: 2390, expenses: 3800, profit: -1410 },
  { name: 'Jul', sales: 3490, expenses: 4300, profit: -810 },
  { name: 'Aug', sales: 5000, expenses: 3000, profit: 2000 },
  { name: 'Sep', sales: 6000, expenses: 3500, profit: 2500 },
  { name: 'Oct', sales: 7000, expenses: 4000, profit: 3000 },
  { name: 'Nov', sales: 4000, expenses: 2000, profit: 2000 },
  { name: 'Dec', sales: 5500, expenses: 2500, profit: 3000 },
];

const customerData = [
  { name: 'New', value: 400 },
  { name: 'Returning', value: 300 },
  { name: 'Inactive', value: 200 },
  { name: 'Churned', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const marketingData = [
  { name: 'Week 1', website: 4000, social: 2400, email: 1800 },
  { name: 'Week 2', website: 3000, social: 1398, email: 2000 },
  { name: 'Week 3', website: 2000, social: 9800, email: 2200 },
  { name: 'Week 4', website: 2780, social: 3908, email: 2500 },
];

const productData = [
  { name: 'Product A', sales: 4000 },
  { name: 'Product B', sales: 3000 },
  { name: 'Product C', sales: 2000 },
  { name: 'Product D', sales: 2780 },
  { name: 'Product E', sales: 1890 },
];

const topCustomers = [
  { id: 1, name: 'Acme Corporation', revenue: 48500, growth: '+12%' },
  { id: 2, name: 'Globex Industries', revenue: 37200, growth: '+8%' },
  { id: 3, name: 'Wayne Enterprises', revenue: 35800, growth: '+15%' },
  { id: 4, name: 'Stark Industries', revenue: 32900, growth: '-3%' },
  { id: 5, name: 'Umbrella Corporation', revenue: 29700, growth: '+5%' },
];

const AnalyticsModule: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('year');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Key metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" component="div">
                $487,500
              </Typography>
              <Typography variant="body2" color="success.main">
                +12.5% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4" component="div">
                1,245
              </Typography>
              <Typography variant="body2" color="success.main">
                +5.3% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4" component="div">
                $347
              </Typography>
              <Typography variant="body2" color="success.main">
                +2.7% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4" component="div">
                4.8%
              </Typography>
              <Typography variant="body2" color="error.main">
                -0.5% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Sales Analytics" />
          <Tab label="Customer Analytics" />
          <Tab label="Marketing Analytics" />
          <Tab label="Product Analytics" />
        </Tabs>

        {/* Sales Analytics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Sales Performance</Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
          
          <Box sx={{ height: 300, mb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
                <Line type="monotone" dataKey="profit" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>Top Customers by Revenue</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Growth</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell component="th" scope="row">
                      {customer.name}
                    </TableCell>
                    <TableCell align="right">${customer.revenue.toLocaleString()}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: customer.growth.startsWith('+') ? 'success.main' : 'error.main'
                      }}
                    >
                      {customer.growth}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Customer Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Customer Segments</Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300, mb: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Customer Insights
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>New customers:</strong> 400 new customers were acquired in this period,
                    representing a 15% increase from the previous period.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Returning customers:</strong> 300 customers made repeat purchases, 
                    contributing to 65% of total revenue.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Inactive customers:</strong> 200 customers haven't made a purchase in the last 3 months.
                    Consider creating a re-engagement campaign.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Churned customers:</strong> 100 customers have been lost, primarily due to
                    pricing concerns and competitor offers. This represents a churn rate of 4.2%.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Customer Lifetime Value Trend</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </TabPanel>

        {/* Marketing Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Lead Sources</Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
          
          <Box sx={{ height: 300, mb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={marketingData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="website" fill="#8884d8" />
                <Bar dataKey="social" fill="#82ca9d" />
                <Bar dataKey="email" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Campaign Performance</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Email Campaign
                  </Typography>
                  <Typography variant="h5" component="div">
                    24.5%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Open Rate
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                    3.8%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Click-through Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Social Media
                  </Typography>
                  <Typography variant="h5" component="div">
                    156K
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Impressions
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                    2.3%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Engagement Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Google Ads
                  </Typography>
                  <Typography variant="h5" component="div">
                    $1.75
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Cost per Click
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                    $28.50
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Cost per Conversion
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Product Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Product Performance</Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
          
          <Box sx={{ height: 300, mb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Product Insights</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performing Products
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Product A</strong> continues to be our best seller with a 15% increase in sales compared to last period.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Product B</strong> has shown significant growth (+23%) after the recent marketing campaign.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Product C</strong> has maintained steady sales but shows potential for growth in new markets.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Products Needing Attention
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Product D</strong> sales have declined by 8%. Consider revising pricing or feature set.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Product E</strong> has high return rates (12%). Quality inspection recommended.
                  </Typography>
                  <Typography variant="body2">
                    <strong>New Product Line</strong> launch is scheduled for next quarter with projected revenue increase of 20%.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnalyticsModule;
