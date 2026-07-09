import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { cn } from '@/lib/cn'
import { useSetPresets, useMySetPresets, useDeletePreset } from '@/hooks/useSetPresets'
import { useAuth } from '@/hooks/useAuth'
import {
  presetTotalMeters,
  presetPattern,
  renderRest,
  CATEGORY_LABELS,
  LEVEL_LABELS,
  type SetPreset,
  type PresetCategory,
  type PresetLevel,
} from '@/lib/presetUtils'
import type { CatalogPreset } from '@/lib/presetUtils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SetPickerProps {
  open: boolean
  onClose: () => void
  /** Called when the user taps "Insert" on a preset. */
  onInsert?: (preset: SetPreset | CatalogPreset) => void
  /** Pre-select a category filter on open. */
  defaultCategory?: PresetCategory
  /** Pre-select a level filter on open. */
  defaultLevel?: PresetLevel
  /** Swimmer's CSS pace_per_100 for personalised interval rendering. */
  cssPacePer100?: number | null
  /** Hides the Insert button — for read-only browsing (beginner surface). */
  readOnly?: boolean
  /** Opens the SavePresetModal for creating a new preset (My Sets tab). */
  onSaveNew?: () => void
  /** Opens the SavePresetModal pre-filled for editing an existing preset. */
  onEdit?: (preset: SetPreset) => void
}

// ─── Level badge tones ────────────────────────────────────────────────────────

type BadgeTone = 'coral' | 'blue' | 'green' | 'gray'

