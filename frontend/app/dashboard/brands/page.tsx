"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"

type Platform = "instagram" | "facebook" | "google_ads"
type ChannelStatus = "connected" | "disconnected"

type Channel = {
  platform: Platform
  status: ChannelStatus
  external_account_id: string | null
}

type Brand = {
  id: number
  name: string
  customer_id: number
  customer_name: string
  industry: string | null
  status: string
  created_at: string
  channels: Channel[]
}

type Customer = {
  id: number
  customer_name: string
}

type Summary = {
  totalBrands: number
  instagramConnected: number
  facebookConnected: number
  googleAdsConnected: number
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const initialSummary: Summary = {
  totalBrands: 0,
  instagramConnected: 0,
  facebookConnected: 0,
  googleAdsConnected: 0,
}

const platforms: { key: Platform; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "google_ads", label: "Google Ads" },
]

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "B"
}

function getErrorMessage(result: any, fallback: string) {
  if (Array.isArray(result?.message)) {
    return result.message.join(", ")
  }

  return result?.message || fallback
}

function SummaryCard({
  title,
  value,
  total,
  icon,
  isConnection = false,
}: {
  title: string
  value: number
  total?: number
  icon: React.ReactNode
  isConnection?: boolean
}) {
  const progress =
    isConnection && total && total > 0
      ? Math.min((value / total) * 100, 100)
      : 0

  return (
    <div className="min-w-0 rounded-xl border border-[#e4eeeb] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e0f7f1] text-[#36b9a7]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-[#84938f]">{title}</p>
          <p className="mt-0.5 text-xl font-semibold text-[#263b37]">
            {value}
            {isConnection && total !== undefined && (
              <span className="ml-1 text-sm font-normal text-[#91a19c]">
                / {total}
              </span>
            )}
          </p>
        </div>
      </div>

      {isConnection && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7f3ef]">
          <div
            className="h-full rounded-full bg-[#40c3ae] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

function ChannelChip({
  label,
  platform,
  connected,
  accountId,
  disabled,
  onClick,
}: {
  label: string
  platform: Platform
  connected: boolean
  accountId: string | null
  disabled: boolean
  onClick: () => void
}) {
  const symbol =
    platform === "instagram"
      ? "◎"
      : platform === "facebook"
        ? "f"
        : "G"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={
        connected
          ? `${label} marked connected${accountId ? `: ${accountId}` : ""}. Click to disconnect.`
          : `Click to test the ${label} status control. This does not authenticate a real account.`
      }
      aria-label={`${connected ? "Disconnect" : "Test connect"} ${label}`}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition focus:outline-none focus:ring-2 focus:ring-[#39b7a7] focus:ring-offset-1 disabled:cursor-wait disabled:opacity-60 ${
        connected
          ? "border-[#a6e9dc] bg-[#83e2d4] text-[#176e63] hover:bg-[#a6e9dc]"
          : "border-[#e5eeeb] bg-[#f9fcfb] text-[#879791] hover:border-[#9bded2] hover:bg-[#eefaf6]"
      }`}
    >
      <span aria-hidden="true">{symbol}</span>
      <span className="truncate">{label}</span>
      <span aria-hidden="true">
        {disabled ? "…" : connected ? "✓" : "+"}
      </span>
    </button>
  )
}

export default function BrandsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const [brands, setBrands] = useState<Brand[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState(initialSummary)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [channelSaving, setChannelSaving] = useState<string | null>(null)

  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [search, setSearch] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  const [name, setName] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [industry, setIndustry] = useState("")
  const [status, setStatus] = useState("Active")

  const resetForm = () => {
    setName("")
    setCustomerId("")
    setIndustry("")
    setStatus("Active")
    setEditingBrand(null)
  }

  const closeModal = () => {
    if (saving || deleting) return
    setModalOpen(false)
    resetForm()
  }

  const openCreateModal = () => {
    setError("")
    setNotice("")
    resetForm()
    setModalOpen(true)
  }

  const openBrandDetails = (brand: Brand) => {
    setError("")
    setNotice("")
    setEditingBrand(brand)
    setName(brand.name)
    setCustomerId(String(brand.customer_id))
    setIndustry(brand.industry ?? "")
    setStatus(brand.status || "Active")
    setModalOpen(true)
  }

  const fetchData = useCallback(async () => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = await getToken()

      if (!token) {
        throw new Error("Your session token could not be retrieved. Please sign in again.")
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [brandsResponse, summaryResponse, customersResponse] =
        await Promise.all([
          fetch(`${API_URL}/brands`, { headers }),
          fetch(`${API_URL}/brands/summary`, { headers }),
          fetch(`${API_URL}/customers`, { headers }),
        ])

      if (!brandsResponse.ok) {
        throw new Error(`Unable to load brands (${brandsResponse.status}).`)
      }

      if (!summaryResponse.ok) {
        throw new Error(`Unable to load summary (${summaryResponse.status}).`)
      }

      if (!customersResponse.ok) {
        throw new Error(`Unable to load customers (${customersResponse.status}).`)
      }

      const [brandsData, summaryData, customersData] = await Promise.all([
        brandsResponse.json(),
        summaryResponse.json(),
        customersResponse.json(),
      ])

      setBrands(
        brandsData.map((brand: Brand) => ({
          ...brand,
          channels: Array.isArray(brand.channels) ? brand.channels : [],
        })),
      )

      setSummary(summaryData)
      setCustomers(customersData)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading brands.",
      )
    } finally {
      setLoading(false)
    }
  }, [getToken, isLoaded, isSignedIn])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return brands

    return brands.filter((brand) =>
      [
        brand.name,
        brand.customer_name,
        brand.industry ?? "",
        brand.status,
      ].some((value) => value.toLowerCase().includes(query)),
    )
  }, [brands, search])

  async function handleSubmitBrand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setNotice("")

    if (!name.trim() || !customerId) {
      setError("Brand name and customer are required.")
      return
    }

    setSaving(true)

    try {
      const token = await getToken()

      if (!token) {
        throw new Error("Your session token could not be retrieved. Please sign in again.")
      }

      const isEditing = editingBrand !== null
      const url = isEditing
        ? `${API_URL}/brands/${editingBrand.id}`
        : `${API_URL}/brands`

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          customerId: Number(customerId),
          industry: industry.trim() || null,
          ...(isEditing ? { status } : {}),
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            `Unable to ${isEditing ? "update" : "create"} brand (${response.status}).`,
          ),
        )
      }

      setModalOpen(false)
      resetForm()
      setNotice(isEditing ? "Brand updated successfully." : "Brand created successfully.")
      await fetchData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the brand.",
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBrand() {
    if (!editingBrand) return

    const confirmed = window.confirm(
      `Delete "${editingBrand.name}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    setDeleting(true)
    setError("")
    setNotice("")

    try {
      const token = await getToken()

      if (!token) {
        throw new Error("Your session token could not be retrieved. Please sign in again.")
      }

      const response = await fetch(`${API_URL}/brands/${editingBrand.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, `Unable to delete brand (${response.status}).`),
        )
      }

      const deletedName = editingBrand.name
      setModalOpen(false)
      resetForm()
      setNotice(`"${deletedName}" was deleted successfully.`)
      await fetchData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the brand.",
      )
    } finally {
      setDeleting(false)
    }
  }

  async function handleChannelStatusChange(
    brand: Brand,
    platform: Platform,
    currentStatus: ChannelStatus,
  ) {
    if (channelSaving) return

    setChannelSaving(`${brand.id}:${platform}`)
    setError("")
    setNotice("")

    try {
      const token = await getToken()

      if (!token) {
        throw new Error("Your session token could not be retrieved. Please sign in again.")
      }

      const nextStatus: ChannelStatus =
        currentStatus === "connected" ? "disconnected" : "connected"

      const response = await fetch(
        `${API_URL}/brands/${brand.id}/channels/${platform}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      )

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, `Unable to update ${platform} status (${response.status}).`),
        )
      }

      const label =
        platforms.find((item) => item.key === platform)?.label ?? platform

      setNotice(
        `${brand.name}: ${label} status saved as ${nextStatus}. This is a status test only; no real account was authenticated.`,
      )

      await fetchData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the channel.",
      )
    } finally {
      setChannelSaving(null)
    }
  }

  return (
    <div className="min-h-full bg-[#f7fbf9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#758780]">
              <span aria-hidden="true">▤</span>
              <span>/</span>
              <span className="font-medium text-[#354b44]">Brand</span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#263b35]">
              Brand
            </h1>

            <p className="mt-1 text-sm text-[#84938d]">
              Every brand carries its own profile, memory and content.
            </p>
          </div>

          <span className="hidden text-sm text-[#84938d] sm:inline">
            Marketing site
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="self-start rounded-md border border-red-200 px-3 py-1.5 font-medium hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-[#bfe9dd] bg-[#effaf6] p-3 text-sm text-[#28796b]"
          >
            {notice}
          </div>
        )}

        <section
          aria-label="Brand connection summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            title="Brands"
            value={summary.totalBrands}
            icon={<span className="text-lg">▣</span>}
          />

          <SummaryCard
            title="Instagram connected"
            value={summary.instagramConnected}
            total={summary.totalBrands}
            isConnection
            icon={<span className="text-xl">◎</span>}
          />

          <SummaryCard
            title="Facebook connected"
            value={summary.facebookConnected}
            total={summary.totalBrands}
            isConnection
            icon={<span className="text-xl font-bold">f</span>}
          />

          <SummaryCard
            title="Google Ads connected"
            value={summary.googleAdsConnected}
            total={summary.totalBrands}
            isConnection
            icon={<span className="text-lg font-semibold">G</span>}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-[#e2ece8] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#edf2ef] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#31463f]">
                  Brands
                </h2>
                <span className="rounded-full bg-[#e5f8f2] px-2 py-0.5 text-xs font-medium text-[#31a995]">
                  {loading ? "…" : brands.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#91a099]">
                Select a brand to view or update its details.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#39b7a7] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2ba797] focus:outline-none focus:ring-2 focus:ring-[#39b7a7] focus:ring-offset-2"
              >
                <span className="text-lg leading-none">+</span>
                Create brand
              </button>

              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-[#e5ece9] bg-white px-3 py-2.5 sm:w-48">
                <span aria-hidden="true" className="text-[#98a6a0]">
                  ⌕
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  aria-label="Search brands"
                  className="w-full min-w-0 bg-transparent text-sm text-[#354b44] outline-none placeholder:text-[#a3b0aa]"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e9f0ed] bg-[#fbfdfc]">
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#91a099] sm:px-6">
                    Brand
                  </th>
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#91a099]">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#91a099]">
                    Status
                  </th>
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#91a099]">
                    Channels
                  </th>
                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#91a099] sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf2ef]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-sm text-[#82918a]"
                    >
                      Loading your brands…
                    </td>
                  </tr>
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f8f2] text-xl text-[#36b6a5]">
                        ▣
                      </div>

                      <p className="mt-3 font-medium text-[#354b44]">
                        {search ? "No matching brands" : "No brands yet"}
                      </p>

                      <p className="mt-1 text-sm text-[#91a099]">
                        {search
                          ? "Try another search term."
                          : "Create a brand to see it listed here."}
                      </p>

                      {!search && (
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="mt-4 rounded-lg bg-[#39b7a7] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ba797]"
                        >
                          Create your first brand
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr
                      key={brand.id}
                      className="transition-colors hover:bg-[#fbfdfc]"
                    >
                      <td className="px-5 py-5 sm:px-6">
                        <button
                          type="button"
                          onClick={() => openBrandDetails(brand)}
                          aria-label={`View details for ${brand.name}`}
                          className="group flex items-center gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-[#39b7a7] focus:ring-offset-2"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#54d0bd] to-[#2c9f99] text-sm font-semibold text-white">
                            {getInitial(brand.name)}
                          </span>

                          <span className="min-w-0">
                            <span className="block max-w-[200px] truncate text-sm font-semibold text-[#344a43] group-hover:text-[#239d8c]">
                              {brand.name}
                            </span>
                            <span className="mt-1 block text-xs text-[#9aa7a1]">
                              Created {formatDate(brand.created_at)}
                            </span>
                          </span>
                        </button>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex max-w-[190px] items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-sm text-[#a0afa8]"
                          >
                            ▣
                          </span>
                          <span className="truncate text-xs text-[#73847c]">
                            {brand.customer_name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            brand.status === "Active"
                              ? "bg-[#e6faf2] text-[#36a981]"
                              : "bg-[#f1f3f2] text-[#7d8984]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              brand.status === "Active"
                                ? "bg-[#43c18f]"
                                : "bg-[#9aa49f]"
                            }`}
                          />
                          {brand.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex max-w-[360px] flex-wrap gap-2">
                          {platforms.map((platform) => {
                            const channel = brand.channels.find(
                              (item) => item.platform === platform.key,
                            )

                            const connected =
                              channel?.status === "connected"

                            return (
                              <ChannelChip
                                key={platform.key}
                                label={platform.label}
                                platform={platform.key}
                                connected={connected}
                                accountId={
                                  channel?.external_account_id ?? null
                                }
                                disabled={channelSaving !== null}
                                onClick={() =>
                                  void handleChannelStatusChange(
                                    brand,
                                    platform.key,
                                    channel?.status ?? "disconnected",
                                  )
                                }
                              />
                            )
                          })}
                        </div>

                        <p className="mt-2 text-[10px] text-[#a0ada7]">
                          {brand.channels.some(
                            (channel) => channel.status === "connected",
                          )
                            ? "Connected channels shown above"
                            : "No channels connected"}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-right sm:px-6">
                        <Link
                          href="/dashboard/chat"
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#39b7a7] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#2ba797]"
                        >
                          <span aria-hidden="true">▢</span>
                          Open chat
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredBrands.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-[#edf2ef] px-5 py-3 text-xs text-[#91a099] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                Showing {filteredBrands.length} of {brands.length} brands
              </span>
              <span>Brand data is saved in your organization.</span>
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#18352e]/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal()
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="brand-modal-title"
            className="my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e2ece8] bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#54d0bd] to-[#2c9f99] text-lg font-semibold text-white">
                  {getInitial(name || "Brand")}
                </div>

                <div className="min-w-0">
                  <h2
                    id="brand-modal-title"
                    className="text-xl font-semibold text-[#2b413a]"
                  >
                    {editingBrand ? "Brand details" : "Create brand"}
                  </h2>
                  <p className="mt-1 text-sm text-[#899790]">
                    {editingBrand
                      ? "View and update this brand's profile."
                      : "Set up a brand profile for your customer."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving || deleting}
                aria-label="Close dialog"
                className="rounded-lg px-2 py-1 text-xl text-[#87968f] hover:bg-[#f1f7f4] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {editingBrand && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f7fbf9] p-3">
                <div>
                  <p className="text-xs text-[#899790]">Brand status</p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      status === "Active"
                        ? "bg-[#e6faf2] text-[#36a981]"
                        : "bg-[#f1f3f2] text-[#7d8984]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        status === "Active"
                          ? "bg-[#43c18f]"
                          : "bg-[#9aa49f]"
                      }`}
                    />
                    {status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#899790]">Created</p>
                  <p className="mt-1 text-xs font-medium text-[#42574f]">
                    {formatDate(editingBrand.created_at)}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitBrand} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="brand-name"
                  className="text-sm font-medium text-[#42574f]"
                >
                  Brand name <span className="text-[#35b5a4]">*</span>
                </label>

                <input
                  id="brand-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Acme Digital"
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-[#dfe9e4] bg-white px-3.5 py-3 text-sm text-[#344a43] outline-none transition placeholder:text-[#a3afa9] focus:border-[#43bba9] focus:ring-2 focus:ring-[#43bba9]/15"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="brand-customer"
                  className="text-sm font-medium text-[#42574f]"
                >
                  Customer <span className="text-[#35b5a4]">*</span>
                </label>

                <select
                  id="brand-customer"
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[#dfe9e4] bg-white px-3.5 py-3 text-sm text-[#344a43] outline-none transition focus:border-[#43bba9] focus:ring-2 focus:ring-[#43bba9]/15"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_name}
                    </option>
                  ))}
                </select>

                {customers.length === 0 && !loading && (
                  <p className="text-xs text-[#899790]">
                    Create a customer first to associate it with this brand.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="brand-industry"
                  className="text-sm font-medium text-[#42574f]"
                >
                  Industry
                </label>

                <input
                  id="brand-industry"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="e.g. Technology"
                  maxLength={100}
                  className="w-full rounded-lg border border-[#dfe9e4] bg-white px-3.5 py-3 text-sm text-[#344a43] outline-none transition placeholder:text-[#a3afa9] focus:border-[#43bba9] focus:ring-2 focus:ring-[#43bba9]/15"
                />
              </div>

              {editingBrand && (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="brand-status"
                      className="text-sm font-medium text-[#42574f]"
                    >
                      Status
                    </label>

                    <select
                      id="brand-status"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className="w-full rounded-lg border border-[#dfe9e4] bg-white px-3.5 py-3 text-sm text-[#344a43] outline-none transition focus:border-[#43bba9] focus:ring-2 focus:ring-[#43bba9]/15"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="rounded-xl border border-[#e5eeeb] p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-[#344a43]">
                        Marketing channels
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#899790]">
                        These controls update the saved channel status only.
                        They do not authenticate real accounts.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {platforms.map((platform) => {
                        const channel = editingBrand.channels.find(
                          (item) => item.platform === platform.key,
                        )

                        return (
                          <ChannelChip
                            key={platform.key}
                            label={platform.label}
                            platform={platform.key}
                            connected={channel?.status === "connected"}
                            accountId={channel?.external_account_id ?? null}
                            disabled={channelSaving !== null || saving || deleting}
                            onClick={() =>
                              void handleChannelStatusChange(
                                editingBrand,
                                platform.key,
                                channel?.status ?? "disconnected",
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[#edf2ef] pt-5 sm:flex-row sm:items-center sm:justify-between">
                {editingBrand ? (
                  <button
                    type="button"
                    onClick={() => void handleDeleteBrand()}
                    disabled={saving || deleting || channelSaving !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Delete brand"}
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={saving || deleting}
                    onClick={closeModal}
                    className="rounded-lg border border-[#dfe9e4] px-4 py-2.5 text-sm font-medium text-[#61736b] transition hover:bg-[#f7fbf9] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || deleting || customers.length === 0}
                    className="rounded-lg bg-[#39b7a7] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2ba797] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving…"
                      : editingBrand
                        ? "Save changes"
                        : "Create brand"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}