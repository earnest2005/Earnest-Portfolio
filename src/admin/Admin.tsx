import React, { useEffect, useState, useCallback } from 'react'
import { NavLink, Route, Routes, Navigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  LogOut,
  Inbox,
  Layers,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Mail,
  Clock,
  ShieldCheck,
  Eye
} from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { CFG, PROFILE } from './config'
import Form from './Form'

type R = Record<string, any>

// Map tables to friendly icons
const TABLE_ICONS: Record<string, React.ElementType> = {
  skills: Layers,
  projects: FolderGit2,
  experience: Briefcase,
  education: GraduationCap,
  certifications: Award,
  posts: BookOpen
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setLoading(true)
    setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr(error.message)
    setLoading(false)
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper p-6">
      <div className="w-full max-w-sm rounded-3xl border border-sage2/40 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-white font-head font-bold text-lg">
            EA
          </div>
          <h1 className="mt-4 font-head text-2xl font-bold text-ink">Admin Sign In</h1>
          <p className="mt-1 text-xs text-mute">Earnest Portfolio Manager CMS</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mute mb-1">
              Email
            </label>
            <input
              className="inp"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(x) => setEmail(x.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mute mb-1">
              Password
            </label>
            <input
              className="inp"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(x) => setPassword(x.target.value)}
              required
            />
          </div>

          {err && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              <AlertCircle size={15} />
              <span>{err}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-p w-full justify-center !py-2.5 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-mute hover:text-sage">
            &larr; Back to public portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}

function Toast({ m }: { m: string }) {
  if (!m) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-xs font-medium text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CheckCircle2 size={16} className="text-sage" />
      <span>{m}</span>
    </div>
  )
}

