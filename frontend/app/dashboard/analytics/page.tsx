"use client"

import { DataTable } from "@/components/data-table"

type Analytics = {
  id: number
  metric: string
  brand: string
  platform: string
  value: string
  change: string
  period: string
}

const analytics: Analytics[] = [
  {
    id: 1,
    metric: "Impressions",
    brand: "Acme Digital",
    platform: "Instagram",
    value: "124.5K",
    change: "+12.4%",
    period: "September 2026",
  },
  {
    id: 2,
    metric: "Engagement Rate",
    brand: "Nova Beauty",
    platform: "Instagram",
    value: "8.7%",
    change: "+5.2%",
    period: "September 2026",
  },
  {
    id: 3,
    metric: "Website Visits",
    brand: "Bright Foods",
    platform: "Google",
    value: "18.2K",
    change: "+9.8%",
    period: "September 2026",
  },
  {
    id: 4,
    metric: "Ad Clicks",
    brand: "Pixel Studio",
    platform: "Facebook",
    value: "6.4K",
    change: "-2.1%",
    period: "September 2026",
  },
  {
    id: 5,
    metric: "Conversions",
    brand: "Growth Hub",
    platform: "Google Ads",
    value: "842",
    change: "+15.6%",
    period: "September 2026",
  },
]

const analyticsColumns = [
  {
    accessorKey: "metric",
    header: "Metric",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "change",
    header: "Change",
  },
  {
    accessorKey: "period",
    header: "Period",
  },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Monitor marketing performance and insights
          </p>
        </div>

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Export Report
        </button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="mb-3">
          <h2 className="text-lg font-medium">
            Marketing Analytics ({analytics.length})
          </h2>

          <p className="text-sm text-muted-foreground">
            View marketing performance across brands and platforms.
          </p>
        </div>

        <DataTable data={analytics} columns={analyticsColumns} />
      </div>
    </div>
  )
}