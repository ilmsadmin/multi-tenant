import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardHeader,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessCenterIcon,
  BarChart as BarChartIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/redux';
import { Grid } from '../../../components/shared';

interface ModuleCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface Event {
  id: number;
  title: string;
  date: string;
  type: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.userAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const modules: ModuleCard[] = [
    {
      id: 'crm',
      name: 'CRM',
      description: 'Manage customer relationships',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/crm',
      color: '#2196f3'
    },
    {
      id: 'hrm',
      name: 'HRM',
      description: 'Human resources management',
      icon: <BusinessCenterIcon sx={{ fontSize: 40 }} />,
      path: '/hrm',
      color: '#f44336'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Data analytics and reporting',
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
      path: '/analytics',
      color: '#4caf50'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      description: 'Inventory management',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      path: '/inventory',
      color: '#ff9800'
    }
  ];

  useEffect(() => {
    // In a real app, you would fetch real data from an API
    const fetchDashboardData = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setTasks([
            { id: 1, title: 'Complete project proposal', dueDate: '2025-05-18', priority: 'high' },
            { id: 2, title: 'Review marketing materials', dueDate: '2025-05-20', priority: 'medium' },
            { id: 3, title: 'Schedule team meeting', dueDate: '2025-05-17', priority: 'low' },
          ]);
          
          setEvents([
            { id: 1, title: 'Team Meeting', date: '2025-05-16 10:00 AM', type: 'meeting' },
            { id: 2, title: 'Product Launch', date: '2025-05-22 09:00 AM', type: 'event' },
            { id: 3, title: 'Client Call: ABC Corp', date: '2025-05-17 02:30 PM', type: 'call' },
          ]);
          
          setNotifications([
            { id: 1, message: 'New comment on your report', time: '10 minutes ago', read: false },
            { id: 2, message: 'Meeting rescheduled to 3 PM', time: '1 hour ago', read: false },
            { id: 3, message: 'Your vacation request was approved', time: '3 hours ago', read: true },
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          Welcome back, {user?.first_name || user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Here's what's happening today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Module Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Your Modules
          </Typography>
          <Grid container spacing={2}>
            {modules.map((module) => (
              <Grid item key={module.id} xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => navigate(module.path)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: module.color,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      {module.icon}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {module.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Tasks */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                Tasks
              </Typography>
              <Button size="small" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </Box>
            <List>
              {tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: 
                          task.priority === 'high' ? 'error.main' : 
                          task.priority === 'medium' ? 'warning.main' : 
                          'success.main'
                      }}>
                        {task.priority[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.title}
                      secondary={`Due: ${task.dueDate}`}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Events */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} />
                Upcoming Events
              </Typography>
              <Button size="small" onClick={() => navigate('/calendar')}>
                View Calendar
              </Button>
            </Box>
            <List>
              {events.map((event) => (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: 
                          event.type === 'meeting' ? 'primary.main' : 
                          event.type === 'call' ? 'secondary.main' : 
                          'info.main'
                      }}>
                        {event.type[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={event.date}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                Notifications
              </Typography>
              <Button size="small" onClick={() => navigate('/notifications')}>
                View All
              </Button>
            </Box>
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.read ? 'grey.400' : 'primary.main' }}>
                        <NotificationsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.message}
                      secondary={notification.time}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;
