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
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  QrCode as QrCodeIcon,
  LocalShipping as ShippingIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  FileDownload as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock inventory data
const inventoryItems = [
  {
    id: 1,
    sku: 'PRD-001',
    name: 'Wireless Keyboard',
    category: 'Electronics',
    quantity: 45,
    reorderLevel: 10,
    unitPrice: 59.99,
    location: 'Warehouse A',
    status: 'In Stock'
  },
  {
    id: 2,
    sku: 'PRD-002',
    name: 'Ergonomic Mouse',
    category: 'Electronics',
    quantity: 32,
    reorderLevel: 15,
    unitPrice: 39.99,
    location: 'Warehouse A',
    status: 'In Stock'
  },
  {
    id: 3,
    sku: 'PRD-003',
    name: '27" Monitor',
    category: 'Electronics',
    quantity: 8,
    reorderLevel: 10,
    unitPrice: 299.99,
    location: 'Warehouse B',
    status: 'Low Stock'
  },
  {
    id: 4,
    sku: 'PRD-004',
    name: 'USB-C Cable',
    category: 'Accessories',
    quantity: 120,
    reorderLevel: 30,
    unitPrice: 19.99,
    location: 'Warehouse A',
    status: 'In Stock'
  },
  {
    id: 5,
    sku: 'PRD-005',
    name: 'Wireless Earbuds',
    category: 'Audio',
    quantity: 5,
    reorderLevel: 15,
    unitPrice: 129.99,
    location: 'Warehouse C',
    status: 'Low Stock'
  },
  {
    id: 6,
    sku: 'PRD-006',
    name: 'Laptop Sleeve',
    category: 'Accessories',
    quantity: 0,
    reorderLevel: 10,
    unitPrice: 29.99,
    location: 'Warehouse B',
    status: 'Out of Stock'
  },
];

const warehouses = [
  { id: 1, name: 'Warehouse A', location: 'New York', capacity: 5000, utilized: 3450 },
  { id: 2, name: 'Warehouse B', location: 'Los Angeles', capacity: 3500, utilized: 2800 },
  { id: 3, name: 'Warehouse C', location: 'Chicago', capacity: 2500, utilized: 1200 },
];

const purchaseOrders = [
  {
    id: 'PO-20230801',
    supplier: 'Tech Supplies Inc.',
    date: '2023-08-01',
    totalItems: 25,
    totalAmount: 4599.75,
    status: 'Delivered'
  },
  {
    id: 'PO-20230725',
    supplier: 'Office Gadgets Co.',
    date: '2023-07-25',
    totalItems: 15,
    totalAmount: 1899.85,
    status: 'In Transit'
  },
  {
    id: 'PO-20230720',
    supplier: 'Electronics Wholesale',
    date: '2023-07-20',
    totalItems: 30,
    totalAmount: 8799.50,
    status: 'Processing'
  },
];

