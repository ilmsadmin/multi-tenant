import React from 'react';
import { Grid as MuiGrid } from '@mui/material';
import { ElementType } from 'react';

interface GridProps {
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  spacing?: number;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  sx?: any;
}

const Grid: React.FC<GridProps> = ({ 
  children, 
  container, 
  item, 
  xs, 
  sm, 
  md, 
  lg, 
  xl, 
  spacing,
  alignItems,
  justifyContent,
  sx,
  ...rest 
}) => {
  const component = container ? undefined : 'div' as ElementType;
  
  return (
    <MuiGrid 
      {...(container ? { container: true } : {})} 
      {...(item ? { item: true } : {})}
      {...(component ? { component } : {})}
      {...(xs ? { xs } : {})}
      {...(sm ? { sm } : {})}
      {...(md ? { md } : {})}
      {...(lg ? { lg } : {})}
      {...(xl ? { xl } : {})}
      {...(spacing ? { spacing } : {})}
      {...(alignItems ? { alignItems } : {})}
      {...(justifyContent ? { justifyContent } : {})}
      sx={sx}
      {...rest}
    >
      {children}
    </MuiGrid>
  );
};

export default Grid;
export type { GridProps };
