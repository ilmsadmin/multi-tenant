import React from 'react';
import { Grid as MuiGrid } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

// Props for our Grid component to work with both MUI v5 and v7
export interface GridProps {
  item?: boolean;
  container?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  spacing?: number;
  rowSpacing?: number;
  columnSpacing?: number;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  className?: string;
  component?: React.ElementType;
  style?: React.CSSProperties;
  [key: string]: any; // Allow any additional props
}

// Adapter component to handle Grid APIs between versions
const Grid: React.FC<GridProps> = (props) => {
  const { 
    item, 
    container, 
    xs, 
    sm, 
    md, 
    lg, 
    xl, 
    spacing,
    rowSpacing,
    columnSpacing,
    direction,
    justifyContent,
    alignItems,
    wrap,
    children,
    sx = {},
    ...rest 
  } = props;

  // Create appropriate sx styles based on breakpoints and item/container
  const gridSx: any = {
    ...sx,
  };

  // Handle container styles
  if (container) {
    gridSx.display = 'grid';
    gridSx.gridTemplateColumns = 'repeat(12, 1fr)';
    
    if (spacing !== undefined) {
      gridSx.gap = spacing * 8; // Convert to pixels (8px base)
    }
    
    if (rowSpacing !== undefined) {
      gridSx.rowGap = rowSpacing * 8;
    }
    
    if (columnSpacing !== undefined) {
      gridSx.columnGap = columnSpacing * 8;
    }
    
    if (direction) {
      gridSx.flexDirection = direction;
    }
    
    if (justifyContent) {
      gridSx.justifyContent = justifyContent;
    }
    
    if (alignItems) {
      gridSx.alignItems = alignItems;
    }
    
    if (wrap) {
      gridSx.flexWrap = wrap;
    }
  }

  // Handle item styles for each breakpoint
  if (item) {
    // Default behavior to make the item work in a grid context
    gridSx.minWidth = 0;
    
    // Apply grid-column styling based on breakpoints
    if (typeof xs === 'number') {
      gridSx.gridColumn = `span ${xs}`;
    } else if (xs === true) {
      gridSx.gridColumn = 'span 12';
    }
    
    if (typeof sm === 'number') {
      gridSx['@media (min-width:600px)'] = {
        ...(gridSx['@media (min-width:600px)'] || {}),
        gridColumn: `span ${sm}`
      };
    } else if (sm === true) {
      gridSx['@media (min-width:600px)'] = {
        ...(gridSx['@media (min-width:600px)'] || {}),
        gridColumn: 'span 12'
      };
    }
    
    if (typeof md === 'number') {
      gridSx['@media (min-width:900px)'] = {
        ...(gridSx['@media (min-width:900px)'] || {}),
        gridColumn: `span ${md}`
      };
    } else if (md === true) {
      gridSx['@media (min-width:900px)'] = {
        ...(gridSx['@media (min-width:900px)'] || {}),
        gridColumn: 'span 12'
      };
    }
    
    if (typeof lg === 'number') {
      gridSx['@media (min-width:1200px)'] = {
        ...(gridSx['@media (min-width:1200px)'] || {}),
        gridColumn: `span ${lg}`
      };
    } else if (lg === true) {
      gridSx['@media (min-width:1200px)'] = {
        ...(gridSx['@media (min-width:1200px)'] || {}),
        gridColumn: 'span 12'
      };
    }
    
    if (typeof xl === 'number') {
      gridSx['@media (min-width:1536px)'] = {
        ...(gridSx['@media (min-width:1536px)'] || {}),
        gridColumn: `span ${xl}`
      };
    } else if (xl === true) {
      gridSx['@media (min-width:1536px)'] = {
        ...(gridSx['@media (min-width:1536px)'] || {}),
        gridColumn: 'span 12'
      };
    }
  }

  return (
    <MuiGrid 
      {...rest}
      sx={gridSx}
    >
      {children}
    </MuiGrid>
  );
};

// Re-export to make it easier to use
export default Grid;
