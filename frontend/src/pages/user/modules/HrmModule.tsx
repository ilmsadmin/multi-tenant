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
  Divider,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon
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
      id={`hrm-tabpanel-${index}`}
      aria-labelledby={`hrm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data
const employeesData = [
  {
    id: 1,
    name: 'Jane Smith',
    position: 'Software Developer',
    department: 'Engineering',
    email: 'jane.smith@example.com',
    phone: '(555) 123-4567',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    hireDate: '2020-06-15',
    status: 'Active'
  },
  {
    id: 2,
    name: 'John Doe',
    position: 'UI/UX Designer',
    department: 'Design',
    email: 'john.doe@example.com',
    phone: '(555) 987-6543',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    hireDate: '2021-03-10',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    position: 'Project Manager',
    department: 'Management',
    email: 'emily.johnson@example.com',
    phone: '(555) 567-8901',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    hireDate: '2019-11-05',
    status: 'On Leave'
  },
  {
    id: 4,
    name: 'Michael Brown',
    position: 'QA Engineer',
    department: 'Engineering',
    email: 'michael.brown@example.com',
    phone: '(555) 234-5678',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    hireDate: '2022-01-20',
    status: 'Active'
  },
  {
    id: 5,
    name: 'Sarah Wilson',
    position: 'HR Specialist',
    department: 'Human Resources',
    email: 'sarah.wilson@example.com',
    phone: '(555) 345-6789',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    hireDate: '2021-08-12',
    status: 'Active'
  }
];

const leaveRequestsData = [
  {
    id: 1,
    employee: 'Jane Smith',
    type: 'Vacation',
    startDate: '2023-08-15',
    endDate: '2023-08-22',
    status: 'Approved',
    requestDate: '2023-07-25'
  },
  {
    id: 2,
    employee: 'John Doe',
    type: 'Sick Leave',
    startDate: '2023-07-10',
    endDate: '2023-07-12',
    status: 'Approved',
    requestDate: '2023-07-09'
  },
  {
    id: 3,
    employee: 'Emily Johnson',
    type: 'Maternity Leave',
    startDate: '2023-09-01',
    endDate: '2023-12-01',
    status: 'Pending',
    requestDate: '2023-07-15'
  },
  {
    id: 4,
    employee: 'Michael Brown',
    type: 'Personal Leave',
    startDate: '2023-08-05',
    endDate: '2023-08-07',
    status: 'Rejected',
    requestDate: '2023-07-28'
  }
];

const attendanceData = [
  {
    id: 1,
    date: '2023-08-01',
    present: 48,
    absent: 3,
    late: 5,
    onLeave: 4
  },
  {
    id: 2,
    date: '2023-08-02',
    present: 50,
    absent: 2,
    late: 3,
    onLeave: 5
  },
  {
    id: 3,
    date: '2023-08-03',
    present: 47,
    absent: 5,
    late: 2,
    onLeave: 6
  },
  {
    id: 4,
    date: '2023-08-04',
    present: 49,
    absent: 4,
    late: 1,
    onLeave: 6
  },
  {
    id: 5,
    date: '2023-08-05',
    present: 46,
    absent: 6,
    late: 2,
    onLeave: 6
  }
];

const HrmModule: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState(employeesData);
  const [leaveRequests] = useState(leaveRequestsData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    const filteredEmployees = employeesData.filter(emp => 
      emp.name.toLowerCase().includes(value.toLowerCase()) ||
      emp.position.toLowerCase().includes(value.toLowerCase()) ||
      emp.department.toLowerCase().includes(value.toLowerCase())
    );
    setEmployees(filteredEmployees);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On Leave':
        return 'warning';
      case 'Terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Human Resource Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          color="primary"
        >
          New Employee
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Employees" />
          <Tab label="Leave Management" />
          <Tab label="Attendance" />
          <Tab label="Payroll" />
        </Tabs>

        {/* Employees Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <TextField
              placeholder="Search employees..."
              variant="outlined"
              size="small"
              sx={{ width: '40%' }}
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
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
            >
              Filter
            </Button>
          </Box>
          
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {employees.map((employee) => (
              <React.Fragment key={employee.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar alt={employee.name} src={employee.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography component="span" variant="body1" fontWeight="bold">
                          {employee.name}
                        </Typography>
                        <Chip 
                          label={employee.status} 
                          size="small" 
                          color={getStatusColor(employee.status) as "success" | "warning" | "error" | "default"} 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: 'block' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {employee.position} - {employee.department}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{employee.email}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{employee.phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Hired: {new Date(employee.hireDate).toLocaleDateString()}</Typography>
                          </Box>
                        </Box>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit Employee">
                      <IconButton edge="end" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Leave Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Leave Requests</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              size="small"
            >
              New Request
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.employee}</TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        size="small" 
                        color={getLeaveStatusColor(leave.status) as "success" | "warning" | "error" | "default"} 
                      />
                    </TableCell>
                    <TableCell>{new Date(leave.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="h6" sx={{ mb: 2 }}>Leave Summary</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Vacation Days
                  </Typography>
                  <Typography variant="h5" component="div">
                    12 / 15
                  </Typography>
                  <Typography variant="body2">
                    Days remaining: 3
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Sick Leave
                  </Typography>
                  <Typography variant="h5" component="div">
                    5 / 10
                  </Typography>
                  <Typography variant="body2">
                    Days remaining: 5
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Personal Days
                  </Typography>
                  <Typography variant="h5" component="div">
                    2 / 5
                  </Typography>
                  <Typography variant="body2">
                    Days remaining: 3
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Requests
                  </Typography>
                  <Typography variant="h5" component="div">
                    1
                  </Typography>
                  <Typography variant="body2">
                    Last updated: Today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BadgeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" gutterBottom>
                      Present Today
                    </Typography>
                  </Box>
                  <Typography variant="h5" component="div">
                    48
                  </Typography>
                  <Typography variant="body2">
                    Out of 60 employees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon color="error" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" gutterBottom>
                      Late
                    </Typography>
                  </Box>
                  <Typography variant="h5" component="div">
                    5
                  </Typography>
                  <Typography variant="body2">
                    8.3% of workforce
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon color="warning" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" gutterBottom>
                      On Leave
                    </Typography>
                  </Box>
                  <Typography variant="h5" component="div">
                    4
                  </Typography>
                  <Typography variant="body2">
                    6.7% of workforce
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon color="info" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" gutterBottom>
                      Total Working Hours
                    </Typography>
                  </Box>
                  <Typography variant="h5" component="div">
                    384
                  </Typography>
                  <Typography variant="body2">
                    Today's accumulated hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mb: 2 }}>Attendance History</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Present</TableCell>
                  <TableCell>Absent</TableCell>
                  <TableCell>Late</TableCell>
                  <TableCell>On Leave</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.present}</TableCell>
                    <TableCell>{record.absent}</TableCell>
                    <TableCell>{record.late}</TableCell>
                    <TableCell>{record.onLeave}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payroll Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 3 }}>Payroll Management</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This is the payroll management section. Here you can manage employee salaries, 
            bonuses, deductions, and generate payslips.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mr: 2 }}
          >
            Generate Payslips
          </Button>
          <Button 
            variant="outlined"
          >
            View Payment History
          </Button>
          
          <Typography variant="h6" sx={{ my: 3 }}>Coming Soon</Typography>
          <Typography variant="body1">
            Additional payroll features are currently in development and will be available soon. 
            These features will include automatic tax calculations, direct deposit management, 
            and comprehensive reporting tools.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default HrmModule;
