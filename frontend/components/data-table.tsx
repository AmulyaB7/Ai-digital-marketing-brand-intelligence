"use client"

import * as React from "react"

import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
} from "lucide-react"

/* -----------------------------------------
   Table Features
----------------------------------------- */

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

/* -----------------------------------------
   Props
----------------------------------------- */

type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns?: ColumnDef<typeof features, TData>[]
}

/* -----------------------------------------
   Reusable DataTable
----------------------------------------- */

export function DataTable<TData extends RowData>({
  data,
  columns,
}: DataTableProps<TData>) {
  /*
   * If a page does not provide columns yet,
   * automatically create simple columns from
   * the data keys.
   *
   * Later, Customers / Brands / Content etc.
   * can provide their own custom columns.
   */

  const generatedColumns = React.useMemo<
    ColumnDef<typeof features, TData>[]
  >(() => {
    if (columns) {
      return columns
    }

    if (!data.length) {
      return []
    }

    const firstRow = data[0] as Record<string, unknown>

    return Object.keys(firstRow).map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
    }))
  }, [columns, data])

  const [sorting, setSorting] =
    React.useState<SortingState>([])

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})

  const [rowSelection, setRowSelection] =
    React.useState({})

  const [globalFilter, setGlobalFilter] =
    React.useState("")

  const [pagination, setPagination] =
    React.useState({
      pageIndex: 0,
      pageSize: 10,
    })

  const table = useTable({
    features,

    data,

    columns: generatedColumns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },

    enableRowSelection: true,

    onSortingChange: setSorting,

    onColumnFiltersChange: setColumnFilters,

    onColumnVisibilityChange: setColumnVisibility,

    onRowSelectionChange: setRowSelection,

    onGlobalFilterChange: setGlobalFilter,

    onPaginationChange: setPagination,
  })

  return (
    <div className="w-full space-y-4">

      {/* -----------------------------------------
          Search + Column Visibility
      ----------------------------------------- */}

      <div className="flex items-center justify-between gap-2">

        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => {
            setGlobalFilter(event.target.value)
          }}
          className="max-w-sm"
        />

        <DropdownMenu>

          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
              >
                <Columns3Icon />

                Columns

                <ChevronDownIcon />
              </Button>
            }
          />

          <DropdownMenuContent align="end">

            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide()
              )
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(
                      !!value
                    )
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}

          </DropdownMenuContent>

        </DropdownMenu>

      </div>

      {/* -----------------------------------------
          Table
      ----------------------------------------- */}

      <div className="overflow-hidden rounded-lg border">

        <Table>

          <TableHeader>

            {table
              .getHeaderGroups()
              .map((headerGroup) => (

                <TableRow
                  key={headerGroup.id}
                >

                  {headerGroup.headers.map(
                    (header) => (

                      <TableHead
                        key={header.id}
                      >

                        {header.isPlaceholder
                          ? null
                          : (
                            <div
                              className={
                                header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : ""
                              }
                              onClick={
                                header.column.getCanSort()
                                  ? header.column.getToggleSortingHandler()
                                  : undefined
                              }
                            >

                              <table.FlexRender
                                header={header}
                              />

                              {header.column.getIsSorted() ===
                                "asc" && " ↑"}

                              {header.column.getIsSorted() ===
                                "desc" && " ↓"}

                            </div>
                          )}

                      </TableHead>

                    )
                  )}

                </TableRow>

              ))}

          </TableHeader>

          <TableBody>

            {table.getRowModel().rows.length > 0 ? (

              table
                .getRowModel()
                .rows
                .map((row) => (

                  <TableRow
                    key={row.id}
                    data-state={
                      row.getIsSelected()
                        ? "selected"
                        : undefined
                    }
                  >

                    {row
                      .getVisibleCells()
                      .map((cell) => (

                        <TableCell
                          key={cell.id}
                        >

                          <table.FlexRender
                            cell={cell}
                          />

                        </TableCell>

                      ))}

                  </TableRow>

                ))

            ) : (

              <TableRow>

                <TableCell
                  colSpan={
                    generatedColumns.length
                  }
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>

      {/* -----------------------------------------
          Pagination
      ----------------------------------------- */}

      <div className="flex items-center justify-between">

        <div className="text-sm text-muted-foreground">

          {table
            .getFilteredSelectedRowModel()
            .rows.length}{" "}
          of{" "}
          {table
            .getFilteredRowModel()
            .rows.length}{" "}
          row(s) selected.

        </div>

        <div className="flex items-center gap-2">

          {/* First Page */}

          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() =>
              table.setPageIndex(0)
            }
            disabled={
              !table.getCanPreviousPage()
            }
          >
            <ChevronsLeftIcon />

            <span className="sr-only">
              Go to first page
            </span>
          </Button>

          {/* Previous Page */}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() =>
              table.previousPage()
            }
            disabled={
              !table.getCanPreviousPage()
            }
          >
            <ChevronLeftIcon />

            <span className="sr-only">
              Go to previous page
            </span>
          </Button>

          {/* Page Number */}

          <span className="text-sm font-medium">

            Page{" "}
            {table.state.pagination.pageIndex + 1}
            {" "}of{" "}
            {Math.max(
              table.getPageCount(),
              1
            )}

          </span>

          {/* Next Page */}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() =>
              table.nextPage()
            }
            disabled={
              !table.getCanNextPage()
            }
          >
            <ChevronRightIcon />

            <span className="sr-only">
              Go to next page
            </span>
          </Button>

          {/* Last Page */}

          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() =>
              table.setPageIndex(
                Math.max(
                  table.getPageCount() - 1,
                  0
                )
              )
            }
            disabled={
              !table.getCanNextPage()
            }
          >
            <ChevronsRightIcon />

            <span className="sr-only">
              Go to last page
            </span>
          </Button>

        </div>

      </div>

    </div>
  )
}