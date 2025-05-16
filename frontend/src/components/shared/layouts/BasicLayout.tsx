import React from 'react';
import { Box, Container, Paper, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';

interface BasicLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarWidth?: number;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  paperProps?: React.ComponentProps<typeof Paper>;
  containerProps?: React.ComponentProps<typeof Container>;
  fullHeight?: boolean;
  fullWidth?: boolean;
  centered?: boolean;
  backgroundImage?: string;
  backgroundColor?: string;
}

/**
 * A basic layout template that can be used for simple page layouts
 * Can be configured with or without header, footer, sidebar
 */
const BasicLayout: React.FC<BasicLayoutProps> = ({
  header,
  footer,
  sidebar,
  sidebarWidth = 240,
  maxWidth = 'lg',
  disableGutters = false,
  paperProps,
  containerProps,
  fullHeight = false,
  fullWidth = false,
  centered = false,
  backgroundImage,
  backgroundColor
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Calculate if we need to adjust height for header and footer
  const hasHeader = Boolean(header);
  const hasFooter = Boolean(footer);
  const hasSidebar = Boolean(sidebar) && !isMobile;

  // Style for the main wrapper
  const backgroundStyle = {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(backgroundImage ? { 
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {})
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: fullHeight ? '100vh' : 'auto',
        width: '100%',
        ...backgroundStyle
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
          flexDirection: { xs: 'column', md: hasSidebar ? 'row' : 'column' },
          height: fullHeight ? (hasHeader || hasFooter ? 'calc(100vh - 64px)' : '100vh') : 'auto',
          ...(hasHeader && { mt: hasHeader ? 0 : 0 }),
          ...(hasHeader && hasFooter && fullHeight && { height: 'calc(100vh - 128px)' })
        }}
      >
        {/* Sidebar, only shown on larger screens */}
        {sidebar && !isMobile && (
          <Box 
            component="aside"
            sx={{ 
              width: sidebarWidth,
              flexShrink: 0
            }}
          >
            {sidebar}
          </Box>
        )}
        
        {/* Main Content */}
        <Box 
          component="main"
          sx={{ 
            flexGrow: 1,
            width: { md: hasSidebar ? `calc(100% - ${sidebarWidth}px)` : '100%' },
            padding: theme.spacing(3),
            display: 'flex',
            flexDirection: 'column',
            ...(fullWidth && { maxWidth: 'none' }),
            ...(centered && { 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            })
          }}
        >
          <Container 
            maxWidth={fullWidth ? false : maxWidth} 
            disableGutters={disableGutters}
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              ...((containerProps?.sx as any) || {})
            }}
            {...containerProps}
          >
            {paperProps ? (
              <Paper 
                sx={{ 
                  p: 3,
                  flexGrow: 1,
                  ...((paperProps?.sx as any) || {})
                }}
                {...paperProps}
              >
                <Outlet />
              </Paper>
            ) : (
              <Outlet />
            )}
          </Container>
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

export default BasicLayout;