const LEVEL_TONE: Record<PresetLevel, BadgeTone> = {
  beginner:     'coral',
  intermediate: 'blue',
  elite:        'green',
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as PresetCategory[]
const LEVELS: PresetLevel[] = ['beginner', 'intermediate', 'elite']

// ─── Preset card ─────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  cssPacePer100,
  onInsert,
  onDelete,
  onEdit,
  readOnly,
}: {
  preset: SetPreset
  cssPacePer100?: number | null
  onInsert?: () => void
  onDelete?: () => void
  onEdit?: () => void
  readOnly?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [inserted, setInserted] = useState(false)

  const totalM = presetTotalMeters(preset)
  const pattern = presetPattern(preset)
  const restStr = renderRest(preset, cssPacePer100)
  const isMine = preset.owner_id !== null

  function handleInsert() {
    onInsert?.()
    setInserted(true)
    setTimeout(() => setInserted(false), 1200)
  }

  return (
    <div className="rounded-component border border-border bg-bg">
      <div className="flex items-start gap-3 p-3">
        {/* Level dot */}
        <span
          className={cn(
            'mt-1 h-2 w-2 shrink-0 rounded-full',
            preset.level === 'beginner' && 'bg-coral',
            preset.level === 'intermediate' && 'bg-primary',
            preset.level === 'elite' && 'bg-secondary',
          )}
        />

        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug text-text-primary">{preset.title}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              {isMine && onEdit && (
                <button
                  onClick={onEdit}
                  className="text-xs text-text-muted hover:text-text-secondary"
                >
                  Edit
                </button>
              )}
              {isMine && onDelete && (
                <button
                  onClick={onDelete}
                  className="rounded p-0.5 text-text-muted hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete preset"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Pattern + rest */}
          <p className="mt-0.5 font-mono text-xs text-text-secondary">
            {pattern}
            {restStr ? <span className="text-text-muted"> · {restStr}</span> : null}
            {totalM > 0 && (
              <span className="ml-2 text-text-muted">{totalM}m</span>
            )}
          </p>

          {/* Equipment + category badges */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Badge tone={LEVEL_TONE[preset.level]}>{LEVEL_LABELS[preset.level]}</Badge>
            <Badge tone="gray">{CATEGORY_LABELS[preset.category]}</Badge>
            {preset.equipment.map((eq) => (
              <Badge key={eq} tone="gray">{eq}</Badge>
            ))}
          </div>

          {/* Expandable description */}
          {preset.description && (
            <button
              onClick={() => setExpanded((x) => !x)}
              className="mt-1.5 flex items-center gap-0.5 text-[11px] text-text-muted hover:text-text-secondary"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {expanded ? 'Hide' : 'Coach note'}
            </button>
          )}
          {expanded && (
            <p className="mt-1 text-xs italic text-text-secondary">{preset.description}</p>
          )}
        </div>

        {/* Insert button */}
        {!readOnly && onInsert && (
          <Button
            size="sm"
            variant={inserted ? 'secondary' : 'primary'}
            onClick={handleInsert}
            className="shrink-0 text-xs"
          >
            {inserted ? '✓' : 'Insert'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── SetPicker modal ──────────────────────────────────────────────────────────

export function SetPicker({
  open,
  onClose,
  onInsert,
  defaultCategory,
  defaultLevel,
  cssPacePer100,
  readOnly = false,
  onSaveNew,
  onEdit,
}: SetPickerProps) {
  const { user } = useAuth()
  const { data: allPresets = [], isLoading } = useSetPresets()
  const { data: myPresets = [] } = useMySetPresets()
  const deletePreset = useDeletePreset()

  const [tab, setTab] = useState<'library' | 'mine'>('library')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<PresetCategory | null>(defaultCategory ?? null)
  const [levelFilter, setLevelFilter] = useState<PresetLevel | null>(defaultLevel ?? null)

  const libraryPresets = useMemo(
    () => allPresets.filter((p) => p.owner_id === null),
    [allPresets],
  )

  const source = tab === 'library' ? libraryPresets : myPresets

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return source.filter((p) => {
      if (catFilter && p.category !== catFilter) return false
      if (levelFilter && p.level !== levelFilter) return false
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
        return false
      return true
    })
  }, [source, catFilter, levelFilter, search])

  function handleDelete(preset: SetPreset) {
    if (!confirm(`Delete "${preset.title}"?`)) return
    deletePreset.mutate(preset.id)
  }

  const showSaveNew = !readOnly && user && onSaveNew

  return (
    <Modal open={open} onClose={onClose} title="Set library" size="lg">
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex gap-0 rounded-component border border-border bg-bg p-0.5">
          {[
            { id: 'library' as const, label: 'Library' },
            { id: 'mine' as const, label: `My sets${myPresets.length ? ` (${myPresets.length})` : ''}` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex-1 rounded-[calc(var(--r-component)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
                tab === id
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search sets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-component border border-border bg-bg py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filter chips */}
        <div className="space-y-1.5">
          {/* Category */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCatFilter(null)}
              className={cn(
                'rounded-[3px] border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
                catFilter === null
                  ? 'border-primary/30 bg-primary/10 text-primary-dark'
                  : 'border-border bg-bg text-text-muted hover:text-text-secondary',
              )}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat === catFilter ? null : cat)}
                className={cn(
                  'rounded-[3px] border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
                  catFilter === cat
                    ? 'border-primary/30 bg-primary/10 text-primary-dark'
                    : 'border-border bg-bg text-text-muted hover:text-text-secondary',
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Level */}
          <div className="flex gap-1">
            {LEVELS.map((lv) => (
              <button
                key={lv}
                onClick={() => setLevelFilter(lv === levelFilter ? null : lv)}
                className={cn(
                  'rounded-[3px] border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
                  levelFilter === lv
                    ? lv === 'beginner'
                      ? 'border-coral/30 bg-coral/10 text-coral'
                      : lv === 'intermediate'
                        ? 'border-primary/30 bg-primary/10 text-primary-dark'
                        : 'border-secondary/30 bg-secondary/10 text-secondary'
                    : 'border-border bg-bg text-text-muted hover:text-text-secondary',
                )}
              >
                {LEVEL_LABELS[lv]}
              </button>
            ))}
          </div>
        </div>

        {/* My Sets header */}
        {tab === 'mine' && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {myPresets.length === 0
                ? 'Sets you save will appear here'
                : `${filtered.length} of ${myPresets.length} sets`}
            </p>
            {showSaveNew && (
              <Button size="sm" variant="ghost" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={onSaveNew}>
                New preset
              </Button>
            )}
          </div>
        )}

        {/* List */}
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-text-muted">Loading sets…</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              {tab === 'mine' && myPresets.length === 0
                ? 'No saved presets yet'
                : 'No sets match your filters'}
            </p>
          ) : (
            filtered.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                cssPacePer100={cssPacePer100}
                onInsert={onInsert ? () => onInsert(preset) : undefined}
                onDelete={preset.owner_id !== null ? () => handleDelete(preset) : undefined}
                onEdit={preset.owner_id !== null && onEdit ? () => onEdit(preset) : undefined}
                readOnly={readOnly}
              />
            ))
          )}
        </div>

        {/* Footer count */}
        {tab === 'library' && !isLoading && filtered.length > 0 && (
          <p className="text-right text-[11px] text-text-muted">
            {filtered.length} of {libraryPresets.length} sets
          </p>
        )}
      </div>
    </Modal>
  )
}
