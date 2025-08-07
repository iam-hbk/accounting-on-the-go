import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CategoryDropdown } from "./CategoryDropdown";
import { CategoryModal } from "./CategoryModal";
import { TagsDisplay } from "./TagsDisplay";
import { Id } from "../../convex/_generated/dataModel";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";

type Transaction = {
  _id: Id<"transactions">;
  date: string;
  description: string;
  amount: number;
  direction: "credit" | "debit";
  categoryId?: Id<"categories">;
  categoryNote?: string;
  tags?: string[];
  category?: { _id: Id<"categories">; name: string } | null;
};

const columnHelper = createColumnHelper<Transaction>();

export function TransactionTable() {
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | undefined>();
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [modalTransaction, setModalTransaction] = useState<Transaction | null>(null);

  const categories = useQuery(api.categories.getCategories);
  const updateTransactionCategory = useMutation(api.transactions.updateTransactionCategory);

  // Calculate Convex pagination cursor
  const paginationOpts = useMemo(() => ({
    numItems: pagination.pageSize,
    cursor: null, // Convex handles cursor-based pagination internally
  }), [pagination.pageSize]);

  // Get sorting for Convex query
  const convexSorting = useMemo(() => {
    const sort = sorting[0];
    if (!sort) return { sortBy: "date" as const, sortOrder: "desc" as const };
    
    return {
      sortBy: sort.id as "date" | "amount" | "description",
      sortOrder: sort.desc ? "desc" as const : "asc" as const,
    };
  }, [sorting]);

  const transactions = useQuery(api.transactions.getTransactions, {
    paginationOpts,
    categoryId: selectedCategory,
    ...convexSorting,
  });

  const handleCategoryChange = useCallback((transactionId: Id<"transactions">, categoryId?: Id<"categories">) => {
    updateTransactionCategory({ transactionId, categoryId }).catch((error) => {
      console.error("Failed to update category:", error);
    });
  }, [updateTransactionCategory]);

  const handleEditClick = useCallback((transaction: Transaction) => {
    setModalTransaction(transaction);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => formatDate(info.getValue()),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <div className="max-w-xs truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => {
          const transaction = info.row.original;
          return (
            <span
              className={
                transaction.direction === "credit" ? "text-green-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {transaction.direction === "credit" ? "+" : "-"}
              {formatCurrency(info.getValue())}
            </span>
          );
        },
        sortingFn: "basic",
      }),
      columnHelper.accessor("direction", {
        header: "Type",
        cell: (info) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              info.getValue() === "credit"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {info.getValue() === "credit" ? "Credit" : "Debit"}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "category",
        header: "Category",
        cell: (info) => (
          <CategoryDropdown
            categories={categories || []}
            selectedCategoryId={info.row.original.categoryId}
            onCategoryChange={(categoryId) =>
              handleCategoryChange(info.row.original._id, categoryId)
            }
            onEditClick={() => handleEditClick(info.row.original)}
          />
        ),
      }),
      columnHelper.accessor("tags", {
        header: "Tags",
        cell: (info) => <TagsDisplay tags={info.getValue()} maxDisplay={2} />,
        enableSorting: false,
      }),
    ],
    [categories, handleCategoryChange, handleEditClick]
  );

  const table = useReactTable({
    data: transactions?.page || [],
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // We handle pagination via Convex
    manualSorting: true,    // We handle sorting via Convex
    pageCount: Math.ceil((transactions?.page.length || 0) / pagination.pageSize),
  });

  if (transactions === undefined || categories === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (transactions.page.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Transactions</h2>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600">Upload a bank statement to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Transactions</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCategory || ""}
            onChange={(e) =>
              setSelectedCategory((e.target.value as Id<"categories">) || undefined)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        <span>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                transactions.page.length
              )}{" "}
              of {transactions.page.length} results
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 text-sm border rounded"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>

            <button
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || !transactions.isDone}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={!!modalTransaction}
        onClose={() => setModalTransaction(null)}
        transaction={modalTransaction}
        categories={categories || []}
      />
    </div>
  );
}
