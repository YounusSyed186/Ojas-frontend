import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  keyExtractor?: (row: T) => string | number;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyTitle,
  emptyDescription,
  sortColumn,
  sortDirection,
  onSort,
  page,
  totalPages,
  total,
  onPageChange,
  perPage,
  onPerPageChange,
  keyExtractor,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(search ?? "");

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  };

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {(onSearchChange || (page !== undefined && totalPages !== undefined)) && (
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="rounded-lg pl-9 pr-8"
              />
              {localSearch && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {total !== undefined && (
            <p className="text-sm text-muted-foreground">{total} record{total !== 1 ? "s" : ""}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={column.className}
                      onClick={() => column.sortable && onSort?.(column.key)}
                    >
                      <button
                        type="button"
                        className={`flex items-center gap-1 ${column.sortable ? "cursor-pointer hover:text-foreground" : "cursor-default"}`}
                        disabled={!column.sortable}
                      >
                        {column.header}
                        {column.sortable && <SortIcon column={column.key} />}
                      </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={keyExtractor?.(row) ?? (row.id as string | number) ?? index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {(page !== undefined && totalPages !== undefined && totalPages > 1) && (
            <div className="border-t p-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange ?? (() => {})}
                perPage={perPage}
                onPerPageChange={onPerPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}