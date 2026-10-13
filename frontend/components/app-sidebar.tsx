
"use client"

import * as React from "react"
import { useOrganization } from "@clerk/nextjs"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  LayoutDashboardIcon,
  UsersIcon,
  FolderIcon,
  DatabaseIcon,
  MessageCircleIcon,
  FileTextIcon,
  ChartBarIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  CommandIcon,
  Building2Icon,
} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: <UsersIcon />,
    },
    {
      title: "Brands",
      url: "/dashboard/brands",
      icon: <FolderIcon />,
    },
    {
      title: "Memory",
      url: "/dashboard/memory",
      icon: <DatabaseIcon />,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: <MessageCircleIcon />,
    },
    {
      title: "Content",
      url: "/dashboard/content",
      icon: <FileTextIcon />,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: <ChartBarIcon />,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: <UsersIcon />,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "#",
      icon: <SearchIcon />,
    },
  ],
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { organization, isLoaded } = useOrganization()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/dashboard" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">
                AI Digital Marketing
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="px-3 py-3">
        <div className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-600 text-white">
            <Building2Icon className="size-4" />
          </div>

          <span className="min-w-0 truncate text-sm font-medium">
            {!isLoaded
              ? "Loading organization..."
              : organization?.name ?? "No organization assigned"}
          </span>
        </div>
      </div>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
