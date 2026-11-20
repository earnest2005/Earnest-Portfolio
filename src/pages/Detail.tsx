import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Github, ExternalLink, Calendar, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Row } from '../lib/data'

export default function Detail({ table }: { table: string }) {
  const { slug } = useParams()
  const [record, setRecord] = useState<Row | null | undefined>(undefined)

  useEffect(() => {
    supabase
      .from(table)
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => setRecord(data))
  }, [table, slug])

  if (record === undefined) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl px-6 py-16 bg-paper">
        <div className="h-6 w-20 animate-pulse rounded bg-white/[0.06] mb-8" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-white/[0.08] mb-4" />
        <div className="aspect-video w-full animate-pulse rounded-3xl bg-white/[0.05] mb-8" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-white/[0.05]" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.05]" />
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center bg-paper">
        <div className="glass-card p-8">
          <h2 className="font-head text-2xl font-bold text-ink">Item Not Found</h2>
          <p className="mt-2 text-sm text-mute">
            The requested article or project details could not be found or may have been unlisted.
          </p>
          <Link to="/" className="btn btn-p mt-6">
            <ArrowLeft size={16} /> Return to Portfolio
          </Link>
        </div>
      </div>
    )
  }

  const image = record.image_url || record.cover_url
  const content = record.details || record.content || record.description

  return (
    <div className="min-h-screen bg-paper py-12 px-6">
      <article className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-mute hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Portfolio</span>
        </Link>

        {record.category && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sage">
            <Tag size={12} />
            <span>{record.category}</span>
          </div>
        )}

        <h1 className="font-head text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
          {record.title}
        </h1>

        {record.created_at && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-mute">
            <Calendar size={13} />
            <span>{new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        )}

        {image && (
          <div className="my-8 overflow-hidden rounded-3xl border border-white/[0.08] shadow-lg bg-surface">
            <img
              src={image}
              alt={record.title}
              decoding="async"
              className="w-full object-cover max-h-[500px]"
            />
          </div>
        )}

        {record.tech && (
          <div className="mb-6 flex flex-wrap gap-2">
            {record.tech.split(',').map((t: string) => (
              <span
                key={t}
                className="rounded-lg border border-white/[0.1] bg-surface px-3 py-1 text-xs font-mono text-sage font-medium"
              >
              {t.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="glass-card p-6 sm:p-8">
          <div className="whitespace-pre-wrap leading-relaxed text-ink/90 space-y-4 text-base sm:text-lg">
            {content}
          </div>
        </div>

        {(record.github_url || record.demo_url) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {record.github_url && (
              <a
                className="btn btn-o"
                href={record.github_url}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={16} /> View Source Code
              </a>
            )}
            {record.demo_url && (
              <a
                className="btn btn-p"
                href={record.demo_url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={16} /> Open Live Demo
              </a>
            )}
          </div>
        )}
      </article>
    </div>
  )
}
