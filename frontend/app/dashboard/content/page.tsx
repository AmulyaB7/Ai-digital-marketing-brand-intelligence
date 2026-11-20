
"use client"

import { useMemo, useState } from "react"
import {
  FileText,
  Clock3,
  CheckCircle2,
  Rocket,
  Search,
  Send,
  MessageCircle,
  Camera,
  BarChart3,
  Users,
  X,
} from "lucide-react"

type PostStatus = "Draft" | "Approved" | "Published"
type Platform = "Instagram" | "Google Ads" | "Facebook"

type Post = {
  id: number
  title: string
  description: string
  brand: string
  platform: Platform
  status: PostStatus
  date: string
}

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Summer Collection Launch",
    description: "Discover our latest summer fashion collection",
    brand: "Nova Fashion",
    platform: "Instagram",
    status: "Approved",
    date: "05 Nov 2026",
  },
  {
    id: 2,
    title: "Festive Shopping Sale",
    description: "Enjoy exclusive festive season discounts",
    brand: "Style Avenue",
    platform: "Facebook",
    status: "Draft",
    date: "04 Nov 2026",
  },
  {
    id: 3,
    title: "Digital Growth Campaign",
    description: "Grow your business with smart marketing",
    brand: "Growth Hub",
    platform: "Google Ads",
    status: "Published",
    date: "03 Nov 2026",
  },
  {
    id: 4,
    title: "New Skincare Arrivals",
    description: "Explore our everyday skincare essentials",
    brand: "Glow Naturals",
    platform: "Instagram",
    status: "Approved",
    date: "03 Nov 2026",
  },
  {
    id: 5,
    title: "Weekend Food Specials",
    description: "Fresh flavours for your weekend cravings",
    brand: "Urban Bites",
    platform: "Facebook",
    status: "Draft",
    date: "02 Nov 2026",
  },
  {
    id: 6,
    title: "Brand Awareness Campaign",
    description: "Make your brand stand out online",
    brand: "Pixel Studio",
    platform: "Google Ads",
    status: "Published",
    date: "01 Nov 2026",
  },
  {
    id: 7,
    title: "Customer Appreciation Post",
    description: "Thank you for being part of our journey",
    brand: "Nova Fashion",
    platform: "Instagram",
    status: "Draft",
    date: "31 Oct 2026",
  },
  {
    id: 8,
    title: "New Product Announcement",
    description: "Something exciting is coming soon",
    brand: "Glow Naturals",
    platform: "Facebook",
    status: "Approved",
    date: "30 Oct 2026",
  },
  {
    id: 9,
    title: "Holiday Offer Campaign",
    description: "Special offers you don't want to miss",
    brand: "Urban Bites",
    platform: "Google Ads",
    status: "Draft",
    date: "29 Oct 2026",
  },
  {
    id: 10,
    title: "Behind the Scenes",
    description: "A look behind our creative process",
    brand: "Pixel Studio",
    platform: "Instagram",
    status: "Published",
    date: "28 Oct 2026",
  },
]

function SummaryCard({
  title,
  value,
  total,
  icon: Icon,
  progress,
}: {
  title: string
  value: number
  total?: number
  icon: React.ElementType
  progress?: number
}) {
  return (
    <div className="rounded-2xl border border-[#e4eeeb] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e2f8f2] text-[#35b8a8]">
          <Icon size={22} />
        </div>

        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-700">
            {value}
            {total !== undefined && (
              <span className="ml-1 text-sm font-normal text-gray-400">
                / {total}
              </span>
            )}
          </p>
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7f4f0]">
          <div
            className="h-full rounded-full bg-[#39b8a9] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "Instagram") return <Camera size={14} />
  if (platform === "Facebook") return <Users size={14} />
  return <BarChart3 size={14} />
}

