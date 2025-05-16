import React, { useState } from 'react';
import {  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Badge,
  alpha,
  styled,
  SvgIconProps
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

// Navigation item interface
export interface NavigationItem {
  id: string;
  title: string;
  path?: string;
  icon?: React.ReactElement<SvgIconProps>;
  children?: NavigationItem[];
  divider?: boolean;
  badge?: {
    value: number | string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  disabled?: boolean;
  restricted?: boolean; // If true, the item is only visible to users with specific permissions
  onClick?: () => void;
}

interface NavigationMenuProps {
  items: NavigationItem[];
  collapsed?: boolean;
  onNavigate?: (item: NavigationItem) => void;
  activeItemId?: string;
  showIcons?: boolean;
  dense?: boolean;
}

// Styled components
const MenuItemButton = styled(ListItemButton)(({ theme: muiTheme }) => ({
  borderRadius: muiTheme.shape.borderRadius,
  margin: muiTheme.spacing(0.5, 1),
  '&.Mui-selected': {
    backgroundColor: alpha(muiTheme.palette.primary.main, 0.12),
    '&:hover': {
      backgroundColor: alpha(muiTheme.palette.primary.main, 0.16),
    },
  },
}));

/**
 * Navigation menu component that supports nested hierarchies, badges, and collapsible sections
 */
const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  collapsed = false,
  onNavigate,
  activeItemId,
  showIcons = true,
  dense = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to track open submenu sections
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Toggle a submenu section
  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sectionId) => sectionId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle navigation
  const handleNavigation = (item: NavigationItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
      return;
    }
    
    if (item.path) {
      navigate(item.path);
      
      if (onNavigate) {
        onNavigate(item);
      }
    } else if (item.children && item.children.length > 0) {
      toggleSection(item.id);
    }
  };

  // Check if an item is active based on the current location
  const isItemActive = (item: NavigationItem): boolean => {
    if (activeItemId) {
      return item.id === activeItemId;
    }
    
    if (item.path && location.pathname.startsWith(item.path)) {
      return true;
    }
    
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    
    return false;
  };

  // Recursively render navigation items
  const renderNavItems = (navItems: NavigationItem[], level = 0) => {
    return navItems.map((item) => {
      const isActive = isItemActive(item);
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openSections.includes(item.id);
      
      // Handle nested items
      const paddingLeft = level * (dense ? 1.5 : 2);
      
      return (
        <React.Fragment key={item.id}>
          <ListItem 
            disablePadding 
            sx={{ 
              display: item.restricted ? 'none' : 'block',
            }}
          >
            <MenuItemButton
              onClick={() => handleNavigation(item)}
              disabled={item.disabled}
              selected={isActive}
              sx={{
                pl: paddingLeft + (showIcons ? 2 : 1),
                minHeight: dense ? 36 : 48,
              }}
            >
              {showIcons && item.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.badge ? (
                    <Badge
                      badgeContent={item.badge.value}
                      color={item.badge.color || 'primary'}
                      sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
              )}
              
              {!collapsed && (
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    noWrap: true,
                    variant: dense ? 'body2' : 'body1',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'primary.main' : 'inherit',
                    fontSize: dense ? '0.875rem' : undefined,
                  }}
                />
              )}
              
              {!collapsed && hasChildren && (
                isOpen ? <ExpandLess /> : <ExpandMore />
              )}
              
              {collapsed && hasChildren && (
                <ChevronRightIcon fontSize="small" sx={{ ml: -1 }} />
              )}
              
              {collapsed && item.badge && (
                <Badge
                  badgeContent={item.badge.value}
                  color={item.badge.color || 'primary'}
                  sx={{ 
                    position: 'absolute', 
                    right: 4, 
                    top: 4,
                    '& .MuiBadge-badge': { fontSize: 9, height: 14, minWidth: 14 }
                  }}
                />
              )}
            </MenuItemButton>
          </ListItem>          
          {hasChildren && !collapsed && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding dense={dense}>
                {item.children && renderNavItems(item.children, level + 1)}
              </List>
            </Collapse>
          )}
          
          {item.divider && <Divider sx={{ my: 1 }} />}
        </React.Fragment>
      );
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <List dense={dense} sx={{ p: 0.5 }}>
        {renderNavItems(items)}
      </List>
    </Box>
  );
};

export default NavigationMenu;
