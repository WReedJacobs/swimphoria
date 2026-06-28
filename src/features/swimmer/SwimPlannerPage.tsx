import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, Circle, GripVertical } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useDrills } from '@/hooks/useDrills'
import {
  useMyPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useToggleComplete,
  type SwimmerPlan,
} from '@/hooks/useSwimmerPlans'
import { calcDifficulty, formatMeters, type PlanSet, type Intensity } from '@/lib/planDifficulty'
import { STROKES, type Stroke } from '@/types'
import { cn } from '@/lib/cn'

// ─── Week helpers ──────────────────────────────────────────────────────────

function mondayOf(d: Date): Date {
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  const m = new Date(d)
  m.setHours(0, 0, 0, 0)
  m.setDate(d.getDate() - day)
  return m
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Set builder row ───────────────────────────────────────────────────────

const INTENSITY_OPTIONS: Array<{ value: Intensity; label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
]

function newSet(): PlanSet {
  return {
    id: crypto.randomUUID(),
    drill_id: null,
    name: '',
    stroke: null,
    distance: 100,
    reps: 1,
    rest_seconds: 30,
    intensity: 'moderate',
  }
}

interface SetRowProps {
  set: PlanSet
  drillOptions: Array<{ id: string; title: string }>
  onChange: (updated: PlanSet) => void
  onDelete: () => void
}

function SetRow({ set, drillOptions, onChange, onDelete }: SetRowProps) {
  function patch<K extends keyof PlanSet>(key: K, value: PlanSet[K]) {
    onChange({ ...set, [key]: value })
  }

  function pickDrill(drillId: string) {
    const drill = drillOptions.find((d) => d.id === drillId)
    onChange({ ...set, drill_id: drillId || null, name: drill?.title ?? set.name })
  }

  return (
    <div className="grid gap-2 rounded-component border border-border bg-bg p-3">
      {/* Row 1: name + drill picker */}
      <div className="flex gap-2">
        <span className="mt-2.5 shrink-0 cursor-grab text-text-muted">
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Set name (e.g. Freestyle kick)"
            value={set.name}
            onChange={(e) => patch('name', e.target.value)}
            className="w-full rounded-component border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {drillOptions.length > 0 && (
          <select
            value={set.drill_id ?? ''}
            onChange={(e) => pickDrill(e.target.value)}
            className="rounded-component border border-border bg-surface px-2 py-2 text-xs text-text-secondary appearance-none focus:border-primary focus:outline-none"
            title="Link to drill from library"
          >
            <option value="">From library…</option>
            {drillOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Row 2: numbers + intensity + delete */}
      <div className="flex flex-wrap items-center gap-2 pl-6">
        {/* Stroke */}
        <select
          value={set.stroke ?? ''}
          onChange={(e) => patch('stroke', (e.target.value as Stroke) || null)}
          className="rounded-component border border-border bg-surface px-2 py-1.5 text-xs text-text-secondary appearance-none focus:border-primary focus:outline-none"
        >
          <option value="">Any stroke</option>
          {STROKES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>

        {/* Distance */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={25}
            step={25}
            value={set.distance}
            onChange={(e) => patch('distance', Number(e.target.value))}
            className="no-spin w-16 rounded-component border border-border bg-surface px-2 py-1.5 text-center font-mono text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-text-muted">m</span>
        </div>

        <span className="text-text-muted">×</span>

        {/* Reps */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={50}
            value={set.reps}
            onChange={(e) => patch('reps', Number(e.target.value))}
            className="no-spin w-12 rounded-component border border-border bg-surface px-2 py-1.5 text-center font-mono text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-text-muted">reps</span>
        </div>

        {/* Rest */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            step={10}
            value={set.rest_seconds}
            onChange={(e) => patch('rest_seconds', Number(e.target.value))}
            className="no-spin w-14 rounded-component border border-border bg-surface px-2 py-1.5 text-center font-mono text-sm text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-xs text-text-muted">s rest</span>
        </div>

        {/* Intensity */}
        <select
          value={set.intensity}
          onChange={(e) => patch('intensity', e.target.value as Intensity)}
          className="rounded-component border border-border bg-surface px-2 py-1.5 text-xs appearance-none focus:border-primary focus:outline-none"
          style={{
            color:
              set.intensity === 'easy'
                ? 'rgb(var(--c-secondary))'
                : set.intensity === 'hard'
                  ? 'rgb(var(--c-danger))'
                  : 'rgb(var(--c-primary))',
          }}
        >
          {INTENSITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Sub-total */}
        <span className="ml-auto font-mono text-xs text-text-muted">
          {formatMeters(set.distance * set.reps)}
        </span>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-component text-text-muted hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Difficulty display ────────────────────────────────────────────────────

function DifficultyPanel({ sets }: { sets: PlanSet[] }) {
  if (!sets.length) return null
  const d = calcDifficulty(sets)
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-component border p-3',
        d.tone === 'green' && 'border-secondary/30 bg-secondary/5',
        d.tone === 'blue' && 'border-primary/30 bg-primary/5',
        d.tone === 'amber' && 'border-accent/30 bg-accent/5',
        d.tone === 'red' && 'border-danger/30 bg-danger/5',
      )}
    >
      <Badge tone={d.tone} className="text-sm font-bold">
        {d.level}
      </Badge>
      <span className="font-mono text-sm font-semibold tabular-nums text-text-primary">
        {formatMeters(d.totalMeters)}
      </span>
      <span className="text-sm text-text-secondary">{d.description}</span>
    </div>
  )
}

// ─── Plan card (in calendar) ───────────────────────────────────────────────

function PlanCard({
  plan,
  onEdit,
  onToggle,
}: {
  plan: SwimmerPlan
  onEdit: () => void
  onToggle: () => void
}) {
  const diff = useMemo(() => calcDifficulty(plan.sets ?? []), [plan.sets])

  return (
    <div
      className={cn(
        'group relative rounded-component border p-2 text-left transition-all cursor-pointer',
        plan.completed
          ? 'border-border bg-bg opacity-60'
          : 'border-border bg-surface hover:border-primary/40',
      )}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-1">
        <p className={cn('text-xs font-medium leading-tight', plan.completed && 'line-through text-text-muted')}>
          {plan.title}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="shrink-0 mt-0.5 text-text-muted hover:text-secondary"
          title={plan.completed ? 'Mark incomplete' : 'Mark done'}
        >
          {plan.completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {plan.sets.length > 0 && (
        <div className="mt-1 flex items-center gap-1.5">
          <Badge tone={diff.tone} className="text-[9px] px-1.5 py-0">
            {diff.level}
          </Badge>
          <span className="font-mono text-[9px] text-text-muted">
            {formatMeters(diff.totalMeters)}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Plan builder modal ────────────────────────────────────────────────────

interface BuilderState {
  id: string | null
  title: string
  scheduled_date: string
  sets: PlanSet[]
  notes: string
}

function emptyBuilder(date: string): BuilderState {
  return { id: null, title: '', scheduled_date: date, sets: [], notes: '' }
}

function planToBuilder(p: SwimmerPlan): BuilderState {
  return {
    id: p.id,
    title: p.title,
    scheduled_date: p.scheduled_date,
    sets: p.sets ?? [],
    notes: p.notes ?? '',
  }
}

interface PlanModalProps {
  open: boolean
  initial: BuilderState
  onClose: () => void
}

function PlanModal({ open, initial, onClose }: PlanModalProps) {
  const { data: drills = [] } = useDrills()
  const create = useCreatePlan()
  const update = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const [draft, setDraft] = useState<BuilderState>(initial)

  // Sync when initial changes (switching between plans)
  const [prevInitial, setPrevInitial] = useState(initial)
  if (initial !== prevInitial) {
    setPrevInitial(initial)
    setDraft(initial)
  }

  function patch<K extends keyof BuilderState>(key: K, val: BuilderState[K]) {
    setDraft((s) => ({ ...s, [key]: val }))
  }

  function addSet() {
    setDraft((s) => ({ ...s, sets: [...s.sets, newSet()] }))
  }

  function updateSet(idx: number, updated: PlanSet) {
    setDraft((s) => {
      const sets = [...s.sets]
      sets[idx] = updated
      return { ...s, sets }
    })
  }

  function removeSet(idx: number) {
    setDraft((s) => ({ ...s, sets: s.sets.filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    if (!draft.title.trim() || !draft.scheduled_date) return
    const payload = {
      title: draft.title.trim(),
      scheduled_date: draft.scheduled_date,
      sets: draft.sets,
      notes: draft.notes.trim() || undefined,
    }
    if (draft.id) {
      await update.mutateAsync({ id: draft.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  async function handleDelete() {
    if (!draft.id) return
    await deletePlan.mutateAsync(draft.id)
    onClose()
  }

  const isSaving = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={draft.id ? 'Edit session' : 'Plan a session'}
      size="lg"
    >
      <div className="space-y-4">
        {/* Title + date */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Session title"
            placeholder="e.g. Sprint intervals"
            value={draft.title}
            onChange={(e) => patch('title', e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={draft.scheduled_date}
            onChange={(e) => patch('scheduled_date', e.target.value)}
          />
        </div>

        {/* Sets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">Sets</p>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={addSet}
            >
              Add set
            </Button>
          </div>

          {draft.sets.length === 0 ? (
            <button
              onClick={addSet}
              className="flex w-full items-center justify-center gap-2 rounded-component border border-dashed border-border py-6 text-sm text-text-muted transition-colors hover:border-primary/40 hover:text-text-secondary"
            >
              <Plus className="h-4 w-4" />
              Add your first set
            </button>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {draft.sets.map((set, i) => (
                <SetRow
                  key={set.id}
                  set={set}
                  drillOptions={drills.map((d) => ({ id: d.id, title: d.title }))}
                  onChange={(updated) => updateSet(i, updated)}
                  onDelete={() => removeSet(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Live difficulty */}
        {draft.sets.length > 0 && <DifficultyPanel sets={draft.sets} />}

        {/* Notes */}
        <Textarea
          label="Notes (optional)"
          rows={2}
          placeholder="Focus, goals, equipment…"
          value={draft.notes}
          onChange={(e) => patch('notes', e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-between">
          {draft.id ? (
            <Button
              variant="danger"
              size="sm"
              loading={deletePlan.isPending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              loading={isSaving}
              disabled={!draft.title.trim() || !draft.scheduled_date}
              onClick={handleSave}
            >
              {draft.id ? 'Save changes' : 'Save plan'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function SwimPlannerPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()))

  const from = toDateStr(weekStart)
  const to = toDateStr(addDays(weekStart, 6))

  const { data: plans = [] } = useMyPlans(from, to)
  const toggleComplete = useToggleComplete()

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const plansByDate = useMemo(() => {
    const map = new Map<string, SwimmerPlan[]>()
    for (const p of plans) {
      const list = map.get(p.scheduled_date) ?? []
      list.push(p)
      map.set(p.scheduled_date, list)
    }
    return map
  }, [plans])

  // Modal
  const [modal, setModal] = useState<{ open: boolean; initial: BuilderState }>({
    open: false,
    initial: emptyBuilder(toDateStr(new Date())),
  })

  const openNew = useCallback((date: string) => {
    setModal({ open: true, initial: emptyBuilder(date) })
  }, [])

  const openEdit = useCallback((plan: SwimmerPlan) => {
    setModal({ open: true, initial: planToBuilder(plan) })
  }, [])

  const today = toDateStr(new Date())

  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${addDays(weekStart, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  // Weekly summary
  const weekSummary = useMemo(() => {
    const allSets = plans.flatMap((p) => p.sets ?? [])
    const totalMeters = allSets.reduce((s, set) => s + set.distance * set.reps, 0)
    const done = plans.filter((p) => p.completed).length
    return { total: plans.length, done, totalMeters }
  }, [plans])

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Swim Planner"
        action={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => openNew(today)}
          >
            New session
          </Button>
        }
      />

      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          className="flex h-8 w-8 items-center justify-center rounded-component text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary">{weekLabel}</p>
          {weekSummary.total > 0 && (
            <p className="font-mono text-[11px] text-text-muted">
              {weekSummary.done}/{weekSummary.total} done
              {weekSummary.totalMeters > 0 && ` · ${formatMeters(weekSummary.totalMeters)} planned`}
            </p>
          )}
        </div>
        <button
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="flex h-8 w-8 items-center justify-center rounded-component text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[560px] grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dateStr = toDateStr(day)
            const isToday = dateStr === today
            const dayPlans = plansByDate.get(dateStr) ?? []

            return (
              <div key={dateStr} className="flex flex-col gap-2">
                {/* Day header */}
                <div
                  className={cn(
                    'flex flex-col items-center rounded-component py-1.5',
                    isToday ? 'bg-primary/10' : '',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-[10px] font-semibold uppercase tracking-wider',
                      isToday ? 'text-primary' : 'text-text-muted',
                    )}
                  >
                    {DAY_NAMES[i]}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-base font-bold tabular-nums',
                      isToday ? 'text-primary' : 'text-text-primary',
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Plans for this day */}
                <div className="flex flex-col gap-1.5">
                  {dayPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={() => openEdit(plan)}
                      onToggle={() =>
                        toggleComplete.mutate({ id: plan.id, completed: !plan.completed })
                      }
                    />
                  ))}

                  {/* Add button */}
                  <button
                    onClick={() => openNew(dateStr)}
                    className="flex items-center justify-center rounded-component border border-dashed border-border py-2 text-text-muted transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming sessions list */}
      {plans.length > 0 && (
        <Card>
          <CardHeader title="This week's sessions" subtitle="All planned sessions in order" />
          <div className="space-y-3">
            {plans.map((plan) => {
              const diff = calcDifficulty(plan.sets ?? [])
              return (
                <button
                  key={plan.id}
                  onClick={() => openEdit(plan)}
                  className="flex w-full items-center gap-4 rounded-component p-3 text-left transition-all hover:bg-bg"
                >
                  {/* Date */}
                  <div className="w-12 shrink-0 text-center">
                    <p className="font-mono text-[10px] uppercase text-text-muted">
                      {new Date(plan.scheduled_date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="font-mono text-lg font-black tabular-nums text-text-primary">
                      {new Date(plan.scheduled_date + 'T12:00').getDate()}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn('font-medium text-text-primary', plan.completed && 'line-through text-text-muted')}>
                        {plan.title}
                      </p>
                      {plan.completed && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                      )}
                    </div>
                    {plan.sets.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {plan.sets.slice(0, 3).map((s, i) => (
                          <span key={i} className="font-mono text-[10px] text-text-muted">
                            {s.reps > 1 ? `${s.reps}×` : ''}{s.distance}m{s.stroke ? ` ${s.stroke}` : ''}
                            {i < Math.min(plan.sets.length, 3) - 1 ? ' ·' : ''}
                          </span>
                        ))}
                        {plan.sets.length > 3 && (
                          <span className="font-mono text-[10px] text-text-muted">
                            +{plan.sets.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">No sets added yet</p>
                    )}
                  </div>

                  {/* Difficulty + distance */}
                  {plan.sets.length > 0 && (
                    <div className="shrink-0 text-right">
                      <Badge tone={diff.tone}>{diff.level}</Badge>
                      <p className="mt-1 font-mono text-xs tabular-nums text-text-muted">
                        {formatMeters(diff.totalMeters)}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {plans.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-text-muted">No sessions planned this week</p>
          <p className="mt-1 text-sm text-text-muted">Click any + button above to plan a swim</p>
        </Card>
      )}

      {/* Modal */}
      <PlanModal
        open={modal.open}
        initial={modal.initial}
        onClose={() => setModal((s) => ({ ...s, open: false }))}
      />
    </div>
  )
}