export default function ContentPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")

  const total = posts.length

  const waiting = posts.filter(
    (post) => post.status === "Draft"
  ).length

  const approved = posts.filter(
    (post) => post.status === "Approved"
  ).length

  const published = posts.filter(
    (post) => post.status === "Published"
  ).length

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        `${post.title} ${post.description} ${post.brand} ${post.platform} ${post.status}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesFilter =
        activeFilter === "All" || post.status === activeFilter

      return matchesSearch && matchesFilter
    })
  }, [posts, search, activeFilter])

  function updateStatus(id: number, status: PostStatus) {
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? { ...post, status } : post
      )
    )
  }

  return (
    <div className="min-h-screen bg-[#f4faf8] p-5 md:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* PAGE HEADER */}

        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Content Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, manage and track your marketing content.
          </p>
        </div>

        {/* SUMMARY CARDS */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Posts"
            value={total}
            icon={FileText}
          />

          <SummaryCard
            title="Waiting for approval"
            value={waiting}
            total={total}
            icon={Clock3}
            progress={total ? (waiting / total) * 100 : 0}
          />

          <SummaryCard
            title="Approved, ready to post"
            value={approved}
            total={total}
            icon={CheckCircle2}
            progress={total ? (approved / total) * 100 : 0}
          />

          <SummaryCard
            title="Published"
            value={published}
            total={total}
            icon={Rocket}
            progress={total ? (published / total) * 100 : 0}
          />
        </section>

        {/* POSTS SECTION */}

        <section className="overflow-hidden rounded-2xl border border-[#e1eeea] bg-white shadow-sm">

          {/* POSTS HEADER */}

          <div className="flex flex-col justify-between gap-4 border-b border-[#edf2f0] p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-slate-800">
                Posts
                <span className="ml-2 rounded-full bg-[#e4f8f2] px-2 py-1 text-xs text-[#2eaa9b]">
                  {total}
                </span>
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Review drafts, approve content and manage your campaigns.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href="/dashboard/chat"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#39b8a9] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2da99a]"
              >
                <MessageCircle size={16} />
                Write in Chat
              </a>

              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <Search size={16} className="text-gray-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full text-sm outline-none sm:w-40"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-2 border-b border-[#edf2f0] px-5 py-3">
            {["All", "Draft", "Approved", "Published"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  activeFilter === filter
                    ? "bg-[#39b8a9] text-white"
                    : "bg-[#f2f7f5] text-slate-600 hover:bg-[#e5f4ef]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f7fbf9] text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Post</th>
                  <th className="px-5 py-4">Brand</th>
                  <th className="px-5 py-4">Platform</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-t border-[#edf2f0] transition hover:bg-[#f8fcfa]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e2f8f2] text-[#36b7a7]">
                          <PlatformIcon platform={post.platform} />
                        </div>

                        <div>
                          <p className="max-w-48 truncate font-medium text-slate-700">
                            {post.title}
                          </p>
                          <p className="max-w-48 truncate text-xs text-gray-400">
                            {post.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9f5ed] text-xs font-semibold text-[#269d8f]">
                          {post.brand.charAt(0).toUpperCase()}
                        </span>
                        <span>{post.brand}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f8f4] px-3 py-2 text-xs text-slate-600">
                        <PlatformIcon platform={post.platform} />
                        {post.platform}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                          post.status === "Draft"
                            ? "bg-[#fff5d9] text-[#c58b18]"
                            : "bg-[#e4f8f2] text-[#24a986]"
                        }`}
                      >
                        <span>●</span>
                        {post.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-400">
                      {post.date}
                    </td>

                    <td className="px-5 py-4">
                      {post.status === "Draft" ? (
                        <button
                          onClick={() => updateStatus(post.id, "Approved")}
                          className="whitespace-nowrap rounded-full border border-slate-300 px-4 py-2 text-xs transition hover:border-[#39b8a9] hover:text-[#269d8f]"
                        >
                          <CheckCircle2 size={13} className="mr-1 inline" />
                          Approve
                        </button>
                      ) : post.status === "Approved" ? (
                        <button
                          onClick={() => updateStatus(post.id, "Published")}
                          className="whitespace-nowrap rounded-full bg-[#39b8a9] px-4 py-2 text-xs text-white transition hover:bg-[#2da99a]"
                        >
                          <Send size={13} className="mr-1 inline" />
                          Post
                        </button>
                      ) : (
                        <span className="whitespace-nowrap rounded-full bg-[#e4f8f2] px-4 py-2 text-xs text-[#269d8f]">
                          <CheckCircle2 size={13} className="mr-1 inline" />
                          Posted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                      No posts found. Try another search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col justify-between gap-2 border-t border-[#edf2f0] px-5 py-4 text-xs text-gray-400 sm:flex-row">
            <span>
              Showing {filteredPosts.length} of {total} posts
            </span>
            <span>AI Digital Marketing Dashboard</span>
          </div>
        </section>
      </div>
    </div>
  )
}
