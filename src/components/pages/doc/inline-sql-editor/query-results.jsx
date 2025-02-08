import useMeasure from 'react-use-measure';
import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

export const QueryResults = ({ queryResults }) => {
  if (!queryResults?.length) {
    return null;
  }

  return (
    <Tabs.Root defaultValue="0" className="flex w-full flex-col">
      <Tabs.List className="group flex w-full items-center gap-5 border-b border-gray-new-20 bg-gray-new-98 px-4 dark:bg-gray-new-10">
        {queryResults.map(({ result }, i) => (
          <Tabs.Trigger
            key={i.toString()}
            value={i.toString()}
            className="border-b border-b-transparent py-2 text-sm text-gray-new-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-new-70 data-[state=active]:border-b-gray-new-60 data-[state=active]:text-gray-new-90 [&:not(:focus-visible)]:focus:outline-none"
          >
            {i}: {result?.command || 'Error'}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {queryResults.map(({ success, error, queryTime, result }, i) => (
        <Tabs.Content
          key={i.toString()}
          value={i.toString()}
          className="w-full grow space-y-3 overflow-y-auto rounded-b-lg bg-gray-new-98 p-4 outline-none dark:bg-gray-new-10"
        >
          <StatusIndicator
            success={success}
            message={success ? 'Query ran successfully' : error.message}
            queryTime={queryTime}
          />

          {success && <ResultTable result={result} />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

const TablePagination = ({ table, rowCount }) => (
  <div className="flex items-center gap-4 py-1.5">
    <p className="text-xs text-white/70">
      {rowCount} {rowCount === 1 ? 'row' : 'rows'}
    </p>
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
        className="p-1 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:text-white/70"
        aria-label="Previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <span className="text-xs text-white/70">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </span>
      <button
        type="button"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
        className="p-1 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:text-white/70"
        aria-label="Next page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
);

const ResultTable = ({ result }) => {
  const columns =
    result?.fields?.map((field) => ({
      accessorKey: field.name,
      header: field.name,
      indexed: true,
      size: Number.MAX_SAFE_INTEGER,
    })) ?? [];

  const table = useReactTable({
    data: result?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (!result?.rows.length) {
    return <p className="text-sm">Query completed with no result</p>;
  }

  return (
    <div className="mb-4 w-full min-w-full border-collapse overflow-auto text-sm">
      {table.getRowModel().rows?.length > 0 && (
        <TablePagination table={table} rowCount={result.rowCount} />
      )}
      <div className="w-full rounded-lg border !border-gray-new-15">
        <div className="w-full overflow-x-auto">
          <table className="!mb-1 !mt-1 min-w-full border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b !border-gray-new-15">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap border-r border-gray-new-15 px-4 py-2 text-left font-medium text-gray-new-60 first:pl-4 last:border-r-0 last:pr-4"
                      style={{
                        width:
                          header.column.columnDef.size === Number.MAX_SAFE_INTEGER
                            ? 'auto'
                            : header.column.columnDef.size,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="!not-prose divide-y divide-gray-new-15">
              {table.getRowModel().rows?.length > 0
                ? table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="!border-gray-new-15 transition-colors hover:bg-gray-new-15"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="whitespace-nowrap border-r border-gray-new-15 px-4 py-2 text-gray-new-90 first:pl-4 last:border-r-0 last:pr-4 last:dark:border-gray-new-15"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusIndicator = ({ success, message, queryTime }) => (
  <div className="flex w-full items-center space-x-2">
    {success ? (
      <svg
        className="h-4 w-4 text-code-green-1"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Checkmark Icon"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ) : (
      <svg
        className="h-4 w-4 text-code-red-1"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Error Icon"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    )}
    <p className="text-sm">{message}</p>
  </div>
);
