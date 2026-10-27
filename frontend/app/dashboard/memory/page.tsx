
"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import {
  Brain,
  Building2,
  Mic,
  Ban,
  Plus,
  Search,
  Heart,
  Package,
  RefreshCw,
  X,
  LoaderCircle,
} from "lucide-react"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

// Local testing only. Replace with verified Clerk identity
// and organization scoping before production.
const TEST_USER_ID = "mem0-test-user"

type MemoryRecord = {
  id: string
  content: string
  brand: string
  type: string
  status: string
  createdAt: string
}

type AnyRecord = Record<string, unknown>

function record(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null
    ? value as AnyRecord
    : {}
}

function getText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim()
    ? value
    : fallback
}

function getDate(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") {
    return "—"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function parseMemories(data: unknown): MemoryRecord[] {
  const payload = record(data)
  const items = Array.isArray(data)
    ? data
    : Array.isArray(payload.results)
      ? payload.results
      : Array.isArray(payload.memories)
        ? payload.memories
        : []

  return items.map((value, index) => {
    const item = record(value)
    const metadata = record(item.metadata)

    return {
      id: getText(
        typeof item.id === "string" || typeof item.id === "number"
          ? String(item.id)
          : undefined,
        `memory-${index}`,
      ),
      content: getText(
        item.memory ?? item.content ?? item.text,
        "Untitled memory",
      ),
      brand: getText(metadata.brand, "—"),
      type: getText(metadata.type, "General"),
      status: "Active",
      createdAt: getDate(item.created_at ?? item.updated_at),
    }
  })
}

const iconForType = (type: string) => {
  const value = type.toLowerCase()
  if (value.includes("voice") || value.includes("identity")) return Mic
  if (value.includes("product")) return Package
  if (value.includes("content") || value.includes("preference")) return Heart
  if (value.includes("rule") || value.includes("avoid")) return Ban
  return Brain
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [content, setContent] = useState("")
  const [brand, setBrand] = useState("")
  const [type, setType] = useState("Brand voice")
  const [notice, setNotice] = useState("")

  const loadMemories = useCallback(async (query = "") => {
    setLoading(true)
    setError("")

    try {
      const endpoint = query
        ? `${API_URL}/memories/search?userId=${encodeURIComponent(TEST_USER_ID)}&q=${encodeURIComponent(query)}`
        : `${API_URL}/memories?userId=${encodeURIComponent(TEST_USER_ID)}`

      const response = await fetch(endpoint)
      const data: unknown = await response.json()

      if (!response.ok) {
        throw new Error(`Unable to load memories (${response.status}).`)
      }

      setMemories(parseMemories(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the API.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMemories()
  }, [loadMemories])

  const brandsCount = useMemo(
    () => new Set(memories.map((memory) => memory.brand).filter((brand) => brand !== "—")).size,
    [memories],
  )

  const voiceCount = memories.filter((memory) =>
    /voice|identity/i.test(memory.type),
  ).length

  const rulesCount = memories.filter((memory) =>
    /rule|avoid/i.test(memory.type),
  ).length

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = search.trim()
    setActiveSearch(query)
    setNotice("")
    await loadMemories(query)
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim()) return

    setSaving(true)
    setError("")
    setNotice("")

    try {
      // Metadata support depends on the backend controller/service.
      // This sends content only, matching the current API.
      const response = await fetch(`${API_URL}/memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          content: content.trim(),
        }),
      })

      const result: unknown = await response.json()

      if (!response.ok) {
        const payload = record(result)
        throw new Error(
          getText(payload.message, `Unable to create memory (${response.status}).`),
        )
      }

      setContent("")
      setBrand("")
      setType("Brand voice")
      setCreateOpen(false)
      setSearch("")
      setActiveSearch("")
      setNotice("Memory submitted. Refreshing your memories…")
      await loadMemories()
      setNotice("Memory request completed.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create memory.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-full bg-[#f7fbf9] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9f6ed] text-[#29ad9f]">
              <Brain size={21} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
              <p className="text-sm text-slate-500">
                Your AI brand knowledge, all in one place.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => void loadMemories(activeSearch)} aria-label="Retry" className="shrink-0 underline">
              Retry
            </button>
          </div>
        )}

        {notice && (
          <p role="status" className="rounded-lg bg-[#e6f8f2] px-4 py-3 text-sm text-[#178b7e]">
            {notice}
          </p>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Brain size={21} />}
            label="Memories"
            value={loading ? "—" : memories.length}
            subtitle="Stored AI knowledge"
          />
          <SummaryCard
            icon={<Building2 size={21} />}
            label="Brands with memory"
            value={loading ? "—" : brandsCount}
            subtitle="Distinct brand labels"
          />
          <SummaryCard
            icon={<Mic size={21} />}
            label="Voice & identity"
            value={loading ? "—" : voiceCount}
            subtitle="Matching memory types"
          />
          <SummaryCard
            icon={<Ban size={21} />}
            label="Rules to avoid"
            value={loading ? "—" : rulesCount}
            subtitle="Matching memory types"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#dcefe8] bg-white shadow-[0_2px_8px_rgba(25,90,70,0.04)]">
          <div className="flex flex-col gap-4 border-b border-[#e3f1ec] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Memories</h2>
                <span className="rounded-full bg-[#e0f7ef] px-2.5 py-0.5 text-xs font-semibold text-[#269e8e]">
                  {loading ? "…" : memories.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Rules and facts the AI follows when writing for a brand.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => {
                  setCreateOpen(true)
                  setError("")
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#35b5a7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#269d91]"
              >
                <Plus size={17} />
                Create memory
              </button>

              <button
                onClick={() => void loadMemories(activeSearch)}
                disabled={loading}
                aria-label="Refresh memories"
                className="inline-flex items-center justify-center rounded-lg border border-[#dce9e4] px-3 py-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="border-b border-[#e3f1ec] px-5 py-4">
            <form onSubmit={handleSearch} className="relative w-full sm:ml-auto sm:max-w-sm">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search memories…"
                aria-label="Search memories"
                className="w-full rounded-lg border border-[#dce9e4] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#35b5a7] focus:ring-2 focus:ring-[#d5f4eb]"
              />
            </form>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f9fcfb] text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-5 py-4">Memory</th>
                  <th className="px-5 py-4">Brand</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle size={17} className="animate-spin" />
                        Loading memories…
                      </span>
                    </td>
                  </tr>
                ) : memories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e1f8f0] text-[#31ad9d]">
                        <Brain size={23} />
                      </div>
                      <h3 className="mt-3 font-semibold text-slate-800">
                        {activeSearch ? "No matching memories" : "No memories yet"}
                      </h3>
                      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                        {activeSearch
                          ? "Try a different search term."
                          : "Create your first memory to start building your AI brand knowledge base."}
                      </p>
                      {!activeSearch && (
                        <button
                          onClick={() => setCreateOpen(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#35b5a7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#269d91]"
                        >
                          <Plus size={16} />
                          Create memory
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  memories.map((memory) => {
                    const TypeIcon = iconForType(memory.type)

                    return (
                      <tr key={memory.id} className="border-t border-[#eaf3ef] transition hover:bg-[#f9fcfb]">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#def7ee] text-[#36b5a3]">
                              <TypeIcon size={19} />
                            </div>
                            <div className="max-w-[280px]">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {memory.content}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Memory ID: {memory.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8f5ec] text-xs font-semibold text-[#168b80]">
                              {memory.brand === "—" ? "—" : memory.brand.charAt(0).toUpperCase()}
                            </span>
                            {memory.brand}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#def7ef] px-2.5 py-1 text-xs font-medium text-[#218e80]">
                            <TypeIcon size={13} />
                            {memory.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9f0df] bg-[#edfcf5] px-2.5 py-1 text-xs font-medium text-[#23976f]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#36bd87]" />
                            {memory.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">
                          {memory.createdAt}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#e3f1ec] bg-[#fcfefd] px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{loading ? "Loading records…" : `${memories.length} ${memories.length === 1 ? "memory" : "memories"} shown`}</span>
            <span>Powered by Mem0 · Brand knowledge</span>
          </div>
        </section>
      </div>

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setCreateOpen(false)
            }
          }}
        >
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-2xl border border-[#dcefe8] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Create memory</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add knowledge for your AI brand assistant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                disabled={saving}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <label htmlFor="memory-brand" className="mt-5 block text-sm font-medium">
              Brand name (optional)
            </label>
            <input
              id="memory-brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="e.g. Acme Digital"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#35b5a7] focus:ring-2 focus:ring-[#d5f4eb]"
            />

            <label htmlFor="memory-type" className="mt-4 block text-sm font-medium">
              Memory type
            </label>
            <select
              id="memory-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#35b5a7] focus:ring-2 focus:ring-[#d5f4eb]"
            >
              <option>Brand voice</option>
              <option>Product knowledge</option>
              <option>Content preference</option>
              <option>Audience</option>
              <option>Rule to avoid</option>
              <option>General</option>
            </select>

            <label htmlFor="memory-content" className="mt-4 block text-sm font-medium">
              Memory content
            </label>
            <textarea
              id="memory-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Example: Our brand voice is friendly, clear, and professional."
              rows={4}
              maxLength={10000}
              required
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#35b5a7] focus:ring-2 focus:ring-[#d5f4eb]"
            />

            <p className="mt-2 text-xs text-slate-400">
              {content.length}/10000 characters
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !content.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#35b5a7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#269d91] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <LoaderCircle size={16} className="animate-spin" />}
                {saving ? "Saving…" : "Save memory"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle: string
}) {
  return (
    <article className="rounded-2xl border border-[#dcefe8] bg-white p-5 shadow-[0_2px_8px_rgba(25,90,70,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ddf7ee] text-[#35b5a7]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
    </article>
  )
}
