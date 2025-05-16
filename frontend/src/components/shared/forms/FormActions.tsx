import React from 'react';
import { Box, BoxProps, Button, ButtonProps } from '@mui/material';
import { Cancel as CancelIcon, Save as SaveIcon } from '@mui/icons-material';

export interface FormActionsProps extends BoxProps {
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether form is in edit mode as opposed to create mode */
  isEditMode?: boolean;
  /** Override submit button text */
  submitText?: string;
  /** Override cancel button text */
  cancelText?: string;
  /** Function called on cancel button click */
  onCancel?: () => void;
  /** Show or hide the cancel button */
  showCancel?: boolean;
  /** Show or hide reset button */
  showReset?: boolean;
  /** Reset text override */
  resetText?: string;
  /** Function called on reset button click */
  onReset?: () => void;
  /** Extra action button */
  extraAction?: {
    text: string;
    onClick: () => void;
    props?: ButtonProps;
  };
  /** Submit button props */
  submitButtonProps?: ButtonProps;
  /** Cancel button props */
  cancelButtonProps?: ButtonProps;
  /** Reset button props */
  resetButtonProps?: ButtonProps;
  /** Reverse the order of buttons */
  reverse?: boolean;
  /** Alignment of buttons */
  align?: 'left' | 'center' | 'right' | 'space-between';
}

/**
 * A component for form action buttons with consistent styling and behavior
 */
const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting = false,
  isEditMode = false,
  submitText,
  cancelText = 'Cancel',
  onCancel,
  showCancel = true,
  showReset = false,
  resetText = 'Reset',
  onReset,
  extraAction,
  submitButtonProps = {},
  cancelButtonProps = {},
  resetButtonProps = {},
  reverse = false,
  align = 'right',
  ...boxProps
}) => {
  // Determine default text for submit button
  const defaultSubmitText = isEditMode ? 'Update' : 'Save';
  
  // Determine justification based on alignment
  const getJustifyContent = () => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'space-between':
        return 'space-between';
      default:
        return 'flex-end';
    }
  };
  
  // Arrange buttons in proper order
  const buttons = [
    // Submit button
    <Button
      key="submit"
      type="submit"
      variant="contained"
      color="primary"
      disabled={isSubmitting}
      startIcon={<SaveIcon />}
      {...submitButtonProps}
    >
      {submitText || defaultSubmitText}
    </Button>,
    
    // Extra action button if provided
    extraAction && (
      <Button
        key="extra"
        variant="outlined"
        onClick={extraAction.onClick}
        {...extraAction.props}
      >
        {extraAction.text}
      </Button>
    ),
    
    // Reset button if enabled
    showReset && (
      <Button
        key="reset"
        type="reset"
        variant="outlined"
        onClick={onReset}
        {...resetButtonProps}
      >
        {resetText}
      </Button>
    ),
    
    // Cancel button if enabled
    showCancel && (
      <Button
        key="cancel"
        variant="outlined"
        color="secondary"
        onClick={onCancel}
        startIcon={<CancelIcon />}
        {...cancelButtonProps}
      >
        {cancelText}
      </Button>
    )
  ].filter(Boolean); // Filter out null values
  
  // Reverse the order if needed
  const orderedButtons = reverse ? [...buttons].reverse() : buttons;
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: getJustifyContent(),
        gap: 2,
        mt: 3,
        ...boxProps.sx
      }}
      {...boxProps}
    >
      {orderedButtons}
    </Box>
  );
};

export default FormActions;
