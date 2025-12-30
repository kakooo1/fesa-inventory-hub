import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({ 
  columns, 
  data, 
  keyExtractor, 
  emptyMessage = "No hay datos disponibles",
  onRowClick,
  className 
}: DataTableProps<T>) {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn("font-semibold text-foreground", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow 
                key={keyExtractor(item)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-accent/5",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render 
                      ? column.render(item) 
                      : String((item as Record<string, unknown>)[column.key] ?? '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
