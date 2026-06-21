import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export const Table = ({
  columns,
  data = [],
  onSort,
  sortBy,
  sortOrder,
  pagination,
  onRowClick,
}) => {
  return (
    <div className="w-full bg-charcoal-sidebar border border-indigo-border rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-charcoal-navbar border-b border-indigo-border">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`p-4 text-xs font-semibold uppercase tracking-wider text-stardust-text ${
                    col.sortable ? 'cursor-pointer hover:bg-indigo-muted/20 select-none' : ''
                  }`}
                  onClick={() => col.sortable && onSort && onSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown size={12} className="text-grey-text hover:text-stardust-text" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-border/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-grey-text text-sm">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-indigo-muted/15 transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowIdx % 2 === 0 ? 'bg-charcoal-sidebar' : 'bg-charcoal-navbar/40'}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-4 text-sm text-stardust-text font-normal">
                      {col.render
                        ? col.render(row[col.accessor], row)
                        : row[col.accessor] !== undefined && row[col.accessor] !== null
                        ? String(row[col.accessor])
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-charcoal-navbar/80 p-4 border-t border-indigo-border select-none">
          <p className="text-xs text-grey-text">
            Showing Page <span className="font-semibold text-stardust-text">{pagination.currentPage}</span> of{' '}
            <span className="font-semibold text-stardust-text">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="p-1.5 rounded bg-charcoal-sidebar border border-indigo-border text-stardust-text hover:bg-brand-hover disabled:opacity-50 disabled:hover:bg-charcoal-sidebar transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="p-1.5 rounded bg-charcoal-sidebar border border-indigo-border text-stardust-text hover:bg-brand-hover disabled:opacity-50 disabled:hover:bg-charcoal-sidebar transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
