"use client"

import { DataTable } from "@/components/data-table"

type Content = {
  id: number
  title: string
  type: string
  brand: string
  status: string
  author: string
  updatedAt: string
}

const content: Content[] = [
  {
    id: 1,
    title: "Summer Product Campaign",
    type: "Social Media",
    brand: "Acme Digital",
    status: "Published",
    author: "Marketing Team",
    updatedAt: "Sep 20, 2026",
  },
  {
    id: 2,
    title: "New Product Launch",
    type: "Blog",
    brand: "Nova Beauty",
    status: "Draft",
    author: "Content Team",
    updatedAt: "Sep 22, 2026",
  },
  {
    id: 3,
    title: "Healthy Eating Tips",
    type: "Social Media",
    brand: "Bright Foods",
    status: "Scheduled",
    author: "Marketing Team",
    updatedAt: "Sep 24, 2026",
  },
  {
    id: 4,
    title: "Brand Awareness Campaign",
    type: "Advertisement",
    brand: "Pixel Studio",
    status: "Published",
    author: "Marketing Team",
    updatedAt: "Sep 26, 2026",
  },
  {
    id: 5,
    title: "Weekly Marketing Newsletter",
    type: "Email",
    brand: "Growth Hub",
    status: "Draft",
    author: "Content Team",
    updatedAt: "Sep 28, 2026",
  },
]

const contentColumns = [
  {
    accessorKey: "title",
    header: "Content",
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
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "author",
    header: "Author",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  },
]

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Content</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage marketing content
          </p>
        </div>

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Create Content
        </button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="mb-3">
          <h2 className="text-lg font-medium">
            Content ({content.length})
          </h2>

          <p className="text-sm text-muted-foreground">
            View and manage your marketing content.
          </p>
        </div>

        <DataTable data={content} columns={contentColumns} />
      </div>
    </div>
  )
}