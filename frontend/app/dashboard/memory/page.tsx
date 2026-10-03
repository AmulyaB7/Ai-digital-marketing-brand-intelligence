"use client"

import { DataTable } from "@/components/data-table"

type Memory = {
  id: number
  title: string
  type: string
  brand: string
  source: string
  status: string
  updatedAt: string
}

const memories: Memory[] = [
  {
    id: 1,
    title: "Brand Guidelines",
    type: "Brand Profile",
    brand: "Acme Digital",
    source: "Brand Documents",
    status: "Active",
    updatedAt: "Sep 20, 2026",
  },
  {
    id: 2,
    title: "Target Audience",
    type: "Audience",
    brand: "Nova Beauty",
    source: "Marketing Research",
    status: "Active",
    updatedAt: "Sep 22, 2026",
  },
  {
    id: 3,
    title: "Product Information",
    type: "Product",
    brand: "Bright Foods",
    source: "Product Documents",
    status: "Active",
    updatedAt: "Sep 24, 2026",
  },
  {
    id: 4,
    title: "Previous Campaign Insights",
    type: "Campaign",
    brand: "Pixel Studio",
    source: "Campaign Data",
    status: "Archived",
    updatedAt: "Sep 26, 2026",
  },
  {
    id: 5,
    title: "Content Preferences",
    type: "Content",
    brand: "Growth Hub",
    source: "Content History",
    status: "Active",
    updatedAt: "Sep 28, 2026",
  },
]

const memoryColumns = [
  {
    accessorKey: "title",
    header: "Memory",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  },
]

export default function MemoryPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Memory</h1>
          <p className="text-sm text-muted-foreground">
            Manage brand knowledge and memory
          </p>
        </div>

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add Memory
        </button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="mb-3">
          <h2 className="text-lg font-medium">
            Memories ({memories.length})
          </h2>

          <p className="text-sm text-muted-foreground">
            View and manage information used by the AI brand intelligence system.
          </p>
        </div>

        <DataTable data={memories} columns={memoryColumns} />
      </div>
    </div>
  )
}