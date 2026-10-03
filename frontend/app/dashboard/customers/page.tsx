"use client"

import { DataTable } from "@/components/data-table"

type Customer = {
  id: number
  name: string
  email: string
  status: string
  createdAt: string
}

const customers: Customer[] = [
  {
    id: 1,
    name: "Acme Corporation",
    email: "contact@acme.com",
    status: "Active",
    createdAt: "Sep 20, 2026",
  },
  {
    id: 2,
    name: "Nova Media",
    email: "hello@novamedia.com",
    status: "Active",
    createdAt: "Sep 22, 2026",
  },
  {
    id: 3,
    name: "Bright Labs",
    email: "team@brightlabs.com",
    status: "Inactive",
    createdAt: "Sep 24, 2026",
  },
  {
    id: 4,
    name: "Pixel Works",
    email: "hello@pixelworks.com",
    status: "Active",
    createdAt: "Sep 26, 2026",
  },
  {
    id: 5,
    name: "Growth Hub",
    email: "contact@growthhub.com",
    status: "Active",
    createdAt: "Sep 28, 2026",
  },
]

const customerColumns = [
  {
    accessorKey: "name",
    header: "Customer",
  },
  {
    accessorKey: "email",
    header: "Email",
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

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6 py-6">

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Customers
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage your customers
          </p>
        </div>

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add Customer
        </button>
      </div>

      <div className="px-4 lg:px-6">

        <div className="mb-3">
          <h2 className="text-lg font-medium">
            Customers ({customers.length})
          </h2>

          <p className="text-sm text-muted-foreground">
            View and manage customer information.
          </p>
        </div>

        <DataTable
          data={customers}
          columns={customerColumns}
        />

      </div>

    </div>
  )
}