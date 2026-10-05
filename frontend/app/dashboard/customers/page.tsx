"use client"

import { useEffect, useState } from "react"
import { useOrganization } from "@clerk/nextjs"
import { DataTable } from "@/components/data-table"

type Customer = {
  id: number
  customer_id: string
  customer_name: string
  segment: string | null
  country: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  region: string | null
  created_at: string
}

const customerColumns = [
  {
    accessorKey: "customer_name",
    header: "Customer",
  },
  {
    accessorKey: "customer_id",
    header: "Customer ID",
  },
  {
    accessorKey: "segment",
    header: "Segment",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
]

export default function CustomersPage() {
  const { organization } = useOrganization()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!organization?.id) return

    const fetchCustomers = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `http://localhost:3001/customers?orgId=${organization.id}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch customers")
        }

        const data = await response.json()

        setCustomers(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load customers")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [organization?.id])

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

        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading customers...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && (
          <DataTable
            data={customers}
            columns={customerColumns}
          />
        )}
      </div>
    </div>
  )
}