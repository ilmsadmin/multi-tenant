import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Money as MoneyIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../../hooks/redux';
import { Grid } from '../../../components/shared';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`crm-tabpanel-${index}`}
      aria-labelledby={`crm-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  lastContact: string;
  value: number;
}

interface Deal {
  id: number;
  name: string;
  customer: string;
  value: number;
  stage: 'lead' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate: string;
}

const CrmModule: React.FC = () => {
  const { user } = useAppSelector((state) => state.userAuth);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    // In a real app, you would fetch real data from an API
    const fetchCrmData = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setCustomers([
            { id: 1, name: 'John Smith', company: 'ABC Corp', email: 'john@abccorp.com', phone: '(123) 456-7890', status: 'active', lastContact: '2025-05-10', value: 75000 },
            { id: 2, name: 'Sarah Johnson', company: 'XYZ Inc', email: 'sarah@xyzinc.com', phone: '(234) 567-8901', status: 'active', lastContact: '2025-05-12', value: 120000 },
            { id: 3, name: 'Michael Brown', company: 'Acme LLC', email: 'michael@acme.com', phone: '(345) 678-9012', status: 'lead', lastContact: '2025-05-05', value: 50000 },
            { id: 4, name: 'Emily Davis', company: 'Global Services', email: 'emily@globalservices.com', phone: '(456) 789-0123', status: 'inactive', lastContact: '2025-04-25', value: 30000 },
            { id: 5, name: 'Robert Wilson', company: 'Tech Solutions', email: 'robert@techsolutions.com', phone: '(567) 890-1234', status: 'active', lastContact: '2025-05-15', value: 90000 },
          ]);

          setDeals([
            { id: 1, name: 'Software Implementation', customer: 'ABC Corp', value: 50000, stage: 'proposal', probability: 60, expectedCloseDate: '2025-06-15' },
            { id: 2, name: 'Annual Contract Renewal', customer: 'XYZ Inc', value: 120000, stage: 'negotiation', probability: 80, expectedCloseDate: '2025-05-30' },
            { id: 3, name: 'New Product Demo', customer: 'Acme LLC', value: 35000, stage: 'lead', probability: 30, expectedCloseDate: '2025-07-10' },
            { id: 4, name: 'Enterprise Package', customer: 'Global Services', value: 200000, stage: 'closed_won', probability: 100, expectedCloseDate: '2025-05-01' },
            { id: 5, name: 'Support Contract', customer: 'Tech Solutions', value: 25000, stage: 'proposal', probability: 50, expectedCloseDate: '2025-06-01' },
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching CRM data:', error);
        setIsLoading(false);
      }
    };

    fetchCrmData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter deals based on search query
  const filteredDeals = deals.filter(deal => 
    deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'lead': return 'info';
      case 'inactive': return 'default';
      case 'proposal': return 'primary';
      case 'negotiation': return 'warning';
      case 'closed_won': return 'success';
      case 'closed_lost': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Customer Relationship Management
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Manage your customers, leads, and deals
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {customers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {deals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Deals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Deal Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" component="div">
                {deals.filter(deal => deal.stage === 'closed_won').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Closed Deals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
            value={searchQuery}
            onChange={handleSearch}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            {tabValue === 0 ? 'Add Customer' : 'Add Deal'}
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Customers" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Deals" icon={<MoneyIcon />} iconPosition="start" />
        </Tabs>

        {/* Customers Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Contact</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.company}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {customer.email}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {customer.phone}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.status} 
                          color={getStatusColor(customer.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{customer.lastContact}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.value)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCustomers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </TabPanel>

        {/* Deals Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Deal Name</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Probability</TableCell>
                  <TableCell>Expected Close</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeals
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>{deal.name}</TableCell>
                      <TableCell>{deal.customer}</TableCell>
                      <TableCell>
                        <Chip 
                          label={deal.stage.replace('_', ' ')} 
                          color={getStatusColor(deal.stage) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(deal.value)}</TableCell>
                      <TableCell align="right">{deal.probability}%</TableCell>
                      <TableCell>{deal.expectedCloseDate}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredDeals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No deals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDeals.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CrmModule;
