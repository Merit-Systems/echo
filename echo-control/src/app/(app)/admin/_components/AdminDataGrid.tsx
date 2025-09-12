'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { 
  ColDef, 
  GridReadyEvent, 
  SelectionChangedEvent,
  FilterChangedEvent,
  SortChangedEvent,
  GridApi,
  GridOptions
} from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Search, Menu, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface AdminDataGridProps<T = object> {
  title?: string;
  data: T[];
  columnDefs: ColDef<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  globalSearch?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  selection?: {
    mode: 'single' | 'multiple';
    selectedRows: T[];
    onSelectionChange: (rows: T[]) => void;
  };
  actions?: Array<{
    label: string;
    onClick: (selectedRows: T[]) => void;
    disabled?: (selectedRows: T[]) => boolean;
    variant?: 'default' | 'destructive';
  }>;
  onRefresh?: () => void;
  className?: string;
}

export function AdminDataGrid<T = object>({
  title,
  data,
  columnDefs,
  loading = false,
  error = null,
  pagination,
  globalSearch,
  selection,
  actions,
  onRefresh,
  className
}: AdminDataGridProps<T>) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    if (selection) {
      const selectedRows = event.api.getSelectedRows();
      selection.onSelectionChange(selectedRows);
    }
  }, [selection]);

  const onFilterChanged = useCallback((_event: FilterChangedEvent) => {
    // Handle filter changes if needed
  }, []);

  const onSortChanged = useCallback((_event: SortChangedEvent) => {
    // Handle sort changes if needed
  }, []);

  const gridOptions = useMemo<GridOptions>(() => ({
    theme: 'legacy',
    animateRows: true,
    suppressRowClickSelection: false,
    rowSelection: selection ? selection.mode : undefined,
    suppressCellFocus: true,
    domLayout: 'normal',
    defaultColDef: {
      sortable: true,
      filter: 'agTextColumnFilter',
      resizable: true,
      minWidth: 120,
      wrapText: true,
      autoHeight: true,
      cellStyle: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px 16px',
        lineHeight: '1.5',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        fontSize: '14px',
      },
      cellClass: 'cell-wrap-text',
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 300,
      },
    },
    autoSizeStrategy: {
      type: 'fitCellContents',
      skipHeader: false,
    },
    suppressColumnVirtualisation: true,
    rowHeight: 72,
    headerHeight: 56,
    floatingFiltersHeight: 48,
    suppressPaginationPanel: !!pagination,
    suppressScrollOnNewData: true,
    getRowId: (params) => {
      const id = (params.data as T & { id?: string | number })?.id;
      return id != null ? String(id) : '';
    },
  }), [selection, pagination]);

  const processedColumnDefs = useMemo(() => {
    const cols = [...columnDefs].map(col => ({
      ...col,
      minWidth: col.minWidth || 150,
      headerTooltip: col.headerName,
      wrapText: col.wrapText !== false,
      autoHeight: col.autoHeight !== false,
      cellStyle: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px 16px',
        lineHeight: '1.5',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        fontSize: '14px',
        ...col.cellStyle,
      },
      cellClass: `cell-wrap-text ${col.cellClass || ''}`.trim(),
    }));
    
    if (selection?.mode === 'multiple') {
      cols.unshift({
        headerName: '',
        headerTooltip: 'Select rows',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        minWidth: 50,
        maxWidth: 50,
        suppressMovable: true,
        resizable: false,
        suppressSizeToFit: true,
        pinned: 'left',
        lockPosition: true,
        sortable: false,
        filter: false,
        wrapText: false,
        autoHeight: false,
        cellClass: '',
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          lineHeight: '1.5',
          whiteSpace: 'normal',
          wordBreak: 'normal',
          fontSize: '14px',
        },
      });
    }

    return cols.map(col => ({
      ...col,
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 300,
        ...col.filterParams,
      },
    }));
  }, [columnDefs, selection]);

  const filteredData = useMemo(() => {
    if (!globalSearch?.value || !data) return data;
    
    const searchTerm = globalSearch.value.toLowerCase();
    return data.filter(row => {
      return Object.values(row as object).some(value => {
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm);
      });
    });
  }, [data, globalSearch?.value]);

  const handleGlobalSearch = useCallback((value: string) => {
    globalSearch?.onChange(value);
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', value);
    }
  }, [globalSearch, gridApi]);

  const renderPaginationControls = () => {
    if (!pagination) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
          {pagination.total} entries
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => pagination.onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderToolbar = () => {
    if (!globalSearch && !actions && !onRefresh) return null;

    return (
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-4">
          {globalSearch && (
            <div className="relative flex-1 min-w-64 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={globalSearch.placeholder || 'Search...'}
                value={globalSearch.value}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {actions && actions.length > 0 && selection && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selection.selectedRows.length === 0}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Actions ({selection.selectedRows.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <React.Fragment key={index}>
                    <DropdownMenuItem
                      onClick={() => action.onClick(selection.selectedRows)}
                      disabled={action.disabled?.(selection.selectedRows)}
                      className={action.variant === 'destructive' ? 'text-destructive' : ''}
                    >
                      {action.label}
                    </DropdownMenuItem>
                    {index < actions.length - 1 && <DropdownMenuSeparator />}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      {renderToolbar()}
      <div 
        className={`${mounted && resolvedTheme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'} ag-theme-echo h-[600px] ${loading ? 'opacity-50' : ''}`}
        style={{ 
          width: '100%',
          '--ag-row-height': '72px',
          '--ag-header-height': '56px',
          '--ag-cell-horizontal-padding': '16px',
          '--ag-cell-vertical-padding': '12px',
        } as React.CSSProperties}
      >
        <AgGridReact<T>
          modules={[AllCommunityModule]}
          {...gridOptions}
          rowData={filteredData}
          columnDefs={processedColumnDefs}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          onFilterChanged={onFilterChanged}
          onSortChanged={onSortChanged}
          loading={loading}
        />
      </div>
      {renderPaginationControls()}
    </Card>
  );
}