import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  styled,
  Box,
  Divider,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  showMoreOptions?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => void;
  onMoreOptionsClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  footerContent?: React.ReactNode;
  isLoading?: boolean;
  loadingRows?: number;
  divider?: boolean;
  headerSx?: React.CSSProperties;
  contentSx?: React.CSSProperties;
  footerSx?: React.CSSProperties;
}

const StyledCard = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

/**
 * Enhanced Card component with standard layout and loading state
 */
const Card: React.FC<CardProps & Omit<MuiCardProps, keyof CardProps>> = ({
  children,
  title,
  subtitle,
  action,
  showMoreOptions = false,
  showRefresh = false,
  onRefresh,
  onMoreOptionsClick,
  footerContent,
  isLoading = false,
  loadingRows = 3,
  divider = false,
  headerSx,
  contentSx,
  footerSx,
  ...rest
}) => {
  const theme = useTheme();

  // Standard card header actions
  const cardHeaderAction = action || (
    <>
      {showRefresh && (
        <IconButton aria-label="refresh" onClick={onRefresh} size="small">
          <RefreshIcon fontSize="small" />
        </IconButton>
      )}
      {showMoreOptions && (
        <IconButton aria-label="settings" onClick={onMoreOptionsClick} size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}
    </>
  );

  // Loading state for card content
  const renderLoadingContent = () => {
    return Array(loadingRows)
      .fill(0)
      .map((_, index) => (
        <Skeleton
          key={index}
          animation="wave"
          height={index === 0 ? 40 : 20}
          width={index === 0 ? '80%' : `${Math.floor(Math.random() * (100 - 70) + 70)}%`}
          style={{ marginBottom: theme.spacing(1) }}
        />
      ));
  };

  // Title can be string or ReactNode
  const cardTitle = typeof title === 'string' ? (
    <Typography variant="h6" component="div">
      {title}
    </Typography>
  ) : (
    title
  );

  // Subtitle can be string or ReactNode
  const cardSubtitle = typeof subtitle === 'string' ? (
    <Typography variant="body2" color="text.secondary">
      {subtitle}
    </Typography>
  ) : (
    subtitle
  );

  return (
    <StyledCard {...rest}>
      {(title || subtitle || showMoreOptions || showRefresh || action) && (
        <>
          <CardHeader
            title={isLoading ? <Skeleton animation="wave" height={30} width="50%" /> : cardTitle}
            subheader={isLoading ? <Skeleton animation="wave" height={20} width="30%" /> : cardSubtitle}
            action={isLoading ? <Skeleton animation="wave" height={40} width={80} /> : cardHeaderAction}
            sx={{ px: 3, py: 2, ...headerSx }}
          />
          {divider && <Divider />}
        </>
      )}

      <CardContent sx={{ px: 3, py: 2, flexGrow: 1, ...contentSx }}>
        {isLoading ? renderLoadingContent() : children}
      </CardContent>

      {footerContent && (
        <>
          {divider && <Divider />}
          <CardActions sx={{ px: 3, py: 2, ...footerSx }}>
            {isLoading ? (
              <Box sx={{ width: '100%' }}>
                <Skeleton animation="wave" height={30} width="70%" />
              </Box>
            ) : (
              footerContent
            )}
          </CardActions>
        </>
      )}
    </StyledCard>
  );
};

export default Card;
