// @ts-nocheck - Temporarily disable TypeScript checking
import React from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Typography,
  Box,
  Tooltip,
  IconButton,
  styled
} from '@mui/material';
import { 
  Help as HelpIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Custom props for the FormField component
export interface FormFieldProps extends Omit<TextFieldProps, 'type'> {
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'radio'
    | 'switch'
    | 'textarea';
  options?: Array<{ label: string; value: string | number; disabled?: boolean }>;
  tooltipText?: string;
  loading?: boolean;
  showVisibilityToggle?: boolean;
}

// Styled helper text component
const StyledHelperText = styled(FormHelperText)(({ theme }) => ({
  marginLeft: 0,
  marginRight: 0,
  marginTop: theme.spacing(0.5),
}));

// Create a type for our form control component
type FormControlProps = {
  fullWidth?: boolean;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  margin?: 'dense' | 'normal' | 'none';
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  children: React.ReactNode;
  sx?: any;
};

/**
 * Enhanced form field component that supports multiple input types
 * with consistent styling and behavior
 */
const FormField: React.FC<FormFieldProps> = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required,
  disabled,
  fullWidth = true,
  margin = 'normal',
  variant = 'outlined',
  size = 'medium',
  options = [],
  tooltipText,
  loading = false,
  InputProps,
  showVisibilityToggle = false,
  ...rest
}) => {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = React.useState(false);

  // Toggle password visibility handler
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // Handle change based on field type
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | any
  ) => {
    if (onChange) {
      if (type === 'checkbox') {
        // For checkbox, we're interested in the checked property
        const target = e.target as HTMLInputElement;
        const event = {
          target: {
            name: name,
            value: target.checked,
          },
        };
        onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
      } else if (type === 'switch') {
        // For switch components
        const target = e.target as HTMLInputElement;
        const event = {
          target: {
            name: name,
            value: target.checked,
          },
        };
        onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
      } else {
        // For all other input types
        onChange(e);
      }
    }
  };

  // Custom wrapper for form fields with common props
  const FormControlWrapper: React.FC<FormControlProps> = ({ children, ...props }) => (
    <FormControl 
      fullWidth={fullWidth} 
      error={error} 
      required={required}
      disabled={disabled}
      margin={margin}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </FormControl>
  );

  // Tooltip wrapper for the label
  const renderLabelWithTooltip = () => (
    <Box display="flex" alignItems="center" mb={0.5}>
      <Typography variant="body2" component="span" color={error ? 'error' : 'textSecondary'}>
        {label} {required && <span style={{ color: 'error' }}>*</span>}
      </Typography>
      {tooltipText && (
        <Tooltip title={tooltipText} arrow placement="top">
          <IconButton size="small" sx={{ padding: 0, ml: 0.5 }}>
            <HelpIcon fontSize="small" color="action" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // Render helper text if provided
  const renderHelperText = () => (
    helperText && (
      <StyledHelperText error={error}>
        {helperText}
      </StyledHelperText>
    )
  );

  // Determine the appropriate type value for text inputs
  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  // Password visibility toggle adornment
  const getPasswordAdornment = () => {
    if (type === 'password' && showVisibilityToggle) {
      return {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleTogglePasswordVisibility}
              edge="end"
              size="small"
              aria-label="toggle password visibility"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        )
      };
    }
    return {};
  };

  // Combine custom InputProps with password visibility toggle if needed
  const combinedInputProps = {
    ...InputProps,
    ...getPasswordAdornment()
  };

  // Render different field types
  switch (type) {    case 'select':
      return (
        <FormControlWrapper>
          {tooltipText ? renderLabelWithTooltip() : (
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
          )}
          <Select
            labelId={`${name}-label`}
            id={name}
            name={name}
            value={value || ''}
            label={!tooltipText ? label : undefined}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled || loading}
            variant={variant}
            {...rest}
          >
            {options.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {renderHelperText()}
        </FormControlWrapper>
      );

    case 'multiselect':
      return (
        <FormControlWrapper>
          {tooltipText ? renderLabelWithTooltip() : (
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
          )}
          <Select
            labelId={`${name}-label`}
            id={name}
            name={name}
            multiple
            value={value || []}
            label={!tooltipText ? label : undefined}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled || loading}
            variant={variant}
            {...rest}
          >
            {options.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {renderHelperText()}
        </FormControlWrapper>
      );    case 'checkbox':
      return (
        <FormControlWrapper sx={{ py: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={handleChange}
                name={name}
                disabled={disabled || loading}
                {...(rest as any)}
              />
            }
            label={
              tooltipText ? (
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" component="span">
                    {label} {required && <span style={{ color: 'error' }}>*</span>}
                  </Typography>
                  <Tooltip title={tooltipText} arrow placement="top">
                    <IconButton size="small" sx={{ padding: 0, ml: 0.5 }}>
                      <HelpIcon fontSize="small" color="action" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                label
              )
            }
          />
          {renderHelperText()}
        </FormControlWrapper>
      );    case 'radio':
      return (
        <FormControlWrapper>
          {tooltipText ? renderLabelWithTooltip() : (
            <Typography variant="body2" component="div" mb={1}>
              {label} {required && <span style={{ color: 'error' }}>*</span>}
            </Typography>
          )}
          <RadioGroup
            name={name}
            value={value || ''}
            onChange={handleChange}
            {...(rest as any)}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio disabled={disabled || loading || option.disabled} />}
                label={option.label}
                disabled={disabled || loading || option.disabled}
              />
            ))}
          </RadioGroup>
          {renderHelperText()}
        </FormControlWrapper>
      );

    case 'switch':
      return (
        <FormControlWrapper sx={{ py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={handleChange}
                name={name}
                disabled={disabled || loading}
                {...(rest as any)}
              />
            }
            label={
              tooltipText ? (
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" component="span">
                    {label} {required && <span style={{ color: 'error' }}>*</span>}
                  </Typography>
                  <Tooltip title={tooltipText} arrow placement="top">
                    <IconButton size="small" sx={{ padding: 0, ml: 0.5 }}>
                      <HelpIcon fontSize="small" color="action" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                label
              )
            }
          />
          {renderHelperText()}
        </FormControlWrapper>
      );

    case 'textarea':
      return (
        <TextField
          id={name}
          name={name}
          label={tooltipText ? undefined : label}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText}
          required={required}
          disabled={disabled || loading}
          fullWidth={fullWidth}
          margin={margin}
          variant={variant}
          size={size}
          multiline
          rows={4}
          InputProps={combinedInputProps}
          InputLabelProps={{ shrink: value ? true : undefined }}
          {...rest}
        >
          {tooltipText && renderLabelWithTooltip()}
        </TextField>
      );

    default:
      // Regular text field (text, email, password, etc.)
      return (
        <TextField
          id={name}
          name={name}
          type={getInputType()}
          label={tooltipText ? undefined : label}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText}
          required={required}
          disabled={disabled || loading}
          fullWidth={fullWidth}
          margin={margin}
          variant={variant}
          size={size}
          InputProps={combinedInputProps}
          InputLabelProps={{ shrink: value ? true : undefined }}
          {...rest}
        >
          {tooltipText && renderLabelWithTooltip()}
        </TextField>
      );
  }
};

export default FormField;