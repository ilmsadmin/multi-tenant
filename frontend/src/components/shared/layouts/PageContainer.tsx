import React from 'react';
import { Box, Paper, Container, Divider, useTheme } from '@mui/material';

interface PageContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  paper?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  spacing?: number;
  divider?: boolean;
  fullHeight?: boolean;
  sx?: React.CSSProperties;
}

/**
 * Page container component that provides consistent layout for page content
 * Can be used with or without a Paper wrapper
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  header,
  footer,
  paper = false,
  maxWidth = 'lg',
  disableGutters = false,
  spacing = 3,
  divider = false,
  fullHeight = false,
  sx = {}
}) => {
  const theme = useTheme();
  
  // Build the content with or without paper
  const renderContent = () => {
    if (paper) {
      return (
        <Paper
          sx={{
            p: spacing,
            height: fullHeight ? '100%' : 'auto',
          }}
        >
          {header && (
            <>
              <Box sx={{ mb: spacing }}>
                {header}
              </Box>
              {divider && <Divider sx={{ mb: spacing }} />}
            </>
          )}
          
          <Box sx={{ height: fullHeight ? 'calc(100% - 120px)' : 'auto' }}>
            {children}
          </Box>
          
          {footer && (
            <>
              {divider && <Divider sx={{ mt: spacing, mb: spacing }} />}
              <Box sx={{ mt: footer ? spacing : 0 }}>
                {footer}
              </Box>
            </>
          )}
        </Paper>
      );
    }
    
    return (
      <Box sx={{ height: fullHeight ? '100%' : 'auto' }}>
        {header && (
          <>
            <Box sx={{ mb: spacing }}>
              {header}
            </Box>
            {divider && <Divider sx={{ mb: spacing }} />}
          </>
        )}
        
        <Box sx={{ mb: footer ? spacing : 0 }}>
          {children}
        </Box>
        
        {footer && (
          <>
            {divider && <Divider sx={{ mb: spacing }} />}
            <Box>
              {footer}
            </Box>
          </>
        )}
      </Box>
    );
  };
  
  return (
    <Container 
      maxWidth={maxWidth} 
      disableGutters={disableGutters}
      sx={{ 
        py: 3,
        height: fullHeight ? 'calc(100vh - 64px)' : 'auto', 
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
    >
      {renderContent()}
    </Container>
  );
};

export default PageContainer;
