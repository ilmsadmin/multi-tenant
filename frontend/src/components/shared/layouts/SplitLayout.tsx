import React from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Grid from '../Grid';

interface SplitLayoutProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  leftWidth?: number | string;
  rightWidth?: number | string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  leftBackground?: string;
  rightBackground?: string;
  leftBackgroundImage?: string;
  rightBackgroundImage?: string;
  reverseOnMobile?: boolean;
  paperProps?: React.ComponentProps<typeof Paper>;
  fullHeight?: boolean;
}

/**
 * A split layout template that divides the screen into two sections
 * Can be used for login/signup pages, landing pages, or content with side navigation
 */
const SplitLayout: React.FC<SplitLayoutProps> = ({
  leftContent,
  rightContent,
  leftWidth = '50%',
  rightWidth = '50%',
  header,
  footer,
  leftBackground,
  rightBackground,
  leftBackgroundImage,
  rightBackgroundImage,
  reverseOnMobile = false,
  paperProps,
  fullHeight = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // We need to ensure the width values are correct
  // If percentages are given, make sure they add up to 100%
  const leftWidthValue = typeof leftWidth === 'number' ? `${leftWidth}px` : leftWidth;
  const rightWidthValue = typeof rightWidth === 'number' ? `${rightWidth}px` : rightWidth;
  
  // Left side style
  const leftStyle = {
    ...(leftBackground ? { backgroundColor: leftBackground } : {}),
    ...(leftBackgroundImage ? { 
      backgroundImage: `url(${leftBackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {})
  };
  
  // Right side style
  const rightStyle = {
    ...(rightBackground ? { backgroundColor: rightBackground } : {}),
    ...(rightBackgroundImage ? { 
      backgroundImage: `url(${rightBackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {})
  };
  
  // Determine the order of the panels on mobile
  const leftOrder = isMobile && reverseOnMobile ? 2 : 1;
  const rightOrder = isMobile && reverseOnMobile ? 1 : 2;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: fullHeight ? '100vh' : 'auto',
        width: '100%',
      }}
    >
      {/* Header Section */}
      {header && (
        <Box component="header" sx={{ zIndex: theme.zIndex.appBar }}>
          {header}
        </Box>
      )}
      
      {/* Main Content Area */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexGrow: 1,
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            width: { xs: '100%', md: leftWidthValue },
            order: leftOrder,
            ...leftStyle
          }}
        >
          {leftContent || (
            <Box sx={{ p: 3, height: '100%' }}>
              {paperProps ? (
                <Paper 
                  sx={{ 
                    p: 3,
                    height: '100%',
                    ...((paperProps?.sx as any) || {})
                  }}
                  {...paperProps}
                >
                  <Outlet />
                </Paper>
              ) : (
                <Outlet />
              )}
            </Box>
          )}
        </Box>
        
        {/* Right Section */}
        <Box
          sx={{
            width: { xs: '100%', md: rightWidthValue },
            order: rightOrder,
            ...rightStyle
          }}
        >
          {rightContent || (
            <Box sx={{ p: 3, height: '100%' }}>
              <Outlet />
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Footer Section */}
      {footer && (
        <Box component="footer" sx={{ zIndex: theme.zIndex.appBar }}>
          {footer}
        </Box>
      )}
    </Box>
  );
};

export default SplitLayout;