function Dash() {
  const [counts, setCounts] = useState<R>({})
  const [recent, setRecent] = useState<R[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const o: R = {}
      for (const t of [...Object.keys(CFG), 'messages']) {
        const { count } = await supabase.from(t).select('*', { count: 'exact', head: true })
        o[t] = count ?? 0
      }
      const { data } = await supabase
        .from('messages')
        .select('name, created_at, message')
        .order('created_at', { ascending: false })
        .limit(5)

      if (mounted) {
        setCounts(o)
        setRecent(data ?? [])
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-head text-2xl font-bold text-ink sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-mute">Overview of your portfolio content and messages.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Object.keys(CFG), 'messages'].map((key) => {
          const cfg = CFG[key]
          const label = cfg?.label ?? 'Messages'
          const Icon = TABLE_ICONS[key] || (key === 'messages' ? Inbox : Layers)
          const count = counts[key]

          return (
            <div
              key={key}
              className="flex items-center gap-4 rounded-2xl border border-sage2/30 bg-white p-5 shadow-sm transition-all hover:border-sage/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Icon size={22} />
              </div>
              <div>
                <p className="font-head text-2xl font-bold text-ink">
                  {loading ? '–' : count ?? 0}
                </p>
                <p className="text-xs font-medium text-mute">{label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Messages Card */}
      <div className="rounded-2xl border border-sage2/30 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-sage2/20">
          <div className="flex items-center gap-2 font-head text-base font-semibold text-ink">
            <Inbox size={18} className="text-sage" />
            <span>Recent Messages</span>
          </div>
          <Link to="/admin/messages" className="text-xs font-medium text-sage hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="mt-4 divide-y divide-sage2/20">
          {recent.length ? (
            recent.map((r, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{r.name}</p>
                  <p className="text-xs text-mute line-clamp-1">{r.message}</p>
                </div>
                <span className="text-[11px] text-mute shrink-0">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-mute">No contact messages received yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Profile({ say }: { say: (m: string) => void }) {
  const [row, setRow] = useState<R | null>(null)

  useEffect(() => {
    supabase
      .from('profile')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => setRow(data ?? {}))
  }, [])

  if (!row) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-mute">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage border-t-transparent" />
        <span>Loading profile data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ink sm:text-3xl">Profile &amp; Biography</h1>
        <p className="mt-1 text-sm text-mute">
          Manage your hero greeting, title, biography, academic summary, resume file, and social links.
        </p>
      </div>

      <div className="max-w-3xl">
        <Form
          fields={PROFILE}
          init={row}
          onSave={async (v) => {
            const { error } = await supabase.from('profile').upsert({ ...v, id: 1 })
            if (error) throw error
            say('Profile successfully updated')
          }}
        />
      </div>
    </div>
  )
}

function Manager({ table, say }: { table: string; say: (m: string) => void }) {
  const c = CFG[table]
  const [rows, setRows] = useState<R[]>([])
  const [editing, setEditing] = useState<R | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from(table).select('*').order('sort_order')
    setRows(data ?? [])
    setLoading(false)
  }, [table])

  useEffect(() => {
    setEditing(null)
    load()
  }, [load])

  const move = async (i: number, d: number) => {
    const a = rows[i],
      b = rows[i + d]
    if (!b) return
    await supabase.from(table).update({ sort_order: b.sort_order }).eq('id', a.id)
    await supabase.from(table).update({ sort_order: a.sort_order }).eq('id', b.id)
    load()
  }

  const del = async (r: R) => {
    if (!confirm('Delete this entry permanently?')) return
    const { error } = await supabase.from(table).delete().eq('id', r.id)
    say(error ? error.message : 'Entry deleted')
    load()
  }

  const save = async (v: R) => {
    const payload = { ...v }
    if (!payload.id) {
      payload.sort_order = (rows[rows.length - 1]?.sort_order ?? 0) + 1
      if (c.slug && !payload.slug) {
        payload.slug = String(payload.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }
    }
    const { error } = payload.id
      ? await supabase.from(table).update(payload).eq('id', payload.id)
      : await supabase.from(table).insert(payload)

    if (error) throw error
    say('Record saved')
    setEditing(null)
    load()
  }

  if (editing) {
    return (
      <div className="max-w-3xl space-y-6">
        <div>
          <button
            onClick={() => setEditing(null)}
            className="mb-2 text-xs font-medium text-mute hover:text-ink"
          >
            &larr; Back to {c.label} list
          </button>
          <h1 className="font-head text-2xl font-bold text-ink">
            {editing.id ? 'Edit' : 'Create New'} {c.label}
          </h1>
        </div>

        <Form
          fields={c.fields}
          init={editing}
          onSave={save}
          onCancel={() => setEditing(null)}
          pub
        />
        <p className="text-xs text-mute">
          Published items appear on the public site immediately.
          {c.slug && ' Preview by saving and opening the item from the public site.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-head text-2xl font-bold text-ink sm:text-3xl">{c.label}</h1>
          <p className="mt-1 text-sm text-mute">Manage and reorder your {c.label.toLowerCase()}.</p>
        </div>
        <button
          className="btn btn-p !py-2 !px-4 text-xs font-semibold"
          onClick={() => setEditing({ published: true })}
        >
          <Plus size={15} /> Add New {c.label}
        </button>
      </div>

      <div className="rounded-2xl border border-sage2/30 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-mute">Loading items...</div>
        ) : !rows.length ? (
          <div className="p-12 text-center text-xs text-mute">
            No entries found. Click "+ Add New {c.label}" to create one.
          </div>
        ) : (
          <div className="divide-y divide-sage2/20">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-paper/40"
              >
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label="Move up"
                    className="flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-sage2/30 hover:text-ink disabled:opacity-20"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    disabled={i === rows.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label="Move down"
                    className="flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-sage2/30 hover:text-ink disabled:opacity-20"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {r[c.title] || 'Untitled'}
                  </p>
                  {r.category && <p className="text-xs text-mute">{r.category}</p>}
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    r.published
                      ? 'bg-sage/10 text-sage border border-sage/30'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  {r.published ? 'Published' : 'Draft'}
                </span>

                {/* Action Links */}
                <div className="flex items-center gap-1">
                  {c.slug && r.published && (
                    <Link
                      to={`/${table === 'posts' ? 'blog' : 'projects'}/${r.slug}`}
                      target="_blank"
                      title="Preview on site"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-mute hover:bg-sage/10 hover:text-sage"
                    >
                      <Eye size={15} />
                    </Link>
                  )}

                  <button
                    onClick={() => setEditing(r)}
                    title="Edit record"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-mute hover:bg-sage2/30 hover:text-ink"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => del(r)}
                    title="Delete record"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-mute hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Messages({ say }: { say: (m: string) => void }) {
  const [rows, setRows] = useState<R[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows(data ?? [])
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return
    const { error } = await supabase.from('messages').delete().eq('id', id)
    say(error ? error.message : 'Message deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ink sm:text-3xl">Contact Messages</h1>
        <p className="mt-1 text-sm text-mute">Inquiries and messages submitted from the public site.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-sage2/30 bg-white p-8 text-center text-xs text-mute">
            Loading messages...
          </div>
        ) : !rows.length ? (
          <div className="rounded-2xl border border-sage2/30 bg-white p-12 text-center text-xs text-mute">
            No contact messages received yet.
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-sage2/30 bg-white p-6 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sage2/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10 text-sage text-xs font-bold">
                    {r.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{r.name}</h3>
                    <a href={`mailto:${r.email}`} className="text-xs text-sage hover:underline">
                      {r.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-mute">
                    <Clock size={12} />
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-mute hover:bg-red-50 hover:text-red-600"
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="whitespace-pre-wrap text-sm text-ink/90 leading-relaxed">{r.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [toastMessage, setToastMessage] = useState('')

  const say = (t: string) => {
    setToastMessage(t)
    setTimeout(() => setToastMessage(''), 2500)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, x) => setSession(x))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setIsAdmin(null)
    if (session) {
      supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => setIsAdmin(!!data))
    }
  }, [session])

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-xs font-medium text-mute">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage border-t-transparent" />
          <span>Verifying session...</span>
        </div>
      </div>
    )
  }

  if (!session) return <Login />

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-xs font-medium text-mute">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage border-t-transparent" />
          <span>Checking admin authorization...</span>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="max-w-md rounded-3xl border border-sage2/40 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldCheck size={24} />
          </div>
          <h2 className="mt-4 font-head text-xl font-bold text-ink">Access Restricted</h2>
          <p className="mt-2 text-xs text-mute leading-relaxed">
            This Supabase account is signed in, but is not registered in the <code>admins</code> table.
            Please consult the README for admin setup instructions.
          </p>
          <button
            className="btn btn-o mt-6 w-full justify-center"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  const NavItem = ({
    to,
    icon: Icon,
    children
  }: {
    to: string
    icon: React.ElementType
    children: React.ReactNode
  }) => (
    <NavLink
      end
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
          isActive
            ? 'bg-sage text-white shadow-sm font-semibold'
            : 'text-mute hover:bg-sage2/20 hover:text-ink'
        }`
      }
    >
      <Icon size={16} />
      <span>{children}</span>
    </NavLink>
  )

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-sage2/30 bg-white flex flex-col justify-between p-5">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage text-white font-head font-bold text-sm">
              EA
            </div>
            <div>
              <p className="font-head text-sm font-bold text-ink">EA Manager</p>
              <p className="text-[10px] text-mute">Portfolio Admin CMS</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-mute/60 mb-2">
              Overview
            </p>
            <NavItem to="/admin" icon={LayoutDashboard}>
              Dashboard
            </NavItem>
            <NavItem to="/admin/profile" icon={User}>
              Profile &amp; Bio
            </NavItem>

            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-mute/60 pt-4 mb-2">
              Collections
            </p>
            {Object.entries(CFG).map(([k, c]) => {
              const Icon = TABLE_ICONS[k] || Layers
              return (
                <NavItem key={k} to={`/admin/${k}`} icon={Icon}>
                  {c.label}
                </NavItem>
              )
            })}

            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-mute/60 pt-4 mb-2">
              Communications
            </p>
            <NavItem to="/admin/messages" icon={Inbox}>
              Messages
            </NavItem>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-1 border-t border-sage2/20 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-mute hover:bg-sage2/20 hover:text-ink transition-colors"
          >
            <ExternalLink size={15} />
            <span>View Public Site</span>
          </a>

          <button
            onClick={() => supabase.auth.signOut()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8 lg:p-10">
        <div className="mx-auto max-w-5xl">
          <Routes>
            <Route index element={<Dash />} />
            <Route path="profile" element={<Profile say={say} />} />
            <Route path="messages" element={<Messages say={say} />} />
            {Object.keys(CFG).map((k) => (
              <Route key={k} path={k} element={<Manager table={k} say={say} />} />
            ))}
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </main>

      <Toast m={toastMessage} />
    </div>
  )
}
