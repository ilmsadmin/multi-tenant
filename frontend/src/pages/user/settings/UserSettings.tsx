import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Language as LanguageIcon,
  WbSunny as LightModeIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Settings as SettingsIcon,
  SettingsApplications as SettingsApplicationsIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../../hooks/redux';
import { userAuthService } from '../../../services/userAuth.service';
import { UserPreferences } from '../../../types/userAuth.types';
import { Grid } from '../../../components/shared';

const UserSettings: React.FC = () => {
  const { user, isLoading } = useAppSelector((state) => state.userAuth);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    defaultView: 'dashboard'
  });

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        // In a real app, you would fetch user preferences from the backend
        // const response = await userAuthService.getPreferences();
        // setPreferences(response.data);
        
        // For now, we'll use mock data
        setPreferences({
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          defaultView: 'dashboard'
        });
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, []);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      theme: event.target.checked ? 'dark' : 'light'
    });
  };

  const handleLanguageChange = (event: any) => {
    setPreferences({
      ...preferences,
      language: event.target.value
    });
  };

  const handleNotificationChange = (type: 'email' | 'push' | 'sms') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [type]: event.target.checked
      }
    });
  };

  const handleTimezoneChange = (event: any) => {
    setPreferences({
      ...preferences,
      timezone: event.target.value
    });
  };

  const handleDateFormatChange = (event: any) => {
    setPreferences({
      ...preferences,
      dateFormat: event.target.value
    });
  };

  const handleDefaultViewChange = (event: any) => {
    setPreferences({
      ...preferences,
      defaultView: event.target.value
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would call the API to save preferences
      await userAuthService.updatePreferences(preferences);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    setPreferences({
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      defaultView: 'dashboard'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage your application preferences and settings
      </Typography>

      <Grid container spacing={3}>
        {/* Interface Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Interface Settings"
              avatar={<SettingsIcon />}
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    {preferences.theme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Switch between light and dark theme"
                  />
                  <Switch
                    edge="end"
                    checked={preferences.theme === 'dark'}
                    onChange={handleThemeChange}
                  />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Language"
                    secondary="Select your preferred language"
                  />
                  <FormControl sx={{ minWidth: 120 }}>
                    <Select
                      value={preferences.language}
                      onChange={handleLanguageChange}
                      size="small"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                      <MenuItem value="vi">Vietnamese</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <SettingsApplicationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Default View"
                    secondary="Choose which page to show after login"
                  />
                  <FormControl sx={{ minWidth: 120 }}>
                    <Select
                      value={preferences.defaultView}
                      onChange={handleDefaultViewChange}
                      size="small"
                    >
                      <MenuItem value="dashboard">Dashboard</MenuItem>
                      <MenuItem value="crm">CRM</MenuItem>
                      <MenuItem value="hrm">HRM</MenuItem>
                      <MenuItem value="analytics">Analytics</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Notification Settings"
              avatar={<NotificationsIcon />}
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    {preferences.notifications.email ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <Switch
                    edge="end"
                    checked={preferences.notifications.email}
                    onChange={handleNotificationChange('email')}
                  />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    {preferences.notifications.push ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications in the browser"
                  />
                  <Switch
                    edge="end"
                    checked={preferences.notifications.push}
                    onChange={handleNotificationChange('push')}
                  />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    {preferences.notifications.sms ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive important alerts via SMS"
                  />
                  <Switch
                    edge="end"
                    checked={preferences.notifications.sms}
                    onChange={handleNotificationChange('sms')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Regional Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Regional Settings"
              avatar={<AccessTimeIcon />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="timezone-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-label"
                      id="timezone"
                      value={preferences.timezone}
                      label="Timezone"
                      onChange={handleTimezoneChange}
                    >
                      <MenuItem value="UTC">UTC (Coordinated Universal Time)</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                      <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                      <MenuItem value="Asia/Ho_Chi_Minh">Vietnam Time (ICT)</MenuItem>
                      <MenuItem value="Europe/London">London (GMT)</MenuItem>
                      <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="date-format-label">Date Format</InputLabel>
                    <Select
                      labelId="date-format-label"
                      id="date-format"
                      value={preferences.dateFormat}
                      label="Date Format"
                      onChange={handleDateFormatChange}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleResetSettings}
              sx={{ mr: 2 }}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserSettings;
