import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Divider,
  Paper,
  Link,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  styled
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  status?: {
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  divider?: boolean;
  elevated?: boolean;
  backgroundImage?: string;
  backgroundColor?: string;
  lightText?: boolean;
  fullWidth?: boolean;
  headerStyle?: 'default' | 'compact' | 'hero';
}

const StyledPageHeader = styled(Box, {
  shouldForwardProp: (prop) => 
    !['elevated', 'backgroundImage', 'backgroundColor', 'lightText', 'fullWidth', 'headerStyle']
      .includes(prop as string),
})<{
  elevated?: boolean;
  backgroundImage?: string;
  backgroundColor?: string;
  lightText?: boolean;
  fullWidth?: boolean;
  headerStyle?: 'default' | 'compact' | 'hero';
}>(({ 
  theme, 
  elevated, 
  backgroundImage,
  backgroundColor,
  lightText,
  fullWidth,
  headerStyle
}) => ({
  padding: headerStyle === 'compact' 
    ? theme.spacing(2, 3)
    : headerStyle === 'hero'
      ? theme.spacing(6, 3)
      : theme.spacing(3),
  borderRadius: elevated ? theme.shape.borderRadius : 0,
  boxShadow: elevated ? theme.shadows[1] : 'none',
  position: 'relative',
  overflow: 'hidden',
  width: fullWidth ? '100%' : 'auto',
  
  // Background settings
  ...(backgroundImage && {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1,
    },
    '& > *': {
      position: 'relative',
      zIndex: 2,
    }
  }),
  ...(backgroundColor && {
    backgroundColor: backgroundColor,
  }),
  
  // Text color based on background
  color: lightText ? theme.palette.common.white : 'inherit',
  '& .MuiBreadcrumbs-root': {
    color: lightText 
      ? 'rgba(255, 255, 255, 0.7)' 
      : theme.palette.text.secondary,
    '& .MuiLink-root': {
      color: lightText 
        ? 'rgba(255, 255, 255, 0.9)' 
        : theme.palette.primary.main,
    }
  }
}));

/**
 * Page header component that provides consistent heading styles across the application
 * Includes optional breadcrumbs, actions, and status indicators
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  status,
  divider = false,
  elevated = false,
  backgroundImage,
  backgroundColor,
  lightText = false,
  fullWidth = false,
  headerStyle = 'default'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <StyledPageHeader
      elevated={elevated}
      backgroundImage={backgroundImage}
      backgroundColor={backgroundColor}
      lightText={lightText}
      fullWidth={fullWidth}
      headerStyle={headerStyle}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast || !item.link ? (
              <Typography 
                key={index} 
                color={lightText ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}
                variant="body2"
              >
                {item.label}
              </Typography>
            ) : (
              <Link 
                key={index}
                component={RouterLink}
                to={item.link}
                underline="hover"
                color={lightText ? 'rgba(255, 255, 255, 0.9)' : 'inherit'}
                variant="body2"
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      {/* Header Content */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: subtitle ? 0.5 : 0 }}>
            <Typography 
              variant={headerStyle === 'hero' ? 'h3' : 'h4'} 
              component="h1"
              fontWeight={500}
            >
              {title}
            </Typography>
            
            {status && (
              <Chip 
                label={status.label} 
                color={status.color || 'default'} 
                size={headerStyle === 'compact' ? 'small' : 'medium'}
              />
            )}
          </Box>
          
          {subtitle && (
            <Typography 
              variant="body1" 
              color={lightText ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              mt: { xs: 1, sm: 0 }
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
      
      {divider && (
        <Divider sx={{ mt: 2 }} />
      )}
    </StyledPageHeader>
  );
};

export default PageHeader;
