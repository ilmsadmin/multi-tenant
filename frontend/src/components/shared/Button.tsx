import React from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  styled,
  CircularProgress
} from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  isLoading?: boolean;
  loadingPosition?: 'start' | 'end' | 'center';
}

// Styled component for consistent button styling across the application
const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => 
    prop !== 'isLoading' && prop !== 'loadingPosition',
})<ButtonProps>(({ theme }) => ({
  borderRadius: '4px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
    transform: 'translateY(-1px)',
  },
  '&.MuiButton-contained': {
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  },
}));

/**
 * Button component that extends MUI Button with additional features
 * - Loading state with spinner
 * - Consistent styling
 * - Custom animations
 */
const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading = false, 
  loadingPosition = 'center',
  disabled = false,
  startIcon,
  endIcon,
  ...rest 
}) => {
  const buttonContent = () => {
    if (!isLoading) return children;
    
    const spinner = <CircularProgress size={20} color="inherit" />;
    
    switch (loadingPosition) {
      case 'start':
        return (
          <>
            {spinner}
            <span style={{ marginLeft: '8px' }}>{children}</span>
          </>
        );
      case 'end':
        return (
          <>
            <span style={{ marginRight: '8px' }}>{children}</span>
            {spinner}
          </>
        );
      case 'center':
      default:
        return spinner;
    }
  };

  return (
    <StyledButton
      disabled={disabled || isLoading}
      startIcon={isLoading && loadingPosition === 'start' ? undefined : startIcon}
      endIcon={isLoading && loadingPosition === 'end' ? undefined : endIcon}
      {...rest}
    >
      {buttonContent()}
    </StyledButton>
  );
};

export default Button;
