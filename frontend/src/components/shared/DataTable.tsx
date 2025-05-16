import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Box,
  Tooltip,
  Typography,
  Skeleton,
  Toolbar,
  alpha,
  styled,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Define the column interface
interface Column<T> {
  id: keyof T | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  disablePadding?: boolean;
}

// Props for the DataTable component
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  title?: string;
  isLoading?: boolean;
  showSearch?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  actions?: React.ReactNode;
  onSearch?: (searchTerm: string) => void;
  customEmptyState?: React.ReactNode;
  defaultSortBy?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  renderRowActions?: (row: T) => React.ReactNode;
}

// Descendant sorting
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<T>(
  order: Order,
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Enhanced toolbar with selection options
const EnhancedTableToolbar = styled(Toolbar, {
  shouldForwardProp: (prop) => prop !== 'numSelected',
})<{ numSelected: number }>(({ theme, numSelected }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  ...(numSelected > 0 && {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.action.activatedOpacity
    ),
  }),
}));

/**
 * A reusable data table component with features such as:
 * - Pagination
 * - Sorting
 * - Row selection
 * - Search
 * - Loading state
 * - Custom formatting
 * - Row actions
 */
function DataTable<T>({
  columns,
  data,
  getRowId,
  title,
  isLoading = false,
  showSearch = false,
  selectable = false,
  onRowClick,
  onSelectionChange,
  actions,
  onSearch,
  customEmptyState,
  defaultSortBy,
  defaultSortDirection = 'asc',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  stickyHeader = false,
  maxHeight = 'auto',
  renderRowActions
}: DataTableProps<T>) {
  // State for pagination, sorting, and selection
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [order, setOrder] = useState<Order>(defaultSortDirection);
  const [orderBy, setOrderBy] = useState<keyof T | undefined>(defaultSortBy);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle sort request
  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle selection of all rows
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => getRowId(n));
      setSelected(newSelected);
      onSelectionChange && onSelectionChange(data);
      return;
    }
    setSelected([]);
    onSelectionChange && onSelectionChange([]);
  };

  // Handle selection of a single row
  const handleClick = (event: React.MouseEvent<HTMLTableRowElement>, row: T) => {
    if (onRowClick) {
      onRowClick(row);
      return;
    }

    if (!selectable) return;

    const id = getRowId(row);
    const selectedIndex = selected.indexOf(id);
    let newSelected: (string | number)[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
    if (onSelectionChange) {
      const selectedRows = data.filter((row) => newSelected.includes(getRowId(row)));
      onSelectionChange(selectedRows);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Check if row is selected
  const isSelected = (id: string | number) => selected.includes(id);

  // Create empty rows to fill the table
  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - data.length);

  // Sort and paginate the data
  const visibleRows = React.useMemo(() => {
    if (isLoading) {
      return Array(rowsPerPage).fill(null);
    }

    const sortedData = orderBy 
      ? [...data].sort(getComparator(order, orderBy))
      : data;
      
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [data, isLoading, order, orderBy, page, rowsPerPage]);

  // Render loading cells
  const renderLoadingCell = (column: Column<T>) => (
    <TableCell 
      key={String(column.id)} 
      align={column.align}
      padding={column.disablePadding ? 'none' : 'normal'}
    >
      <Skeleton animation="wave" />
    </TableCell>
  );

  return (
    <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
      {/* Table Toolbar */}
      {(title || showSearch || selectable || actions) && (
        <EnhancedTableToolbar numSelected={selected.length}>
          <Box sx={{ flex: '1 1 100%', display: 'flex', alignItems: 'center' }}>
            {selectable && selected.length > 0 ? (
              <Typography
                color="inherit"
                variant="subtitle1"
                component="div"
              >
                {selected.length} selected
              </Typography>
            ) : (
              title && (
                <Typography
                  variant="h6"
                  id="tableTitle"
                  component="div"
                >
                  {title}
                </Typography>
              )
            )}
          </Box>

          {/* Search field */}
          {showSearch && (
            <Box sx={{ mr: 2 }}>
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSearchTerm('');
                          onSearch && onSearch('');
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {/* Actions */}
          {selectable && selected.length > 0 ? (
            <Tooltip title="Delete">
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              {actions}
              <Tooltip title="Filter list">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </EnhancedTableToolbar>
      )}

      {/* Table Container */}
      <TableContainer sx={{ maxHeight }}>
        <Table
          stickyHeader={stickyHeader}
          aria-labelledby="tableTitle"
          size="medium"
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all',
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  padding={column.disablePadding ? 'none' : 'normal'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id as keyof T)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, index) => {
              if (isLoading) {
                return (
                  <TableRow key={`loading-${index}`}>
                    {selectable && <TableCell padding="checkbox"><Skeleton animation="wave" width={20} /></TableCell>}
                    {columns.map((column) => renderLoadingCell(column))}
                  </TableRow>
                );
              }

              if (row) {
                const id = getRowId(row);
                const isItemSelected = isSelected(id);
                const labelId = `table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row)}
                    role={selectable ? 'checkbox' : undefined}
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={id}
                    selected={isItemSelected}
                    sx={{ cursor: (selectable || onRowClick) ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      if (column.id === 'actions' && renderRowActions) {
                        return (
                          <TableCell
                            key={`${id}-actions`}
                            align={column.align || 'left'}
                            padding={column.disablePadding ? 'none' : 'normal'}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {renderRowActions(row)}
                          </TableCell>
                        );
                      }
                      
                      const value = column.id !== 'actions' ? row[column.id as keyof T] : null;
                      return (
                        <TableCell
                          key={`${id}-${String(column.id)}`}
                          align={column.align || 'left'}
                          padding={column.disablePadding ? 'none' : 'normal'}
                        >
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              }
              return null;
            })}

            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  align="center" 
                  sx={{ py: 5 }}
                >
                  {customEmptyState || (
                    <Box sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No data to display
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Add some data to get started'}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && emptyRows > 0 && data.length > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default DataTable;
