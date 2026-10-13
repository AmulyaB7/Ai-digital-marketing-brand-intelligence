"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useAuth, useOrganization } from "@clerk/nextjs"
import {
  Users,
  CircleCheck,
  CalendarPlus,
  Phone,
  Search,
  Plus,
  X,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react"

type Customer = {
  id: number
  customer_id: string
  customer_name: string
  email: string | null
  phone: string | null
  status: string
  created_at: string
  updated_at?: string
}

type CustomerSummary = {
  total_customers: number
  active_customers: number
  added_last_30_days: number
  customers_with_phone: number
}

type CustomerForm = {
  customer_name: string
  email: string
  phone: string
}

const emptyForm: CustomerForm = {
  customer_name: "",
  email: "",
  phone: "",
}

const API_URL = "http://localhost:3001/customers"

function formatDate(value: string) {
  if (!value) return "Date unavailable"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
}: {
  title: string
  value: string
  subtitle?: string
  icon: typeof Users
  progress?: number
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Icon className="size-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-teal-50">
          <div
            className="h-full rounded-full bg-teal-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {subtitle && (
        <p className="mt-3 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  )
}

export default function CustomersPage() {
  const { organization } = useOrganization()
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState<CustomerSummary>({
    total_customers: 0,
    active_customers: 0,
    added_last_30_days: 0,
    customers_with_phone: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadCustomers = useCallback(async () => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setCustomers([])
      setError("Please sign in to view customers.")
      setLoading(false)
      return
    }

    if (!organization?.id) {
      setCustomers([])
      setSummary({
        total_customers: 0,
        active_customers: 0,
        added_last_30_days: 0,
        customers_with_phone: 0,
      })
      setError("No organization is assigned to your session.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = await getToken()
      if (!token) throw new Error("Unable to retrieve your session token.")

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [customersResponse, summaryResponse] = await Promise.all([
        fetch(API_URL, { headers }),
        fetch(`${API_URL}/summary`, { headers }),
      ])

      if (!customersResponse.ok || !summaryResponse.ok) {
        throw new Error("Unable to load customer information.")
      }

      const customerData: Customer[] = await customersResponse.json()
      const summaryData: CustomerSummary = await summaryResponse.json()

      setCustomers(customerData)
      setSummary(summaryData)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load customers.",
      )
    } finally {
      setLoading(false)
    }
  }, [getToken, isLoaded, isSignedIn, organization?.id])

  useEffect(() => {
    void loadCustomers()
  }, [loadCustomers])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return customers

    return customers.filter((customer) =>
      [
        customer.customer_name,
        customer.email,
        customer.phone,
        customer.status,
      ].some((value) => value?.toLowerCase().includes(query)),
    )
  }, [customers, search])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, currentPage, pageSize])

  const startRow =
    filteredCustomers.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1

  const endRow = Math.min(currentPage * pageSize, filteredCustomers.length)

  const activePercentage =
    summary.total_customers > 0
      ? (summary.active_customers / summary.total_customers) * 100
      : 0

  const phonePercentage =
    summary.total_customers > 0
      ? (summary.customers_with_phone / summary.total_customers) * 100
      : 0

  const openCreateModal = () => {
    setEditingCustomer(null)
    setForm(emptyForm)
    setFormError("")
    setShowCreateModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setForm({
      customer_name: customer.customer_name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    })
    setFormError("")
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    if (saving) return
    setShowCreateModal(false)
    setEditingCustomer(null)
    setFormError("")
  }

  const updateField = (field: keyof CustomerForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmitCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    if (!organization?.id) {
      setFormError("No organization is assigned to your session.")
      return
    }

    if (!form.customer_name.trim()) {
      setFormError("Customer name is required.")
      return
    }

    const isEditing = editingCustomer !== null

    try {
      setSaving(true)

      const token = await getToken()
      if (!token) throw new Error("Please sign in again.")

      const response = await fetch(
        isEditing ? `${API_URL}/${editingCustomer.id}` : API_URL,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name: form.customer_name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
          }),
        },
      )

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof result.message === "string"
            ? result.message
            : `Failed to ${isEditing ? "update" : "create"} customer.`,
        )
      }

      setShowCreateModal(false)
      setEditingCustomer(null)
      setForm(emptyForm)
      setSearch("")
      setPage(1)

      await loadCustomers()
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? "update" : "create"} customer.`,
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return

    setDeleteError("")

    try {
      setDeleting(true)

      const token = await getToken()
      if (!token) throw new Error("Please sign in again.")

      const response = await fetch(`${API_URL}/${deletingCustomer.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof result.message === "string"
            ? result.message
            : "Failed to delete customer.",
        )
      }

      setDeletingCustomer(null)
      setDeleteError("")
      await loadCustomers()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete customer.",
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-full bg-[#f4faf8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Customer
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customers in your organization.
          </p>
        </header>

        <section
          aria-label="Customer statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            title="Customers"
            value={loading ? "—" : String(summary.total_customers)}
            icon={Users}
          />

          <SummaryCard
            title="Active"
            value={
              loading
                ? "—"
                : `${summary.active_customers} / ${summary.total_customers}`
            }
            icon={CircleCheck}
            progress={loading ? 0 : activePercentage}
          />

          <SummaryCard
            title="Added in last 30 days"
            value={loading ? "—" : String(summary.added_last_30_days)}
            icon={CalendarPlus}
          />

          <SummaryCard
            title="With phone number"
            value={
              loading
                ? "—"
                : `${summary.customers_with_phone} / ${summary.total_customers}`
            }
            icon={Phone}
            progress={loading ? 0 : phonePercentage}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                All customers
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                View and manage your organization's customers.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-600"
            >
              <Plus className="size-4" />
              Create customer
            </button>
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search customers..."
                aria-label="Search customers"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <p className="text-xs text-slate-500">
              {loading
                ? "Loading customers..."
                : `${filteredCustomers.length} customer${filteredCustomers.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
              <button
                type="button"
                onClick={() => void loadCustomers()}
                className="ml-2 font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Email
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Phone
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500">
                    Status
                  </th>
                  <th className="w-[190px] px-4 py-3 text-xs font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading customers...
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700">
                            {customer.customer_name
                              .trim()
                              .charAt(0)
                              .toUpperCase() || "C"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {customer.customer_name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {customer.customer_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {customer.email ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="size-3.5 shrink-0 text-slate-400" />
                            <span>{customer.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {customer.phone ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="size-3.5 shrink-0 text-slate-400" />
                            <span>{customer.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.status.toLowerCase() === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`mr-1.5 size-1.5 rounded-full ${
                              customer.status.toLowerCase() === "active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {customer.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditModal(customer)}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingCustomer(customer)
                              setDeleteError("")
                            }}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!loading && !error && filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <Building2 className="size-5" />
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-800">
                        {search ? "No matching customers" : "No customers yet"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {search
                          ? "Try another search term."
                          : "Create your first customer to start adding brands."}
                      </p>

                      {!search && (
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-500 px-3 py-2 text-sm font-medium text-white hover:bg-teal-600"
                        >
                          <Plus className="size-4" />
                          Create customer
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <label htmlFor="page-size">Rows</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setPage(1)
                }}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-teal-400"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span>
                {startRow}-{endRow} of {filteredCustomers.length}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs text-slate-500">
                Page {currentPage} / {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="First page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(1)}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronsLeft className="size-4" />
                </button>

                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>

                <button
                  type="button"
                  aria-label="Last page"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronsRight className="size-4" />
                </button>
              </div>
            </div>
          </footer>
        </section>
      </div>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreateModal()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-customer-title"
            className="my-auto w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2
                  id="create-customer-title"
                  className="text-base font-semibold text-slate-900"
                >
                  {editingCustomer ? "Edit customer" : "Create customer"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingCustomer
                    ? "Update this customer's details."
                    : "Add a customer for this organization. It will show in the table."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close dialog"
                disabled={saving}
                onClick={closeCreateModal}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomer}>
              <div className="space-y-4 px-5 py-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="customer-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Customer name
                  </label>

                  <input
                    id="customer-name"
                    autoFocus
                    required
                    maxLength={255}
                    value={form.customer_name}
                    onChange={(event) =>
                      updateField("customer_name", event.target.value)
                    }
                    placeholder="Enter customer name"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="customer-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="customer-email"
                    type="email"
                    maxLength={255}
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="customer@example.com"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="customer-phone"
                    className="text-sm font-medium text-slate-700"
                  >
                    Phone
                  </label>

                  <input
                    id="customer-phone"
                    type="tel"
                    maxLength={30}
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="+1 555 0100"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {formError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeCreateModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? editingCustomer
                      ? "Saving changes..."
                      : "Creating..."
                    : editingCustomer
                      ? "Save changes"
                      : "Create customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCustomer && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeletingCustomer(null)
              setDeleteError("")
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-customer-title"
            aria-describedby="delete-customer-description"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Trash2 className="size-5" />
                </div>

                <div>
                  <h2
                    id="delete-customer-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Delete customer?
                  </h2>

                  <p
                    id="delete-customer-description"
                    className="mt-2 text-sm leading-6 text-slate-600"
                  >
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-900">
                      {deletingCustomer.customer_name}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              {deleteError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {deleteError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeletingCustomer(null)
                  setDeleteError("")
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDeleteCustomer()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                {deleting ? "Deleting..." : "Delete customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}