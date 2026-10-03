"use client"

import { DataTable } from "@/components/data-table"

type Chat = {
  id: number
  title: string
  customer: string
  brand: string
  lastMessage: string
  status: string
  updatedAt: string
}

const chats: Chat[] = [
  {
    id: 1,
    title: "Campaign Strategy Discussion",
    customer: "Acme Corporation",
    brand: "Acme Digital",
    lastMessage: "Let's review the campaign performance.",
    status: "Active",
    updatedAt: "Sep 20, 2026",
  },
  {
    id: 2,
    title: "Social Media Content",
    customer: "Nova Media",
    brand: "Nova Beauty",
    lastMessage: "Generate Instagram content for the new launch.",
    status: "Active",
    updatedAt: "Sep 22, 2026",
  },
  {
    id: 3,
    title: "Product Campaign Ideas",
    customer: "Bright Labs",
    brand: "Bright Foods",
    lastMessage: "Show me some campaign ideas.",
    status: "Completed",
    updatedAt: "Sep 24, 2026",
  },
  {
    id: 4,
    title: "Brand Analysis",
    customer: "Pixel Works",
    brand: "Pixel Studio",
    lastMessage: "Analyze our recent brand performance.",
    status: "Active",
    updatedAt: "Sep 26, 2026",
  },
  {
    id: 5,
    title: "Content Recommendations",
    customer: "Growth Hub",
    brand: "Growth Hub",
    lastMessage: "What content should we publish next?",
    status: "Completed",
    updatedAt: "Sep 28, 2026",
  },
]

const chatColumns = [
  {
    accessorKey: "title",
    header: "Conversation",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "lastMessage",
    header: "Last Message",
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

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Chat</h1>
          <p className="text-sm text-muted-foreground">
            Manage AI conversations and brand discussions
          </p>
        </div>

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          New Chat
        </button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="mb-3">
          <h2 className="text-lg font-medium">
            Conversations ({chats.length})
          </h2>

          <p className="text-sm text-muted-foreground">
            View and manage conversations with the AI assistant.
          </p>
        </div>

        <DataTable data={chats} columns={chatColumns} />
      </div>
    </div>
  )
}