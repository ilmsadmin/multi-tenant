import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar as MuiAppBar,
  Toolbar,
  Divider,
  IconButton,
  Typography,
  CssBaseline,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
  AppBarProps as MuiAppBarProps,
  useMediaQuery,
  List,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessCenterIcon,
  BarChart as BarChartIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { userLogout } from '../store/slices/userAuthSlice';

// Import our shared components
import { NavigationMenu, NavigationItem, Grid } from '../components/shared';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const UserLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.userAuth);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [availableModules, setAvailableModules] = useState([
    { id: 'crm', name: 'CRM', icon: <PeopleIcon />, path: '/crm', enabled: true },
    { id: 'hrm', name: 'HRM', icon: <BusinessCenterIcon />, path: '/hrm', enabled: true },
    { id: 'analytics', name: 'Analytics', icon: <BarChartIcon />, path: '/analytics', enabled: true },
    { id: 'inventory', name: 'Inventory', icon: <InventoryIcon />, path: '/inventory', enabled: true }
  ]);

  // Navigation items using our NavigationItem structure
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      id: 'apps',
      title: 'Applications',
      icon: <BusinessCenterIcon />,
      children: availableModules
        .filter(module => module.enabled)
        .map(module => ({
          id: module.id,
          title: module.name,
          path: module.path,
          icon: module.icon,
        })),
      divider: true,
    },
    {
      id: 'account',
      title: 'Account',
      icon: <PersonIcon />,
      children: [
        {
          id: 'profile',
          title: 'Profile',
          path: '/profile',
          icon: <PersonIcon />,
        },
        {
          id: 'settings',
          title: 'Settings',
          path: '/settings',
          icon: <SettingsIcon />,
        },
      ],
    },
  ];

  useEffect(() => {
    // In a real app, you would fetch the enabled modules from the backend
    // For now, we're just using mock data
    const fetchEnabledModules = async () => {
      try {
        // Mock API call
        // const tenantId = localStorage.getItem('user_tenant_id');
        // const response = await api.get(`/tenant/${tenantId}/modules/enabled`);
        // setAvailableModules(response.data);
      } catch (error) {
        console.error('Error fetching enabled modules:', error);
      }
    };

    fetchEnabledModules();
  }, []);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(userLogout());
    navigate('/login');
  };

  // Handle navigation from the menu
  const handleNavigate = (item: NavigationItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Multi-Tenant Platform
          </Typography>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Notifications">
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleNotificationMenu}
                >
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Menu
                id="notification-menu"
                anchorEl={notificationAnchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationClose}
              >
                <MenuItem onClick={handleNotificationClose}>New task assigned</MenuItem>
                <MenuItem onClick={handleNotificationClose}>Meeting reminder: 2:00 PM</MenuItem>
                <MenuItem onClick={handleNotificationClose}>System update completed</MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleNotificationClose(); navigate('/notifications'); }}>
                  View all notifications
                </MenuItem>
              </Menu>
              
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  {user.avatar ? (
                    <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {user.first_name ? user.first_name[0] : user.username[0]}
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Menu
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        
        {/* Use our NavigationMenu component */}
        <NavigationMenu
          items={navigationItems}
          onNavigate={handleNavigate}
          collapsed={false}
          showIcons={true}
        />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;
