
"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  UserRound,
  Plus,
  MessageSquare,
  PanelLeft,
} from "lucide-react"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
}

const brandNames: Record<string, string> = {
  "1": "Acme Digital",
  "2": "Nova Beauty",
  "3": "Bright Foods",
  "4": "Pixel Studio",
  "5": "Growth Hub",
}

const suggestions = [
  "Give me Instagram marketing ideas",
  "Create a social media content plan",
  "How can I improve brand awareness?",
  "Suggest captions for my next post",
]

export default function BrandChatPage() {
  const params = useParams<{ brandId: string }>()
  const brandId = params.brandId
  const brandName = brandNames[brandId] ?? "Selected brand"

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [error, setError] = useState("")

  async function handleSend(
    event?: FormEvent<HTMLFormElement>,
    suggestedMessage?: string,
  ) {
    event?.preventDefault()

    const message = (suggestedMessage ?? input).trim()

    if (!message || loading) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    }

    setMessages((previous) => [...previous, userMessage])
    setInput("")
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          brandName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Unable to get a response from the AI.",
        )
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The AI returned an empty response.")
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply,
        },
      ])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  function startNewChat() {
    if (loading) return

    setMessages([])
    setInput("")
    setError("")
  }

  return (
    <main className="flex h-[calc(100vh-100px)] min-h-[600px] overflow-hidden rounded-xl border border-[#dcefe8] bg-white text-slate-800">
      {/* Optional chat history panel */}
      {historyOpen && (
        <aside className="w-64 shrink-0 border-r border-[#e5f1ed] bg-[#f8fcfa] p-4">
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Chat history</h2>

            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              className="rounded-md p-2 hover:bg-[#eaf5f1]"
              aria-label="Close chat history"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Previous conversations will appear here when chat history is saved
            in the backend.
          </p>
        </aside>
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-[#e5f1ed] px-4 py-3">
          <Link
            href="/dashboard/chat"
            className="rounded-lg p-2 hover:bg-[#eff8f4]"
            aria-label="Back to brands"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={() => setHistoryOpen((previous) => !previous)}
            className="rounded-lg p-2 hover:bg-[#eff8f4]"
            aria-label="Toggle chat history"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ddf7ee] text-[#269b8b]">
            <Bot className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold">{brandName}</h1>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Sparkles className="h-3 w-3 text-[#269b8b]" />
              Groq AI · Brand Assistant
            </p>
          </div>

          <button
            type="button"
            onClick={startNewChat}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-[#dcefe8] px-3 py-2 text-sm hover:bg-[#eff8f4] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        {/* Conversation area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ddf7ee] text-[#269b8b]">
                <Sparkles className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-semibold">
                Let&apos;s grow {brandName}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your AI marketing assistant can help with content ideas,
                social media strategy, captions, audience engagement, and
                brand growth.
              </p>

              <div className="mt-7 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void handleSend(undefined, suggestion)}
                    disabled={loading}
                    className="rounded-xl border border-[#dcefe8] p-4 text-left text-sm transition hover:border-[#a9e4d5] hover:bg-[#f5faf8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageSquare className="mb-3 h-4 w-4 text-[#269b8b]" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ddf7ee] text-[#269b8b]">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-[#82e5d5] text-[#175f59]"
                        : "border border-[#e5f1ed] bg-[#f8fcfa]"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <UserRound className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ddf7ee] text-[#269b8b]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span>Generating a response...</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mx-auto mt-4 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <p className="font-medium">Unable to send your message</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError("")
                  setInput((previous) => previous)
                }}
                className="mt-2 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Message input */}
        <div className="border-t border-[#e5f1ed] bg-white p-4">
          <form
            onSubmit={(event) => void handleSend(event)}
            className="mx-auto flex max-w-3xl items-end gap-3"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void handleSend()
                }
              }}
              placeholder={`Message ${brandName} assistant...`}
              rows={1}
              disabled={loading}
              className="max-h-40 min-h-12 flex-1 resize-y rounded-xl border border-[#dce9e4] bg-white px-4 py-3 text-sm outline-none focus:border-[#35b5a7] focus:ring-2 focus:ring-[#d5f4eb] disabled:bg-slate-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#82e5d5] text-[#175f59] transition hover:bg-[#60d7c5] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          <p className="mt-2 text-center text-xs text-slate-400">
            AI responses can contain mistakes. Review content before publishing.
          </p>
        </div>
      </section>
    </main>
  )
}
