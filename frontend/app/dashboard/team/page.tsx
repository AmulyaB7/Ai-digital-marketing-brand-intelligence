"use client"

import { DataTable } from "@/components/data-table"

type TeamMember = {
  id: number
  name: string
  email: string
  role: string
  status: string
  joinedAt: string
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Amulya B",
    email: "amulya@example.com",
    role: "Owner",
    status: "Active",
    joinedAt: "Sep 10, 2026",
  },
  {
    id: 2,
    name: "Vijayashree",
    email: "viji@example.com",
    role: "Manager",
    status: "Active",
    joinedAt: "Sep 12, 2026",
  },
  {
    id: 3,
    name: "ArulKrishana",
    email: "Arul@example.com",
    role: "Member",
    status: "Active",
    joinedAt: "Sep 15, 2026",
  },
  {
    id: 4,
    name: "Rohit Sharma",
    email: "rohirat@example.com",
    role: "Editor",
    status: "Active",
    joinedAt: "Sep 18, 2026",
  },
  {
    id: 5,
    name: "ms Dhoni",
    email: "mahirat@example.com",
    role: "Viewer",
    status: "Inactive",
    joinedAt: "Sep 20, 2026",
  },
]

const teamColumns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "joinedAt",
    header: "Joined At",
  },
]

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization members and roles
          </p>
        </div>

        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add Member
        </button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="mb-3">
          <h2 className="text-lg font-medium">
            Team Members ({teamMembers.length})
          </h2>

          <p className="text-sm text-muted-foreground">
            View and manage members of your organization.
          </p>
        </div>

        <DataTable data={teamMembers} columns={teamColumns} />
      </div>
    </div>
  )
}