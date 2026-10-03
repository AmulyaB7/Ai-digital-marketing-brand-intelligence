"use client"

import { DataTable } from "@/components/data-table"

type Brand = {
  id: number
  name: string
  customer: string
  industry: string
  status: string
  createdAt: string
}

const brands: Brand[] = [
  {
    id: 1,
    name: "Acme Digital",
    customer: "Acme Corporation",
    industry: "Technology",
    status: "Active",
    createdAt: "Sep 20, 2026",
  },
  {
    id: 2,
    name: "Nova Beauty",
    customer: "Nova Media",
    industry: "Beauty",
    status: "Active",
    createdAt: "Sep 22, 2026",
  },
  {
    id: 3,
    name: "Bright Foods",
    customer: "Bright Labs",
    industry: "Food & Beverage",
    status: "Inactive",
    createdAt: "Sep 24, 2026",
  },
  {
    id: 4,
    name: "Pixel Studio",
    customer: "Pixel Works",
    industry: "Design",
    status: "Active",
    createdAt: "Sep 26, 2026",
  },
  {
    id: 5,
    name: "Growth Hub",
    customer: "Growth Hub",
    industry: "Marketing",
    status: "Active",
    createdAt: "Sep 28, 2026",
  },
]

const brandColumns = [
  {
    accessorKey: "name",
    header: "Brand",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]

export default function BrandsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Brands
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage your brands
          </p>
        </div>

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add Brand
        </button>
      </div>

      <div className="px-4 lg:px-6">

        <div className="mb-3">
          <h2 className="text-lg font-medium">
            Brands ({brands.length})
          </h2>

          <p className="text-sm text-muted-foreground">
            View and manage brand information.
          </p>
        </div>

        <DataTable
          data={brands}
          columns={brandColumns}
        />

      </div>

    </div>
  )
}