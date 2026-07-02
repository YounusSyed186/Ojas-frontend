import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type DashboardColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

type DashboardTableProps<T> = {
  columns: DashboardColumn<T>[];
  rows: T[];
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export function DashboardTable<T extends { id?: number | string }>({
  columns,
  rows,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No records found.",
}: DashboardTableProps<T>) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {onSearchChange && (
        <div className="border-b p-4">
          <Input
            value={search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="max-w-sm rounded-xl"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={row.id ?? index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
