import { useState } from 'react'
import { uploadFile } from '../lib/supabase'
import { SKILL_CATS, type F } from './config'
import { UploadCloud, FileText, Check, AlertCircle, Loader2 } from 'lucide-react'

export default function Form({
  fields,
  init,
  onSave,
  onCancel,
  pub
}: {
  fields: F[]
  init: Record<string, any>
  onSave: (v: Record<string, any>) => Promise<void>
  onCancel?: () => void
  pub?: boolean
}) {
  const [values, setValues] = useState<Record<string, any>>(init)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const handleFileUpload = async (key: string, file?: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setErr('File must be smaller than 10 MB')
      return
    }

    setBusy(true)
    setUploadingField(key)
    setErr('')

    try {
      setValues((s) => ({ ...s, [key]: '' }))
      const url = await uploadFile(file, key)
      setValues((s) => ({ ...s, [key]: url }))
    } catch (e: any) {
      setErr(e.message || 'File upload failed')
    } finally {
      setBusy(false)
      setUploadingField(null)
    }
  }

  const handleSave = async (published?: boolean) => {
    setErr('')
    const firstField = fields[0]
    if (!values[firstField.k]?.toString().trim()) {
      setErr(`${firstField.l} is required`)
      return
    }

    setBusy(true)
    try {
      await onSave(published === undefined ? values : { ...values, published })
    } catch (e: any) {
      setErr(e.message || 'Failed to save record')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-surface p-6 shadow-sm sm:p-8">
      {err && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span>{err}</span>
        </div>
      )}

      <div className="grid gap-5">
        {fields.map((f) => {
          const val = values[f.k] ?? ''
          const isUploading = uploadingField === f.k

          return (
            <div key={f.k} className="space-y-1.5">
              <label htmlFor={f.k} className="block text-xs font-semibold uppercase tracking-wider text-textSec">
                {f.l}
              </label>

              {f.t === 'area' ? (
                <textarea
                  id={f.k}
                  rows={4}
                  className="inp font-sans"
                  value={val}
                  onChange={(e) => setValues({ ...values, [f.k]: e.target.value })}
                  placeholder={`Enter ${f.l.toLowerCase()}...`}
                />
              ) : f.t === 'cat' ? (
                <select
                  id={f.k}
                  className="inp cursor-pointer"
                  value={val}
                  onChange={(e) => setValues({ ...values, [f.k]: e.target.value })}
                >
                  <option value="">Select category...</option>
                  {SKILL_CATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : f.t === 'kind' ? (
                <select
                  id={f.k}
                  className="inp cursor-pointer"
                  value={val || 'Certification'}
                  onChange={(e) => setValues({ ...values, [f.k]: e.target.value })}
                >
                  <option value="Certification">Certification</option>
                  <option value="Achievement">Achievement</option>
                </select>
              ) : f.t === 'image' || f.t === 'file' ? (
                <div className="space-y-2">
                  {val && f.t === 'image' && (
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-surfaceAlt p-2">
                      <div
                        className="h-16 w-16 rounded-lg overflow-hidden border border-white/[0.1] bg-paper flex items-center justify-center shrink-0"
                        style={
                          f.k === 'photo_url'
                            ? {
                                WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 75%)',
                                maskImage: 'radial-gradient(circle at center, black 60%, transparent 75%)'
                              }
                            : {}
                        }
                      >
                        <img
                          src={val}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <span className="block truncate text-xs text-mute font-mono">{val}</span>
                        <span className="text-[11px] text-sage font-medium">Uploaded image</span>
                      </div>
                    </div>
                  )}

                  {f.k === 'photo_url' && (
                    <p className="text-[11px] text-mute leading-relaxed">
                      This photo is used in the opening animation and the hero section. A portrait with a dark or transparent background works best.
                    </p>
                  )}

                  {val && f.t === 'file' && (
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-surfaceAlt p-2.5">
                      <FileText size={20} className="text-sage" />
                      <a
                        href={val}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs font-medium text-sage hover:underline"
                      >
                        View uploaded document &rarr;
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/[0.14] bg-surfaceAlt px-4 py-2.5 text-xs font-medium text-ink transition-colors hover:border-sage hover:bg-sage/10">
                      {isUploading ? (
                        <Loader2 size={15} className="animate-spin text-sage" />
                      ) : (
                        <UploadCloud size={15} className="text-sage" />
                      )}
                      <span>
                        {isUploading
                          ? 'Compressing & uploading...'
                          : f.t === 'image'
                          ? 'Upload Image (PNG, JPG, WebP)'
                          : 'Upload PDF (max 10MB)'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept={f.t === 'image' ? 'image/*' : 'application/pdf'}
                        onChange={(e) => handleFileUpload(f.k, e.target.files?.[0])}
                        disabled={busy}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <input
                  id={f.k}
                  className="inp"
                  value={val}
                  onChange={(e) => setValues({ ...values, [f.k]: e.target.value })}
                  placeholder={`Enter ${f.l.toLowerCase()}...`}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-white/[0.08] pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleSave(pub ? true : undefined)}
          className="btn btn-p"
        >
          {busy ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>{pub ? 'Save & Publish' : 'Save Changes'}</span>
            </>
          )}
        </button>

        {pub && (
          <button
            type="button"
            disabled={busy}
            onClick={() => handleSave(false)}
            className="btn btn-o"
          >
            Save as Draft
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