const InventoryModule: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(inventoryItems);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (value) {
      const filtered = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.sku.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(inventoryItems);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDeleteDialog = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    const category = event.target.value;
    setCategoryFilter(category);
    
    if (category === 'all') {
      setFilteredItems(inventoryItems);
    } else {
      const filtered = inventoryItems.filter(item => item.category === category);
      setFilteredItems(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'success';
      case 'Low Stock':
        return 'warning';
      case 'Out of Stock':
        return 'error';
      case 'Delivered':
        return 'success';
      case 'In Transit':
        return 'info';
      case 'Processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getUtilizationPercentage = (utilized: number, capacity: number) => {
    return (utilized / capacity) * 100;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  const uniqueCategories = Array.from(new Set(inventoryItems.map(item => item.category)));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          color="primary"
        >
          Add New Item
        </Button>
      </Box>

      {/* Key metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4" component="div">
                210
              </Typography>
              <Typography variant="body2">
                In 6 categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                15
              </Typography>
              <Typography variant="body2">
                Need attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                3
              </Typography>
              <Typography variant="body2">
                Requires reordering
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inventory Value
              </Typography>
              <Typography variant="h4" component="div">
                $127,350
              </Typography>
              <Typography variant="body2" color="success.main">
                +4.5% from last month
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
          <Tab label="Inventory Items" />
          <Tab label="Warehouses" />
          <Tab label="Purchase Orders" />
          <Tab label="Reports" />
        </Tabs>

        {/* Inventory Items Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Search items..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  id="category-filter"
                  value={categoryFilter}
                  label="Category"
                  onChange={handleCategoryFilterChange}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {uniqueCategories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
            >
              More Filters
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">
                      {item.quantity}
                      {item.quantity <= item.reorderLevel && (
                        <Tooltip title="Below reorder level">
                          <WarningIcon 
                            fontSize="small" 
                            color="warning" 
                            sx={{ ml: 1, verticalAlign: 'middle' }} 
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={getStatusColor(item.status) as "success" | "warning" | "error" | "default" | "info"} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuOpen(e, item.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <QrCodeIcon fontSize="small" sx={{ mr: 1 }} /> 
              View QR Code
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <HistoryIcon fontSize="small" sx={{ mr: 1 }} /> 
              View History
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ShippingIcon fontSize="small" sx={{ mr: 1 }} /> 
              Transfer Item
            </MenuItem>
            <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> 
              Delete Item
            </MenuItem>
          </Menu>
          
          <Dialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this inventory item? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
              <Button onClick={handleCloseDeleteDialog} color="error">Delete</Button>
            </DialogActions>
          </Dialog>
        </TabPanel>

        {/* Warehouses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Warehouse Locations</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              size="small"
            >
              Add Warehouse
            </Button>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {warehouses.map((warehouse) => {
              const utilizationPercentage = getUtilizationPercentage(warehouse.utilized, warehouse.capacity);
              const utilizationColor = getUtilizationColor(utilizationPercentage);
              
              return (
                <Grid item xs={12} md={4} key={warehouse.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {warehouse.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {warehouse.location}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Space Utilization:</Typography>
                          <Typography variant="body2">
                            {utilizationPercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={utilizationPercentage} 
                          color={utilizationColor}
                          sx={{ mt: 1, mb: 1 }}
                        />
                        <Typography variant="caption" display="block">
                          {warehouse.utilized} / {warehouse.capacity} cubic ft used
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button size="small" startIcon={<EditIcon />} sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button size="small" color="warning">
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Warehouse Map</Typography>
          <Paper sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Interactive warehouse map will be displayed here
            </Typography>
          </Paper>
        </TabPanel>

        {/* Purchase Orders Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Purchase Orders</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              size="small"
            >
              Create New Order
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PO Number</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total Items</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{order.totalItems}</TableCell>
                    <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size="small" 
                        color={getStatusColor(order.status) as "success" | "warning" | "error" | "default" | "info"} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print">
                        <IconButton size="small">
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Receiving Activities</Typography>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body1" paragraph>
                No recent receiving activities in the last 7 days.
              </Typography>
              <Button variant="outlined" size="small">View All Activities</Button>
            </Paper>
          </Box>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 3 }}>Inventory Reports</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Stock Level Reports
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Generate reports on current stock levels, low stock items, and inventory valuation.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    size="small"
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Movement Reports
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Track inventory movements, transfers, and adjustments over time.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    size="small"
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Supplier Performance
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Analyze supplier delivery times, order accuracy, and price trends.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    size="small"
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Custom Reports
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Create custom inventory reports with specific parameters and filters.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    size="small"
                  >
                    Create Custom Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Scheduled Reports</Typography>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1" paragraph>
              No scheduled reports configured. Set up automated reports to be delivered to your email.
            </Typography>
            <Button variant="contained" size="small">
              Set Up Scheduled Reports
            </Button>
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default InventoryModule;
