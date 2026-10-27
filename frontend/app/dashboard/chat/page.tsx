
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  Building2,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"

type Brand = {
  id: string
  name: string
  initials: string
  description: string
  channels: string[]
}

const brands: Brand[] = [
  {
    id: "1",
    name: "Acme Digital",
    initials: "A",
    description: "Acme Corporation · Technology",
    channels: [],
  },
  {
    id: "2",
    name: "Nova Beauty",
    initials: "N",
    description: "Nova Media · Beauty",
    channels: [],
  },
  {
    id: "3",
    name: "Bright Foods",
    initials: "B",
    description: "Bright Labs · Food & Beverage",
    channels: [],
  },
  {
    id: "4",
    name: "Pixel Studio",
    initials: "P",
    description: "Pixel Works · Design",
    channels: [],
  },
  {
    id: "5",
    name: "Growth Hub",
    initials: "G",
    description: "Growth Hub · Marketing",
    channels: [],
  },
]

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "Instagram") {
    return <span className="text-base font-bold">◎</span>
  }

  if (channel === "Facebook") {
    return <span className="text-base font-bold">f</span>
  }

  return <span className="text-xs font-bold">G</span>
}

export default function ChatPage() {
  const [search, setSearch] = useState("")

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase()

    return brands.filter((brand) =>
      `${brand.name} ${brand.description}`
        .toLowerCase()
        .includes(query),
    )
  }, [search])

  const instagramCount = brands.filter((brand) =>
    brand.channels.includes("Instagram"),
  ).length

  const facebookCount = brands.filter((brand) =>
    brand.channels.includes("Facebook"),
  ).length

  const googleAdsCount = brands.filter((brand) =>
    brand.channels.includes("Google Ads"),
  ).length

  return (
    <main className="min-h-full bg-[#f5faf8] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Page heading */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ddf7ee] text-[#2eaa9c]">
                <MessageCircle size={21} />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Chat
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Choose a brand to start a conversation with your AI assistant.
            </p>
          </div>

          <span className="w-fit rounded-full border border-[#cdeee3] bg-white px-3 py-1.5 text-xs font-medium text-[#268f81]">
            <Sparkles size={13} className="mr-1 inline" />
            Powered by Groq AI
          </span>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Brands"
            value={brands.length}
            icon={<Building2 size={21} />}
          />

          <SummaryCard
            label="Instagram connected"
            value={`${instagramCount} / ${brands.length}`}
            icon={<span className="text-xl font-bold">◎</span>}
          />

          <SummaryCard
            label="Facebook connected"
            value={`${facebookCount} / ${brands.length}`}
            icon={<span className="text-xl font-bold">f</span>}
          />

          <SummaryCard
            label="Google Ads connected"
            value={`${googleAdsCount} / ${brands.length}`}
            icon={<span className="text-base font-bold">G</span>}
          />
        </section>

        {/* Brand selection */}
        <section className="overflow-hidden rounded-2xl border border-[#dcefe8] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#e5f1ed] px-5 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                Pick a brand to write for

                <span className="rounded-full bg-[#e0f7ef] px-2 py-0.5 text-xs text-[#258f80]">
                  {filteredBrands.length}
                </span>
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Each conversation will have its own brand context.
              </p>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search brands..."
                aria-label="Search brands"
                className="w-full rounded-lg border border-[#dce9e4] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#35b5a7] focus:ring-2 focus:ring-[#d5f4eb]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBrands.map((brand) => {
              const connectedCount = [
                "Instagram",
                "Facebook",
                "Google Ads",
              ].filter((channel) => brand.channels.includes(channel)).length

              return (
                <article
                  key={brand.id}
                  className="group rounded-2xl border border-[#e0eae6] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#a9e4d5] hover:shadow-md"
                >
                  {/* Brand identity */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#81e3d1] to-[#32b5a5] font-semibold text-[#135f59]">
                        {brand.initials}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {brand.name}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {brand.description}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#c9f0df] bg-[#edfcf5] px-2 py-1 text-xs text-[#23976f]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#36bd87]" />
                      Active
                    </span>
                  </div>

                  {/* Social channel indicators */}
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {["Instagram", "Facebook", "Google Ads"].map(
                        (channel) => {
                          const connected = brand.channels.includes(channel)

                          return (
                            <span
                              key={channel}
                              title={`${channel}${connected ? " connected" : " not connected"}`}
                              className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                                connected
                                  ? "border-[#b8eadd] bg-[#dff8ef] text-[#249d8d]"
                                  : "border-slate-100 bg-slate-50 text-slate-300"
                              }`}
                            >
                              <ChannelIcon channel={channel} />
                            </span>
                          )
                        },
                      )}
                    </div>

                    <span className="rounded-full bg-[#eff8f4] px-2 py-1 text-xs text-slate-500">
                      {connectedCount}/3 channels
                    </span>
                  </div>

                  {/* Open brand chat */}
                  <Link
                    href={`/dashboard/chat/${brand.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#82e5d5] px-4 py-3 text-sm font-semibold text-[#175f59] transition hover:bg-[#60d7c5] focus:outline-none focus:ring-2 focus:ring-[#35b5a7] focus:ring-offset-2"
                  >
                    <MessageCircle size={17} />
                    Start chat
                    <ArrowRight size={16} />
                  </Link>
                </article>
              )
            })}

            {filteredBrands.length === 0 && (
              <div className="col-span-full py-14 text-center">
                <Search className="mx-auto text-slate-300" size={28} />

                <p className="mt-3 font-medium">No brands found</p>

                <p className="mt-1 text-sm text-slate-500">
                  Try searching for a different brand.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <article className="rounded-2xl border border-[#dcefe8] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ddf7ee] text-[#35b5a7]">
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </article>
  )
}
