// DataTable.js
import React, { useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Loader, PlusCircleIcon, Trash, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import TableSkeleton from "./table-skeleton-loader";
import { DataTablePagination } from "./table-pagination";
import { EmptyState } from "../empty-state";

export function DataTable({
  data,
  columns,
  searchPlaceholder = "Search...",
  showSearch=true,
  filters,
  className,
  onSearch,
  onFilterChange,
  onBulkDelete,
  selection=true,
  isLoading,
  isBulkDeleting,
  isShowPagination=true,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getRowId:(row)=>row._id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection:true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const hasSelections = selectedRows.length > 0;
 
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filterValues, [key]: value };
    setFilterValues(updated);
    onFilterChange?.(updated);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilterValues({});
    setRowSelection({});
    onSearch?.("");
    onFilterChange?.({});
  };

  const handleDelete = () => {
    const selectedIds = selectedRows.map((row) => row.original._id);
  
    onBulkDelete?.(selectedIds);
    setRowSelection({});
  };

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {showSearch && (
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              disabled={isLoading}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
          )}
          {filters.map(({ key, label, options }) => (
            <Select
              key={key}
              value={filterValues[key] ?? ""}
              disabled={isLoading}
              onValueChange={(value) => handleFilterChange(key, value)}
            >
              <SelectTrigger className="min-w-[160px]">
                <div className="flex items-center gap-2">
                  <PlusCircleIcon className="h-4 w-4 opacity-50" />
                  <SelectValue placeholder={label} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {(searchTerm ||
            hasSelections ||
            Object.keys(filterValues).length > 0) && (
            <Button
              variant="ghost"
              disabled={isLoading || isBulkDeleting}
              onClick={handleClear}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
        {(selection && hasSelections) || isBulkDeleting ? (
          <Button
            disabled={isLoading || isBulkDeleting}
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete ({selectedRows.length})
            {isBulkDeleting && <Loader className="ml-1 h-4 w-4 animate-spin" />}
          </Button>
        ) : null}
      </div>

      {/* Data table */}
      <div className={cn("rounded-md border overflow-x-auto", className)}>
        {isLoading ? (
          <TableSkeleton columns={6} rows={20} />
        ) : (
          <Table
            className={cn(
              table.getRowModel().rows.length === 0 ? "h-[200px]" : ""
            )}
          >
            <TableHeader className="sticky top-0 bg-muted z-10">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id} className="!font-medium !text-[13px]">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="!text-[13.3px]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    <EmptyState title="No records found" description="" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {isShowPagination && (
        <div className="mt-4">
          <DataTablePagination
            pageNumber={pagination.pageNumber || 1}
            pageSize={pagination.pageSize || 10}
            totalCount={pagination.totalItems || 0}
            totalPages={pagination.totalPages || 1}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
